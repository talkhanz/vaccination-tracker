// Backup & restore. Exports all on-device data to a single JSON file the parent
// can save (Files, iCloud, email, AirDrop…) and re-import later — so records
// survive an app/cache clear or moving to a new phone. Native modules are
// lazy-required and web uses the browser download/upload APIs, so nothing here
// breaks the web bundle.

import { Platform } from 'react-native';
import {
  Child,
  DoseRecord,
  PlannedDoses,
  Settings,
  DEFAULT_SETTINGS,
} from '../data/types';
import { toISODate } from './dates';

export const BACKUP_SCHEMA = 1;

/** The exact payload written to / read from a backup file. */
export interface BackupData {
  child: Child | null;
  records: DoseRecord[];
  plannedDates: PlannedDoses;
  settings: Settings;
}

interface BackupFile extends BackupData {
  app: 'vaccinator';
  schema: number;
  exportedAt: string;
}

function buildBackup(data: BackupData): BackupFile {
  return {
    app: 'vaccinator',
    schema: BACKUP_SCHEMA,
    exportedAt: new Date().toISOString(),
    ...data,
  };
}

export type ExportResult = 'shared' | 'downloaded' | 'unavailable';

/** Write a backup file and hand it to the share sheet (native) or download it (web). */
export async function exportBackup(data: BackupData): Promise<ExportResult> {
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

/** Validate untrusted JSON into a BackupData, throwing friendly errors. */
export function validateBackup(raw: unknown): BackupData {
  if (!raw || typeof raw !== 'object') throw new Error('This file is not a valid backup.');
  const o = raw as Record<string, unknown>;
  if (o.app !== 'vaccinator') throw new Error("This doesn't look like a Vaccinator backup file.");
  if (typeof o.schema !== 'number' || o.schema > BACKUP_SCHEMA) {
    throw new Error('This backup was made by a newer version of the app. Please update first.');
  }
  if (!Array.isArray(o.records)) throw new Error('This backup is missing its dose records.');

  const child = o.child && typeof o.child === 'object' ? (o.child as Child) : null;
  const plannedDates =
    o.plannedDates && typeof o.plannedDates === 'object'
      ? (o.plannedDates as PlannedDoses)
      : {};
  const settings =
    o.settings && typeof o.settings === 'object'
      ? ({ ...DEFAULT_SETTINGS, ...(o.settings as Settings) })
      : DEFAULT_SETTINGS;

  return { child, records: o.records as DoseRecord[], plannedDates, settings };
}

/**
 * Let the parent pick a backup file and return its validated contents.
 * Returns null if they cancel; throws with a friendly message if the file is bad.
 */
export async function pickBackup(): Promise<BackupData | null> {
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
