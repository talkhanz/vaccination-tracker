// Core data model for the app.
// The CDC schedule types (Vaccine / VaccineDose) live in schedule.ts.

/** A child whose immunizations are being tracked. */
export interface Child {
  id: string;
  name: string;
  /** ISO date string (yyyy-mm-dd) of birth. */
  birthDate: string;
  /** Optional — some vaccines have sex-specific notes, but not required. */
  sex?: 'female' | 'male' | 'unspecified';
  /** Avatar color (hex) so siblings are easy to tell apart. */
  color?: string;
  /**
   * Which vaccines are tracked for this child. Undefined means "use the default
   * set" (resolved from vaccineMeta). Per-child because e.g. rotavirus product
   * or MenB choices differ between siblings.
   */
  activeVaccineIds?: string[];
}

/**
 * Planned (booked) appointment dates for doses not yet administered, keyed by
 * `${vaccineId}:${doseNumber}` → ISO date. Lets a parent schedule a future
 * appointment on the timeline; cleared automatically once the dose is recorded.
 */
export type PlannedDoses = Record<string, string>;

/** Planned appointment dates for every child, keyed by child id. */
export type PlannedByChild = Record<string, PlannedDoses>;

/** A single administered dose recorded by the parent. */
export interface DoseRecord {
  id: string;
  /** Which child this dose belongs to. */
  childId: string;
  vaccineId: string;
  /** Which dose in the series this record satisfies (1-based). */
  doseNumber: number;
  /** ISO date string (yyyy-mm-dd) the dose was given. */
  dateAdministered: string;
  provider?: string;
  lotNumber?: string;
  notes?: string;
}

/** App-wide preferences (not specific to one child). */
export interface Settings {
  remindersEnabled: boolean;
  /** How many days before a due date to send a reminder. */
  reminderLeadDays: number;
  /**
   * Legacy single-child vaccine selection. Kept only so old data / backups can
   * migrate onto the child; no longer written. See Child.activeVaccineIds.
   */
  activeVaccineIds?: string[];
}

export const DEFAULT_SETTINGS: Settings = {
  remindersEnabled: false,
  reminderLeadDays: 7,
};
