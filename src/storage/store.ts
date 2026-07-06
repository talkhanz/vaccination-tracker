// On-device persistence via AsyncStorage. Everything stays on the phone —
// no accounts, no network, fully private. This module is the single source of
// truth for reading/writing the child, dose records, and settings.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Child, DoseRecord, Settings, DEFAULT_SETTINGS } from '../data/types';

const KEYS = {
  child: 'vx.child',
  records: 'vx.records',
  settings: 'vx.settings',
};

/** Simple id generator that doesn't need a native crypto dependency. */
export function makeId(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}

// ---- Child -----------------------------------------------------------------

export async function getChild(): Promise<Child | null> {
  const raw = await AsyncStorage.getItem(KEYS.child);
  return raw ? (JSON.parse(raw) as Child) : null;
}

export async function saveChild(child: Child): Promise<void> {
  await AsyncStorage.setItem(KEYS.child, JSON.stringify(child));
}

// ---- Dose records ----------------------------------------------------------

export async function getRecords(): Promise<DoseRecord[]> {
  const raw = await AsyncStorage.getItem(KEYS.records);
  return raw ? (JSON.parse(raw) as DoseRecord[]) : [];
}

async function saveRecords(records: DoseRecord[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.records, JSON.stringify(records));
}

export async function upsertRecord(record: DoseRecord): Promise<DoseRecord[]> {
  const records = await getRecords();
  const idx = records.findIndex((r) => r.id === record.id);
  if (idx >= 0) records[idx] = record;
  else records.push(record);
  await saveRecords(records);
  return records;
}

export async function deleteRecord(id: string): Promise<DoseRecord[]> {
  const records = (await getRecords()).filter((r) => r.id !== id);
  await saveRecords(records);
  return records;
}

// ---- Settings --------------------------------------------------------------

export async function getSettings(): Promise<Settings> {
  const raw = await AsyncStorage.getItem(KEYS.settings);
  return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Settings): Promise<void> {
  await AsyncStorage.setItem(KEYS.settings, JSON.stringify(settings));
}

// ---- Danger zone -----------------------------------------------------------

export async function clearAll(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.child, KEYS.records, KEYS.settings]);
}
