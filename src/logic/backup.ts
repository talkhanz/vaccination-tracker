// Backup & restore. Exports all on-device data to a single JSON file the parent
// can save (Files, iCloud, email, AirDrop…) and re-import later — so records
// survive an app/cache clear or moving to a new phone. Native modules are
// lazy-required and web uses the browser download/upload APIs, so nothing here
// breaks the web bundle.

import { Platform } from 'react-native';
import {
  Child,
  DoseRecord,
  PlannedByChild,
  PlannedDoses,
  Settings,
  DEFAULT_SETTINGS,
} from '../data/types';
import { AppData } from '../storage/store';
import { toISODate } from './dates';

/** Bumped to 2 for multi-child support; schema-1 (single child) still imports. */
export const BACKUP_SCHEMA = 2;

interface BackupFile extends AppData {
  app: 'vaccinator';
  schema: number;
  exportedAt: string;
}

function buildBackup(data: AppData): BackupFile {
  return {
    app: 'vaccinator',
    schema: BACKUP_SCHEMA,
    exportedAt: new Date().toISOString(),
    ...data,
  };
}

export type ExportResult = 'shared' | 'downloaded' | 'unavailable';

/** Write a backup file and hand it to the share sheet (native) or download it (web). */
export async function exportBackup(data: AppData): Promise<ExportResult> {
  const json = JSON.stringify(buildBackup(data), null, 2);
  const filename = `vaccinator-backup-${toISODate(new Date())}.json`;

  if (Platform.OS === 'web') {
    const g = globalThis as any;
    const blob = new g.Blob([json], { type: 'application/json' });
    const url = g.URL.createObjectURL(blob);
    const a = g.document.createElement('a');
    a.href = url;
    a.download = filename;
    g.document.body.appendChild(a);
    a.click();
    g.document.body.removeChild(a);
    g.URL.revokeObjectURL(url);
    return 'downloaded';
  }

  const FileSystem = require('expo-file-system/legacy');
  const Sharing = require('expo-sharing');
  const uri = FileSystem.cacheDirectory + filename;
  await FileSystem.writeAsStringAsync(uri, json);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/json',
      UTI: 'public.json',
      dialogTitle: 'Save your Vaccinator backup',
    });
    return 'shared';
  }
  return 'unavailable';
}

function mergeSettings(raw: unknown): Settings {
  return raw && typeof raw === 'object'
    ? { ...DEFAULT_SETTINGS, ...(raw as Settings) }
    : DEFAULT_SETTINGS;
}

/** Convert an old single-child (schema 1) backup into the multi-child shape. */
function migrateSchema1(o: Record<string, unknown>): AppData {
  const settings = mergeSettings(o.settings);
  const child = o.child && typeof o.child === 'object' ? ({ ...(o.child as Child) }) : null;
  const legacyActive = (o.settings as any)?.activeVaccineIds;
  if (child && legacyActive && !child.activeVaccineIds) child.activeVaccineIds = legacyActive;

  if (!child) {
    return { children: [], selectedChildId: null, records: [], plannedByChild: {}, settings };
  }
  const rawRecords = Array.isArray(o.records) ? (o.records as DoseRecord[]) : [];
  const records = rawRecords.map((r) => ({ ...r, childId: r.childId ?? child.id }));
  const plannedByChild: PlannedByChild = {
    [child.id]: (o.plannedDates && typeof o.plannedDates === 'object'
      ? (o.plannedDates as PlannedDoses)
      : {}),
  };
  return {
    children: [child],
    selectedChildId: child.id,
    records,
    plannedByChild,
    settings: { remindersEnabled: settings.remindersEnabled, reminderLeadDays: settings.reminderLeadDays },
  };
}

/** Validate untrusted JSON into AppData, throwing friendly errors. */
export function validateBackup(raw: unknown): AppData {
  if (!raw || typeof raw !== 'object') throw new Error('This file is not a valid backup.');
  const o = raw as Record<string, unknown>;
  if (o.app !== 'vaccinator') throw new Error("This doesn't look like a Vaccinator backup file.");

  const schema = typeof o.schema === 'number' ? o.schema : 1;
  if (schema > BACKUP_SCHEMA) {
    throw new Error('This backup was made by a newer version of the app. Please update first.');
  }
  if (schema <= 1) return migrateSchema1(o);

  // Schema 2 (multi-child).
  if (!Array.isArray(o.children)) throw new Error('This backup is missing its children.');
  if (!Array.isArray(o.records)) throw new Error('This backup is missing its dose records.');
  const children = o.children as Child[];
  const records = o.records as DoseRecord[];
  const plannedByChild =
    o.plannedByChild && typeof o.plannedByChild === 'object'
      ? (o.plannedByChild as PlannedByChild)
      : {};
  let selectedChildId =
    typeof o.selectedChildId === 'string' ? (o.selectedChildId as string) : null;
  if (!selectedChildId || !children.some((c) => c.id === selectedChildId)) {
    selectedChildId = children[0]?.id ?? null;
  }
  return { children, selectedChildId, records, plannedByChild, settings: mergeSettings(o.settings) };
}

/**
 * Let the parent pick a backup file and return its validated contents.
 * Returns null if they cancel; throws with a friendly message if the file is bad.
 */
export async function pickBackup(): Promise<AppData | null> {
  const DocumentPicker = require('expo-document-picker');
  const res = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });
  if (res.canceled || !res.assets || res.assets.length === 0) return null;

  const uri = res.assets[0].uri as string;
  let text: string;
  if (Platform.OS === 'web') {
    const g = globalThis as any;
    text = await (await g.fetch(uri)).text();
  } else {
    const FileSystem = require('expo-file-system/legacy');
    text = await FileSystem.readAsStringAsync(uri);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("This file isn't valid JSON — it may be corrupted.");
  }
  return validateBackup(parsed);
}
