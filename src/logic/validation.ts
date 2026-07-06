import { parseISO, toISODate, today } from './dates';

/** True when s is a real yyyy-mm-dd calendar date. */
export function isValidISODate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = parseISO(s);
  return !isNaN(d.getTime()) && toISODate(d) === s;
}

/** Birth date must be a real date, not in the future, and within ~25 years. */
export function isValidBirthDate(s: string): boolean {
  if (!isValidISODate(s)) return false;
  const d = parseISO(s);
  const t = today();
  if (d.getTime() > t.getTime()) return false;
  const earliest = new Date(t.getFullYear() - 25, t.getMonth(), t.getDate());
  return d.getTime() >= earliest.getTime();
}

/** A dose can't be recorded in the future or before the child was born. */
export function isValidDoseDate(s: string, birthDate: string): boolean {
  if (!isValidISODate(s)) return false;
  const d = parseISO(s);
  const t = today();
  if (d.getTime() > t.getTime()) return false;
  if (isValidISODate(birthDate) && d.getTime() < parseISO(birthDate).getTime())
    return false;
  return true;
}
