// App-wide state. Loads persisted data once, tracks the list of children and
// which one is selected, and exposes the selected child's derived schedule to
// every screen. All mutations funnel through here so UI and storage never drift.

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Child,
  DoseRecord,
  PlannedByChild,
  PlannedDoses,
  Settings,
  DEFAULT_SETTINGS,
} from '../data/types';
import {
  AppData,
  clearAll as clearAllStorage,
  loadAppData,
  restoreAll as restoreAllStorage,
  savePlannedByChild,
  saveChildren,
  saveRecords,
  saveSelectedChildId,
  saveSettings as saveSettingsStorage,
} from '../storage/store';
import {
  computeSchedule,
  doseKey,
  DoseSchedule,
  ScheduleSummary,
  summarize,
} from '../logic/scheduling';
import { defaultActiveVaccineIds } from '../data/vaccineMeta';
import { TERMS_VERSION } from '../data/terms';

/** A child paired with their computed schedule (used for reminders). */
export interface ChildSchedule {
  child: Child;
  schedule: DoseSchedule[];
}

interface AppState {
  loading: boolean;

  // Terms of Use gate
  termsAccepted: boolean;
  acceptTerms: () => Promise<void>;

  // Children
  children: Child[];
  child: Child | null; // the currently selected child
  selectedChildId: string | null;
  selectChild: (id: string) => Promise<void>;
  addChild: (child: Child) => Promise<void>;
  saveChild: (child: Child) => Promise<void>;
  deleteChild: (id: string) => Promise<void>;

  // Selected child's derived data
  records: DoseRecord[];
  schedule: DoseSchedule[];
  summary: ScheduleSummary | null;
  activeVaccineIds: string[];
  plannedDates: PlannedDoses;

  // Every child's schedule, for cross-child reminders
  allSchedules: ChildSchedule[];

  settings: Settings;

