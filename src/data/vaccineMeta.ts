// The raw CDC dataset lists every vaccine, including mutually-exclusive product
// variants (RV1 vs RV5) and vaccines given by shared clinical decision-making
// (MenB) or on a decennial adult cadence (Td). Counting all of them would skew
// a young child's "progress". This overlay marks which vaccines are active by
// default and groups exclusive variants, while letting the parent adjust.

export interface VaccineMeta {
  /** Exclusive-choice group; only one member is active at a time. */
  group?: string;
  /** Whether this vaccine is part of the tracked series unless changed. */
  defaultActive: boolean;
  /** Short reason shown next to a toggle in the manage screen. */
  hint?: string;
}

export const VACCINE_META: Record<string, VaccineMeta> = {
  hepb: { defaultActive: true },
  rv5: { defaultActive: true, group: 'rotavirus', hint: 'RotaTeq — 3-dose series' },
  rv1: { defaultActive: false, group: 'rotavirus', hint: 'Rotarix — 2-dose series' },
  dtap: { defaultActive: true },
  hib: { defaultActive: true },
  pcv: { defaultActive: true },
  ipv: { defaultActive: true },
  'covid-19': { defaultActive: true, hint: 'Annual; doses vary by age & product' },
  influenza: { defaultActive: true, hint: 'Annual, from 6 months' },
  mmr: { defaultActive: true },
  var: { defaultActive: true },
  hepa: { defaultActive: true },
  hpv: { defaultActive: true, hint: 'Routine at 11–12 yrs' },
  menacwy: { defaultActive: true, hint: 'Routine at 11–12 yrs' },
  menb: { defaultActive: false, hint: 'Shared decision, 16–18 yrs' },
  tdap: { defaultActive: true, hint: 'Booster at 11–12 yrs' },
  td: { defaultActive: false, hint: 'Adult decennial booster' },
};

/** The default set of active vaccine ids. */
export function defaultActiveVaccineIds(): string[] {
  return Object.entries(VACCINE_META)
    .filter(([, m]) => m.defaultActive)
    .map(([id]) => id);
}
