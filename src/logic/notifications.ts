// Local reminder notifications. Everything here is defensive and no-ops on web
// (used for previews) or when the notifications module/permissions are absent,
// so the rest of the app never has to care whether reminders are available.

import { Platform } from 'react-native';
import { DoseSchedule } from './scheduling';
import { addMonths, toISODate } from './dates';

let Notifications: any = null;
function getModule() {
  if (Platform.OS === 'web') return null;
  if (!Notifications) {
    try {
      Notifications = require('expo-notifications');
      Notifications.setNotificationHandler?.({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });
    } catch {
      Notifications = null;
    }
  }
  return Notifications;
}

/** Ask for permission; returns true if granted. */
export async function requestPermission(): Promise<boolean> {
  const N = getModule();
  if (!N) return false;
  try {
    const settings = await N.getPermissionsAsync();
    if (settings.granted) return true;
    const req = await N.requestPermissionsAsync();
    return !!req.granted;
  } catch {
    return false;
  }
}

/**
 * Reschedule all reminders: one local notification `leadDays` before each
 * not-yet-completed dose's due date, for doses due in the future.
 */
export async function rescheduleReminders(
  childName: string,
  schedule: DoseSchedule[],
  leadDays: number
): Promise<void> {
  const N = getModule();
  if (!N) return;
  try {
    await N.cancelAllScheduledNotificationsAsync();
    const now = new Date();
    const pending = schedule
      .filter((s) => s.status === 'dueSoon' || s.status === 'upcoming')
      .slice(0, 30); // keep well under OS scheduled-notification limits

    for (const item of pending) {
      const fire = addMonths(item.dueDate, 0);
      fire.setDate(fire.getDate() - leadDays);
      if (fire.getTime() <= now.getTime()) continue;
      await N.scheduleNotificationAsync({
        content: {
          title: `${childName}'s vaccine coming up`,
          body: `${item.vaccine.name} — ${item.dose.label} is recommended around ${toISODate(item.dueDate)}.`,
        },
        trigger: { type: 'date', date: fire },
      });
    }
  } catch {
    // Reminders are best-effort; never surface scheduling errors to the user.
  }
}

export async function cancelAllReminders(): Promise<void> {
  const N = getModule();
  if (!N) return;
  try {
    await N.cancelAllScheduledNotificationsAsync();
  } catch {
    /* no-op */
  }
}
