// Local reminder notifications. Everything here is defensive and no-ops on web
// (used for previews) or when the notifications module/permissions are absent,
// so the rest of the app never has to care whether reminders are available.

import { Platform } from 'react-native';
import { DoseSchedule, effectiveDate } from './scheduling';
import { toISODate } from './dates';

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

/** One child's name paired with their schedule, for reminder scheduling. */
export interface ReminderChild {
  childName: string;
  schedule: DoseSchedule[];
}

/**
 * Reschedule all reminders across every child: one local notification
 * `leadDays` before each not-yet-completed dose's due (or booked) date.
 */
export async function rescheduleReminders(
  entries: ReminderChild[],
  leadDays: number
): Promise<void> {
  const N = getModule();
  if (!N) return;
  try {
    await N.cancelAllScheduledNotificationsAsync();
    const now = new Date();
    let scheduled = 0;
    const LIMIT = 60; // keep well under OS scheduled-notification limits

    for (const { childName, schedule } of entries) {
      const pending = schedule.filter((s) => s.status === 'dueSoon' || s.status === 'upcoming');
      for (const item of pending) {
        if (scheduled >= LIMIT) return;
        // Remind ahead of the booked appointment if there is one, else the due date.
        const target = effectiveDate(item);
        const fire = new Date(target.getTime());
        fire.setDate(fire.getDate() - leadDays);
        if (fire.getTime() <= now.getTime()) continue;
        await N.scheduleNotificationAsync({
          content: {
            title: `${childName}'s vaccine coming up`,
            body: item.plannedDate
              ? `${item.vaccine.name} — ${item.dose.label} appointment on ${toISODate(target)}.`
              : `${item.vaccine.name} — ${item.dose.label} is recommended around ${toISODate(target)}.`,
          },
          trigger: { type: 'date', date: fire },
        });
        scheduled += 1;
      }
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
