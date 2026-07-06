// App-wide state. Loads persisted data once, exposes it plus the computed
// schedule to every screen, and funnels all mutations through one place so the
// UI and storage never drift apart.

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Child, DoseRecord, Settings, DEFAULT_SETTINGS } from '../data/types';
import {
  clearAll as clearAllStorage,
  deleteRecord as deleteRecordStorage,
  getChild,
  getRecords,
  getSettings,
  saveChild as saveChildStorage,
  saveSettings as saveSettingsStorage,
  upsertRecord as upsertRecordStorage,
} from '../storage/store';
import {
  computeSchedule,
  DoseSchedule,
  ScheduleSummary,
  summarize,
} from '../logic/scheduling';
import { defaultActiveVaccineIds } from '../data/vaccineMeta';

interface AppState {
  loading: boolean;
  child: Child | null;
  records: DoseRecord[];
  settings: Settings;
  schedule: DoseSchedule[];
  summary: ScheduleSummary | null;
  activeVaccineIds: string[];

  saveChild: (child: Child) => Promise<void>;
  upsertRecord: (record: DoseRecord) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  saveSettings: (settings: Settings) => Promise<void>;
  resetEverything: () => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children: node }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [child, setChild] = useState<Child | null>(null);
  const [records, setRecords] = useState<DoseRecord[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    (async () => {
      const [c, r, s] = await Promise.all([
        getChild(),
        getRecords(),
        getSettings(),
      ]);
      setChild(c);
      setRecords(r);
      setSettings(s);
      setLoading(false);
    })();
  }, []);

  const saveChild = useCallback(async (next: Child) => {
    await saveChildStorage(next);
    setChild(next);
  }, []);

  const upsertRecord = useCallback(async (record: DoseRecord) => {
    const next = await upsertRecordStorage(record);
    setRecords(next);
  }, []);

  const deleteRecord = useCallback(async (id: string) => {
    const next = await deleteRecordStorage(id);
    setRecords(next);
  }, []);

  const saveSettings = useCallback(async (next: Settings) => {
    await saveSettingsStorage(next);
    setSettings(next);
  }, []);

  const resetEverything = useCallback(async () => {
    await clearAllStorage();
    setChild(null);
    setRecords([]);
    setSettings(DEFAULT_SETTINGS);
  }, []);

  // Which vaccines to track — the parent's selection, or the sensible default.
  const activeVaccineIds = useMemo(
    () => settings.activeVaccineIds ?? defaultActiveVaccineIds(),
    [settings.activeVaccineIds]
  );

  // Recompute the schedule whenever the child, records, or selection change.
  const schedule = useMemo(
    () => (child ? computeSchedule(child, records, activeVaccineIds) : []),
    [child, records, activeVaccineIds]
  );
  const summary = useMemo(
    () => (child ? summarize(schedule) : null),
    [child, schedule]
  );

  const value: AppState = {
    loading,
    child,
    records,
    settings,
    schedule,
    summary,
    activeVaccineIds,
    saveChild,
    upsertRecord,
    deleteRecord,
    saveSettings,
    resetEverything,
  };

  return <AppContext.Provider value={value}>{node}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
