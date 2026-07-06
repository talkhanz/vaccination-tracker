// Small, dependency-free date helpers. We work with ISO date strings
// (yyyy-mm-dd) everywhere so data serializes cleanly to storage.

/** Parse an ISO date (yyyy-mm-dd) into a local Date at midnight. */
export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** Format a Date as an ISO date string (yyyy-mm-dd), local time. */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Today at local midnight. */
export function today(): Date {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

/** Add whole months to a date, clamping day-of-month overflow. */
export function addMonths(date: Date, months: number): Date {
  const d = new Date(date.getFullYear(), date.getMonth() + months, date.getDate());
  return d;
}

/** Whole days between two dates (b - a). Positive if b is later. */
export function daysBetween(a: Date, b: Date): number {
  const MS = 24 * 60 * 60 * 1000;
  return Math.round((b.getTime() - a.getTime()) / MS);
}

/** Age in whole months from birth to `at` (defaults to today). */
export function ageInMonths(birthDate: Date, at: Date = today()): number {
  let months =
    (at.getFullYear() - birthDate.getFullYear()) * 12 +
    (at.getMonth() - birthDate.getMonth());
  if (at.getDate() < birthDate.getDate()) months -= 1;
  return Math.max(0, months);
}

/** Human-friendly age label, e.g. "3 mo", "1 yr 2 mo", "5 days". */
export function formatAge(birthDate: Date, at: Date = today()): string {
  const days = daysBetween(birthDate, at);
  if (days < 0) return 'not born yet';
  if (days < 31) return `${days} day${days === 1 ? '' : 's'} old`;
  const totalMonths = ageInMonths(birthDate, at);
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (years === 0) return `${months} mo old`;
  if (months === 0) return `${years} yr old`;
  return `${years} yr ${months} mo old`;
}

/** Nicely formatted calendar date, e.g. "Mar 4, 2025". */
export function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Relative phrasing for a due date vs today, e.g. "in 3 weeks", "2 months ago". */
export function formatRelative(target: Date, from: Date = today()): string {
  const days = daysBetween(from, target);
  const abs = Math.abs(days);
  const future = days >= 0;
  let phrase: string;
  if (abs === 0) phrase = 'today';
  else if (abs < 14) phrase = `${abs} day${abs === 1 ? '' : 's'}`;
  else if (abs < 60) phrase = `${Math.round(abs / 7)} weeks`;
  else if (abs < 730) phrase = `${Math.round(abs / 30)} months`;
  else phrase = `${Math.round(abs / 365)} years`;
  if (abs === 0) return 'today';
  return future ? `in ${phrase}` : `${phrase} ago`;
}