  upsertRecord: (record: DoseRecord) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  saveSettings: (settings: Settings) => Promise<void>;
  /** Book (iso) or clear (null) a planned appointment date for the selected child. */
  setPlannedDate: (vaccineId: string, doseNumber: number, iso: string | null) => Promise<void>;
  /** Snapshot of all data (every child) for exporting a backup. */
  buildBackupData: () => AppData;
  /** Replace all data from an imported backup. */
  restoreFromBackup: (data: AppData) => Promise<void>;
  resetEverything: () => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children: node }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [allRecords, setAllRecords] = useState<DoseRecord[]>([]);
  const [plannedByChild, setPlannedByChild] = useState<PlannedByChild>({});
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    (async () => {
      const data = await loadAppData();
      setChildren(data.children);
      setSelectedChildId(data.selectedChildId);
      setAllRecords(data.records);
      setPlannedByChild(data.plannedByChild);
      setSettings(data.settings);
      setLoading(false);
    })();
  }, []);

  const child = useMemo(
    () => children.find((c) => c.id === selectedChildId) ?? null,
    [children, selectedChildId]
  );

  // ---- Children mutations --------------------------------------------------

  const selectChild = useCallback(async (id: string) => {
    setSelectedChildId(id);
    await saveSelectedChildId(id);
  }, []);

  const addChild = useCallback(async (next: Child) => {
    setChildren((prev) => {
      const list = [...prev, next];
      saveChildren(list);
      return list;
    });
    setSelectedChildId(next.id);
    await saveSelectedChildId(next.id);
  }, []);

  const saveChild = useCallback(async (next: Child) => {
    setChildren((prev) => {
      const idx = prev.findIndex((c) => c.id === next.id);
      const list = idx >= 0 ? prev.map((c) => (c.id === next.id ? next : c)) : [...prev, next];
      saveChildren(list);
      return list;
    });
  }, []);

  const deleteChild = useCallback(
    async (id: string) => {
      const remainingChildren = children.filter((c) => c.id !== id);
      const remainingRecords = allRecords.filter((r) => r.childId !== id);
      const nextPlanned = { ...plannedByChild };
      delete nextPlanned[id];
      const nextSelected =
        selectedChildId === id ? remainingChildren[0]?.id ?? null : selectedChildId;

      setChildren(remainingChildren);
      setAllRecords(remainingRecords);
      setPlannedByChild(nextPlanned);
      setSelectedChildId(nextSelected);

      await Promise.all([
        saveChildren(remainingChildren),
        saveRecords(remainingRecords),
        savePlannedByChild(nextPlanned),
        saveSelectedChildId(nextSelected),
      ]);
    },
    [children, allRecords, plannedByChild, selectedChildId]
  );

  // ---- Records / planned / settings ---------------------------------------

  const upsertRecord = useCallback(
    async (record: DoseRecord) => {
      // Ensure the record is attached to the selected child.
      const withChild: DoseRecord = {
        ...record,
        childId: record.childId || selectedChildId || '',
      };
      setAllRecords((prev) => {
        const idx = prev.findIndex((r) => r.id === withChild.id);
        const list = idx >= 0 ? prev.map((r) => (r.id === withChild.id ? withChild : r)) : [...prev, withChild];
        saveRecords(list);
        return list;
      });
    },
    [selectedChildId]
  );

  const deleteRecord = useCallback(async (id: string) => {
    setAllRecords((prev) => {
      const list = prev.filter((r) => r.id !== id);
      saveRecords(list);
      return list;
    });
  }, []);

  const saveSettings = useCallback(async (next: Settings) => {
    await saveSettingsStorage(next);
    setSettings(next);
  }, []);

  const termsAccepted = settings.termsAcceptedVersion === TERMS_VERSION;

  const acceptTerms = useCallback(async () => {
    setSettings((prev) => {
      const next = { ...prev, termsAcceptedVersion: TERMS_VERSION };
      saveSettingsStorage(next);
      return next;
    });
  }, []);

  const setPlannedDate = useCallback(
    async (vaccineId: string, doseNumber: number, iso: string | null) => {
      if (!selectedChildId) return;
      setPlannedByChild((prev) => {
        const forChild = { ...(prev[selectedChildId] ?? {}) };
        const k = doseKey(vaccineId, doseNumber);
        if (iso) forChild[k] = iso;
        else delete forChild[k];
        const next = { ...prev, [selectedChildId]: forChild };
        savePlannedByChild(next);
        return next;
      });
    },
    [selectedChildId]
  );

  const buildBackupData = useCallback(
    (): AppData => ({
      children,
      selectedChildId,
      records: allRecords,
      plannedByChild,
      settings,
    }),
    [children, selectedChildId, allRecords, plannedByChild, settings]
  );

  const restoreFromBackup = useCallback(async (data: AppData) => {
    await restoreAllStorage(data);
    setChildren(data.children);
    setSelectedChildId(data.selectedChildId);
    setAllRecords(data.records);
    setPlannedByChild(data.plannedByChild);
    setSettings(data.settings);
  }, []);

  const resetEverything = useCallback(async () => {
    await clearAllStorage();
    setChildren([]);
    setSelectedChildId(null);
    setAllRecords([]);
    setPlannedByChild({});
    setSettings(DEFAULT_SETTINGS);
  }, []);

  // ---- Selected child's derived data --------------------------------------

  const records = useMemo(
    () => allRecords.filter((r) => r.childId === selectedChildId),
    [allRecords, selectedChildId]
  );

  const activeVaccineIds = useMemo(
    () => child?.activeVaccineIds ?? defaultActiveVaccineIds(),
    [child]
  );

  const plannedDates = useMemo(
    () => (selectedChildId ? plannedByChild[selectedChildId] ?? {} : {}),
    [plannedByChild, selectedChildId]
  );

  const schedule = useMemo(
    () => (child ? computeSchedule(child, records, activeVaccineIds, plannedDates) : []),
    [child, records, activeVaccineIds, plannedDates]
  );

  const summary = useMemo(() => (child ? summarize(schedule) : null), [child, schedule]);

  // Every child's schedule — used to schedule reminders across all children.
  const allSchedules = useMemo<ChildSchedule[]>(
    () =>
      children.map((c) => ({
        child: c,
        schedule: computeSchedule(
          c,
          allRecords.filter((r) => r.childId === c.id),
          c.activeVaccineIds ?? defaultActiveVaccineIds(),
          plannedByChild[c.id] ?? {}
        ),
      })),
    [children, allRecords, plannedByChild]
  );

  const value: AppState = {
    loading,
    termsAccepted,
    acceptTerms,
    children,
    child,
    selectedChildId,
    selectChild,
    addChild,
    saveChild,
    deleteChild,
    records,
    schedule,
    summary,
    activeVaccineIds,
    plannedDates,
    allSchedules,
    settings,
    upsertRecord,
    deleteRecord,
    saveSettings,
    setPlannedDate,
    buildBackupData,
    restoreFromBackup,
    resetEverything,
  };

  return <AppContext.Provider value={value}>{node}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
