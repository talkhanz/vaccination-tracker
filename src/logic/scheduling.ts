// The scheduling engine. Given a child's birth date and the doses the parent
// has recorded, it computes — for every dose in the CDC schedule — whether it
// is completed, overdue, due soon, or upcoming, plus the recommended due date.

import { CDC_SCHEDULE, Vaccine, VaccineDose } from '../data/schedule';
import { Child, DoseRecord } from '../data/types';
import { addMonths, daysBetween, parseISO, today } from './dates';

export type DoseStatus = 'completed' | 'overdue' | 'dueSoon' | 'upcoming';

/** How many days ahead of the due date we start calling a dose "due soon". */
export const DUE_SOON_WINDOW_DAYS = 45;

export interface DoseSchedule {
  vaccine: Vaccine;
  dose: VaccineDose;
  status: DoseStatus;
  /** birthDate + dose.recommendedAgeMonths. */
  dueDate: Date;
  /** Days from today until dueDate; negative means it is past due. */
  daysUntilDue: number;
  /** The matching recorded dose, when completed. */
  record?: DoseRecord;
}

function matchRecord(
  records: DoseRecord[],
  vaccineId: string,
  doseNumber: number
): DoseRecord | undefined {
  return records.find(
    (r) => r.vaccineId === vaccineId && r.doseNumber === doseNumber
  );
}

function statusFor(
  record: DoseRecord | undefined,
  daysUntilDue: number
): DoseStatus {
  if (record) return 'completed';
  if (daysUntilDue < 0) return 'overdue';
  if (daysUntilDue <= DUE_SOON_WINDOW_DAYS) return 'dueSoon';
  return 'upcoming';
}

/** Compute the full, flat list of dose schedules for a child. */
export function computeSchedule(
  child: Child,
  records: DoseRecord[],
  activeVaccineIds?: string[]
): DoseSchedule[] {
  const birth = parseISO(child.birthDate);
  const t = today();
  const out: DoseSchedule[] = [];
  const active = activeVaccineIds ? new Set(activeVaccineIds) : null;

  for (const vaccine of CDC_SCHEDULE) {
    if (active && !active.has(vaccine.id)) continue;
    for (const dose of vaccine.doses) {
      const dueDate = addMonths(birth, dose.recommendedAgeMonths);
      const record = matchRecord(records, vaccine.id, dose.doseNumber);
      const daysUntilDue = daysBetween(t, dueDate);
      out.push({
        vaccine,
        dose,
        record,
        dueDate,
        daysUntilDue,
        status: statusFor(record, daysUntilDue),
      });
    }
  }
  return out;
}

export interface ScheduleSummary {
  total: number;
  completed: number;
  overdue: number;
  dueSoon: number;
  upcoming: number;
  /** 0–100. */
  completionPct: number;
  /** Soonest not-yet-completed dose, if any. */
  nextUp?: DoseSchedule;
}

export function summarize(schedule: DoseSchedule[]): ScheduleSummary {
  const completed = schedule.filter((s) => s.status === 'completed').length;
  const overdue = schedule.filter((s) => s.status === 'overdue').length;
  const dueSoon = schedule.filter((s) => s.status === 'dueSoon').length;
  const upcoming = schedule.filter((s) => s.status === 'upcoming').length;

  const pending = schedule
    .filter((s) => s.status !== 'completed')
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  // "Next up" is the soonest future/current dose; prefer the first not-overdue,
  // but if everything pending is overdue, surface the most recently missed.
  const nextUp =
    pending.find((s) => s.daysUntilDue >= 0) ?? pending[pending.length - 1];

  return {
    total: schedule.length,
    completed,
    overdue,
    dueSoon,
    upcoming,
    completionPct:
      schedule.length === 0
        ? 0
        : Math.round((completed / schedule.length) * 100),
    nextUp,
  };
}

export interface VaccineProgress {
  vaccine: Vaccine;
  completedDoses: number;
  totalDoses: number;
  /** The most urgent status among this vaccine's pending doses. */
  headlineStatus: DoseStatus;
  doses: DoseSchedule[];
}

const STATUS_PRIORITY: Record<DoseStatus, number> = {
  overdue: 0,
  dueSoon: 1,
  upcoming: 2,
  completed: 3,
};

/** Group a flat schedule by vaccine, for the Schedule screen. */
export function groupByVaccine(schedule: DoseSchedule[]): VaccineProgress[] {
  const byId = new Map<string, DoseSchedule[]>();
  for (const item of schedule) {
    const arr = byId.get(item.vaccine.id) ?? [];
    arr.push(item);
    byId.set(item.vaccine.id, arr);
  }

  const groups: VaccineProgress[] = [];
  for (const doses of byId.values()) {
    const sorted = [...doses].sort((a, b) => a.dose.doseNumber - b.dose.doseNumber);
    const completedDoses = sorted.filter((d) => d.status === 'completed').length;
    const headlineStatus = sorted
      .map((d) => d.status)
      .sort((a, b) => STATUS_PRIORITY[a] - STATUS_PRIORITY[b])[0];
    groups.push({
      vaccine: sorted[0].vaccine,
      completedDoses,
      totalDoses: sorted.length,
      headlineStatus,
      doses: sorted,
    });
  }

  // Surface vaccines that need attention first.
  return groups.sort(
    (a, b) => STATUS_PRIORITY[a.headlineStatus] - STATUS_PRIORITY[b.headlineStatus]
  );
}

export interface AgeBand {
  key: string;
  label: string;
  /** inclusive lower bound in months */
  minMonths: number;
  /** exclusive upper bound in months */
  maxMonths: number;
}

/** Age bands mirror how the CDC schedule chart is laid out. */
export const AGE_BANDS: AgeBand[] = [
  { key: 'birth', label: 'Birth', minMonths: 0, maxMonths: 1 },
  { key: '1-6mo', label: '1–6 months', minMonths: 1, maxMonths: 7 },
  { key: '7-11mo', label: '7–11 months', minMonths: 7, maxMonths: 12 },
  { key: '12-23mo', label: '12–23 months', minMonths: 12, maxMonths: 24 },
  { key: '2-3yr', label: '2–3 years', minMonths: 24, maxMonths: 48 },
  { key: '4-6yr', label: '4–6 years', minMonths: 48, maxMonths: 84 },
  { key: '7-10yr', label: '7–10 years', minMonths: 84, maxMonths: 132 },
  { key: '11-12yr', label: '11–12 years', minMonths: 132, maxMonths: 156 },
  { key: '13-18yr', label: '13–18 years', minMonths: 156, maxMonths: 999 },
];

export interface TimelineBand {
  band: AgeBand;
  doses: DoseSchedule[];
}

/** Group a flat schedule into age bands, for a timeline view. */
export function groupByAgeBand(schedule: DoseSchedule[]): TimelineBand[] {
  return AGE_BANDS.map((band) => ({
    band,
    doses: schedule
      .filter(
        (s) =>
          s.dose.recommendedAgeMonths >= band.minMonths &&
          s.dose.recommendedAgeMonths < band.maxMonths
      )
      .sort((a, b) => a.dose.recommendedAgeMonths - b.dose.recommendedAgeMonths),
  })).filter((b) => b.doses.length > 0);
}
