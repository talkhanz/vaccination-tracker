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
}

/**
 * Planned (booked) appointment dates for doses not yet administered, keyed by
 * `${vaccineId}:${doseNumber}` → ISO date. Lets a parent schedule a future
 * appointment on the timeline; cleared automatically once the dose is recorded.
 */
export type PlannedDoses = Record<string, string>;

/** A single administered dose recorded by the parent. */
export interface DoseRecord {
  id: string;
  vaccineId: string;
  /** Which dose in the series this record satisfies (1-based). */
  doseNumber: number;
  /** ISO date string (yyyy-mm-dd) the dose was given. */
  dateAdministered: string;
  provider?: string;
  lotNumber?: string;
  notes?: string;
}

/** Whether the parent wants reminder notifications, and how far ahead. */
export interface Settings {
  remindersEnabled: boolean;
  /** How many days before a due date to send a reminder. */
  reminderLeadDays: number;
  /**
   * Which vaccines are tracked for this child. Undefined means "use the
   * default set" (resolved from vaccineMeta) so existing data upgrades cleanly.
   */
  activeVaccineIds?: string[];
}

export const DEFAULT_SETTINGS: Settings = {
  remindersEnabled: false,
  reminderLeadDays: 7,
};
