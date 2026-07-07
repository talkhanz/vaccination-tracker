// On-device persistence via AsyncStorage. Everything stays on the phone —
// no accounts, no network, fully private. This module is the single source of
// truth for the children list, their dose records, planned appointments, and
// app settings, and it migrates data saved by the older single-child version.

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Child,
  DoseRecord,
  PlannedByChild,
  PlannedDoses,
  Settings,
  DEFAULT_SETTINGS,
} from '../data/types';

const KEYS = {
  children: 'vx.children',
  selected: 'vx.selectedChild',
  records: 'vx.records',
  planned: 'vx.planned',
  settings: 'vx.settings',
  // Legacy single-child key, migrated on first load.
  legacyChild: 'vx.child',
};

/** Simple id generator that doesn't need a native crypto dependency. */
export function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** The full persisted state, loaded/saved as one bundle. */
export interface AppData {
  children: Child[];
  selectedChildId: string | null;
  records: DoseRecord[];
  plannedByChild: PlannedByChild;
  settings: Settings;
}

const EMPTY: AppData = {
  children: [],
  selectedChildId: null,
  records: [],
  plannedByChild: {},
  settings: DEFAULT_SETTINGS,
};

async function readJSON<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : fallback;
}

/**
 * Load everything, migrating a legacy single-child layout the first time.
 * Legacy layout: vx.child (a Child), vx.records (no childId), vx.planned (a flat
 * PlannedDoses), and vx.settings.activeVaccineIds.
 */
export async function loadAppData(): Promise<AppData> {
  const childrenRaw = await AsyncStorage.getItem(KEYS.children);
  const settings = await readJSON<Settings>(KEYS.settings, DEFAULT_SETTINGS);

  if (childrenRaw) {
    const children = JSON.parse(childrenRaw) as Child[];
    const records = await readJSON<DoseRecord[]>(KEYS.records, []);
    const plannedByChild = await readJSON<PlannedByChild>(KEYS.planned, {});
    let selectedChildId = await AsyncStorage.getItem(KEYS.selected);
    if (!selectedChildId || !children.some((c) => c.id === selectedChildId)) {
      selectedChildId = children[0]?.id ?? null;
    }
    return {
      children,
      selectedChildId,
      records,
      plannedByChild,
      settings: { ...DEFAULT_SETTINGS, ...settings },
    };
  }

  // --- Migrate from the single-child layout, if present ---
  const legacyChildRaw = await AsyncStorage.getItem(KEYS.legacyChild);
  if (legacyChildRaw) {
    const legacyChild = JSON.parse(legacyChildRaw) as Child;
    if (settings.activeVaccineIds && !legacyChild.activeVaccineIds) {
      legacyChild.activeVaccineIds = settings.activeVaccineIds;
    }
    const legacyRecords = await readJSON<DoseRecord[]>(KEYS.records, []);
    const legacyPlanned = await readJSON<PlannedDoses>(KEYS.planned, {});
    const migrated: AppData = {
      children: [legacyChild],
      selectedChildId: legacyChild.id,
      records: legacyRecords.map((r) => ({ ...r, childId: r.childId ?? legacyChild.id })),
      plannedByChild: { [legacyChild.id]: legacyPlanned },
      settings: { remindersEnabled: settings.remindersEnabled, reminderLeadDays: settings.reminderLeadDays },
    };
    await persistAll(migrated);
    await AsyncStorage.removeItem(KEYS.legacyChild);
    return migrated;
  }

  return EMPTY;
}

async function persistAll(data: AppData): Promise<void> {
  const pairs: [string, string][] = [
    [KEYS.children, JSON.stringify(data.children)],
    [KEYS.records, JSON.stringify(data.records)],
    [KEYS.planned, JSON.stringify(data.plannedByChild)],
    [KEYS.settings, JSON.stringify(data.settings)],
  ];
  await AsyncStorage.multiSet(pairs);
  if (data.selectedChildId) await AsyncStorage.setItem(KEYS.selected, data.selectedChildId);
  else await AsyncStorage.removeItem(KEYS.selected);
}

// ---- Granular savers -------------------------------------------------------

export async function saveChildren(children: Child[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.children, JSON.stringify(children));
}

export async function saveSelectedChildId(id: string | null): Promise<void> {
  if (id) await AsyncStorage.setItem(KEYS.selected, id);
  else await AsyncStorage.removeItem(KEYS.selected);
}

export async function saveRecords(records: DoseRecord[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.records, JSON.stringify(records));
}

export async function savePlannedByChild(planned: PlannedByChild): Promise<void> {
  await AsyncStorage.setItem(KEYS.planned, JSON.stringify(planned));
}

export async function saveSettings(settings: Settings): Promise<void> {
  await AsyncStorage.setItem(KEYS.settings, JSON.stringify(settings));
}

// ---- Restore / danger zone -------------------------------------------------

export async function restoreAll(data: AppData): Promise<void> {
  await persistAll(data);
}

export async function clearAll(): Promise<void> {
  await AsyncStorage.multiRemove([
    KEYS.children,
    KEYS.selected,
    KEYS.records,
    KEYS.planned,
    KEYS.settings,
    KEYS.legacyChild,
  ]);
}
