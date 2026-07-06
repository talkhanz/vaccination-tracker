/**
 * CDC Recommended Child and Adolescent Immunization Schedule
 * Ages 18 Years or Younger, United States — 2025
 *
 * Source: CDC.gov / ACIP — Child & Adolescent Immunization Schedule (2025)
 *   - By Age table (Addendum updated July 2, 2025):
 *       https://www.cdc.gov/vaccines/hcp/imz-schedules/child-adolescent-age.html
 *   - Clinical Notes:
 *       https://www.cdc.gov/vaccines/hcp/imz-schedules/child-adolescent-notes.html
 *   - MMWR 2025 schedule (mm7402a2):
 *       https://www.cdc.gov/mmwr/volumes/74/wr/mm7402a2.htm
 *
 * Schedule version: 2025 (ACIP-approved Oct 2024; addendum updated July 2, 2025).
 *
 * Age conversion: ages are expressed as months from birth (birth = 0).
 *   1 year = 12 months; e.g. "4-6 years" -> recommendedAgeMonths = 48.
 * `recommendedAgeMonths` uses the EARLIEST recommended age in months.
 * `rangeLabel` carries the full human-readable window.
 *
 * IMPORTANT: This dataset is INFORMATIONAL ONLY and is NOT a substitute for a
 * pediatrician's or qualified healthcare provider's guidance. Individual children
 * may require different schedules based on health conditions, catch-up status,
 * travel, or shared clinical decision-making. Always confirm with a clinician.
 */

export interface VaccineDose {
  doseNumber: number;
  label: string; // e.g. "Dose 1", "Booster"
  recommendedAgeMonths: number; // recommended age converted to months from birth (birth = 0)
  minAgeMonths: number; // earliest it can be given
  rangeLabel: string; // human label e.g. "2 months", "12–15 months", "11–12 years"
  notes?: string;
}

export interface Vaccine {
  id: string; // kebab-case, e.g. "hepb"
  name: string; // "Hepatitis B"
  abbreviation: string; // "HepB"
  diseasesPrevented: string;
  routineDoseCount: number;
  cdcUrl: string; // link to the specific CDC page for this vaccine
  doses: VaccineDose[];
  notes?: string; // series-level notes, catch-up guidance summary
}

// Note on month conversions used below:
//   6 weeks   ≈ 1.5 months
//   birth     = 0
//   1 year    = 12 months
//   7 years   = 84 months
//   9 years   = 108 months
//   10 years  = 120 months
//   11 years  = 132 months
//   12 years  = 144 months
//   16 years  = 192 months

export const CDC_SCHEDULE: Vaccine[] = [
  {
    id: "hepb",
    name: "Hepatitis B",
    abbreviation: "HepB",
    diseasesPrevented: "Hepatitis B",
    routineDoseCount: 3,
    cdcUrl:
      "https://www.cdc.gov/vaccines/hcp/imz-schedules/child-adolescent-notes.html",
    doses: [
      {
        doseNumber: 1,
        label: "Dose 1 (birth dose)",
        recommendedAgeMonths: 0,
        minAgeMonths: 0,
        rangeLabel: "Birth",
        notes:
          "Within 24 hours of birth for medically stable infants ≥2,000 g. Infants <2,000 g: first dose at 1 month or hospital discharge.",
      },
      {
        doseNumber: 2,
        label: "Dose 2",
        recommendedAgeMonths: 1,
        minAgeMonths: 1,
        rangeLabel: "1–2 months",
      },
      {
        doseNumber: 3,
        label: "Dose 3",
        recommendedAgeMonths: 6,
        minAgeMonths: 6,
        rangeLabel: "6–18 months",
        notes: "Final dose at age ≥24 weeks (~6 months).",
      },
    ],
    notes:
      "3-dose series at 0, 1–2, and 6–18 months. Minimum age: birth. A monovalent birth dose is recommended for all newborns.",
  },
  {
    id: "rv1",
    name: "Rotavirus (RV1 — Rotarix)",
    abbreviation: "RV1",
    diseasesPrevented: "Rotavirus gastroenteritis",
    routineDoseCount: 2,
    cdcUrl:
      "https://www.cdc.gov/vaccines/hcp/imz-schedules/child-adolescent-notes.html",
    doses: [
      {
        doseNumber: 1,
        label: "Dose 1",
        recommendedAgeMonths: 2,
        minAgeMonths: 1.5,
        rangeLabel: "2 months",
        notes: "Minimum age 6 weeks. Do NOT start series at age ≥15 weeks 0 days.",
      },
      {
        doseNumber: 2,
        label: "Dose 2",
        recommendedAgeMonths: 4,
        minAgeMonths: 3.5,
        rangeLabel: "4 months",
        notes: "Maximum age for final dose: 8 months 0 days.",
      },
    ],
    notes:
      "RV1 (Rotarix) is a 2-dose oral series at 2 and 4 months. Minimum age 6 weeks; do not start after 14 weeks 6 days; maximum age for any dose is 8 months 0 days.",
  },
  {
    id: "rv5",
    name: "Rotavirus (RV5 — RotaTeq)",
    abbreviation: "RV5",
    diseasesPrevented: "Rotavirus gastroenteritis",
    routineDoseCount: 3,
    cdcUrl:
      "https://www.cdc.gov/vaccines/hcp/imz-schedules/child-adolescent-notes.html",
    doses: [
      {
        doseNumber: 1,
        label: "Dose 1",
        recommendedAgeMonths: 2,
        minAgeMonths: 1.5,
        rangeLabel: "2 months",
        notes: "Minimum age 6 weeks. Do NOT start series at age ≥15 weeks 0 days.",
      },
      {
        doseNumber: 2,
        label: "Dose 2",
        recommendedAgeMonths: 4,
        minAgeMonths: 3.5,
        rangeLabel: "4 months",
      },
      {
        doseNumber: 3,
        label: "Dose 3",
        recommendedAgeMonths: 6,
        minAgeMonths: 5.5,
        rangeLabel: "6 months",
        notes: "Maximum age for final dose: 8 months 0 days.",
      },
    ],
    notes:
      "RV5 (RotaTeq) is a 3-dose oral series at 2, 4, and 6 months. Minimum age 6 weeks; do not start after 14 weeks 6 days; maximum age for any dose is 8 months 0 days. If any dose in the series was RV5 or product is unknown, complete a 3-dose series.",
  },
  {
    id: "dtap",
    name: "Diphtheria, Tetanus, and Acellular Pertussis",
    abbreviation: "DTaP",
    diseasesPrevented: "Diphtheria, tetanus, pertussis (whooping cough)",
    routineDoseCount: 5,
    cdcUrl:
      "https://www.cdc.gov/vaccines/hcp/imz-schedules/child-adolescent-notes.html",
    doses: [
      {
        doseNumber: 1,
        label: "Dose 1",
        recommendedAgeMonths: 2,
        minAgeMonths: 1.5,
        rangeLabel: "2 months",
        notes: "Minimum age 6 weeks.",
      },
      {
        doseNumber: 2,
        label: "Dose 2",
        recommendedAgeMonths: 4,
        minAgeMonths: 3.5,
        rangeLabel: "4 months",
      },
      {
        doseNumber: 3,
        label: "Dose 3",
        recommendedAgeMonths: 6,
        minAgeMonths: 5.5,
        rangeLabel: "6 months",
      },
      {
        doseNumber: 4,
        label: "Dose 4",
        recommendedAgeMonths: 15,
        minAgeMonths: 12,
        rangeLabel: "15–18 months",
        notes:
          "May be given as early as 12 months if ≥6 months have elapsed since dose 3.",
      },
      {
        doseNumber: 5,
        label: "Dose 5",
        recommendedAgeMonths: 48,
        minAgeMonths: 48,
        rangeLabel: "4–6 years",
        notes:
          "Not needed if dose 4 was given at age ≥4 years and ≥6 months after dose 3.",
      },
    ],
    notes:
      "5-dose series at 2, 4, 6, 15–18 months, and 4–6 years. Minimum age 6 weeks. For children ≥7 years, use Tdap/Td for catch-up instead of DTaP.",
  },
  {
    id: "hib",
    name: "Haemophilus influenzae type b",
    abbreviation: "Hib",
    diseasesPrevented: "Haemophilus influenzae type b invasive disease",
    routineDoseCount: 4,
    cdcUrl:
      "https://www.cdc.gov/vaccines/hcp/imz-schedules/child-adolescent-notes.html",
    doses: [
      {
        doseNumber: 1,
        label: "Dose 1",
        recommendedAgeMonths: 2,
        minAgeMonths: 1.5,
        rangeLabel: "2 months",
        notes: "Minimum age 6 weeks.",
      },
      {
        doseNumber: 2,
        label: "Dose 2",
        recommendedAgeMonths: 4,
        minAgeMonths: 3.5,
        rangeLabel: "4 months",
      },
      {
        doseNumber: 3,
        label: "Dose 3",
        recommendedAgeMonths: 6,
        minAgeMonths: 5.5,
        rangeLabel: "6 months",
        notes:
          "Dose at 6 months applies to ActHIB, Hiberix, Pentacel, or Vaxelis (4-dose series). PedvaxHIB (PRP-OMP) uses a 3-dose series and does NOT require a dose at 6 months.",
      },
      {
        doseNumber: 4,
        label: "Dose 4 (booster)",
        recommendedAgeMonths: 12,
        minAgeMonths: 12,
        rangeLabel: "12–15 months",
        notes: "Final/booster dose at 12–15 months.",
      },
    ],
    notes:
      "Routine series depends on product: ActHIB / Hiberix / Pentacel / Vaxelis = 4 doses (2, 4, 6, 12–15 months). PedvaxHIB (PRP-OMP) = 3 doses (2, 4, 12–15 months; no 6-month dose). Minimum age 6 weeks.",
  },
  {
    id: "pcv",
    name: "Pneumococcal Conjugate (PCV15 or PCV20)",
    abbreviation: "PCV",
    diseasesPrevented: "Pneumococcal disease (invasive disease, pneumonia, otitis media)",
    routineDoseCount: 4,
    cdcUrl:
      "https://www.cdc.gov/vaccines/hcp/imz-schedules/child-adolescent-notes.html",
    doses: [
      {
        doseNumber: 1,
        label: "Dose 1",
        recommendedAgeMonths: 2,
        minAgeMonths: 1.5,
        rangeLabel: "2 months",
        notes: "Minimum age 6 weeks. PCV15 or PCV20.",
      },
      {
        doseNumber: 2,
        label: "Dose 2",
        recommendedAgeMonths: 4,
        minAgeMonths: 3.5,
        rangeLabel: "4 months",
      },
      {
        doseNumber: 3,
        label: "Dose 3",
        recommendedAgeMonths: 6,
        minAgeMonths: 5.5,
        rangeLabel: "6 months",
      },
      {
        doseNumber: 4,
        label: "Dose 4 (booster)",
        recommendedAgeMonths: 12,
        minAgeMonths: 12,
        rangeLabel: "12–15 months",
      },
    ],
    notes:
      "4-dose series at 2, 4, 6, and 12–15 months using PCV15 or PCV20. Minimum age 6 weeks. Children with certain high-risk conditions may need additional PCV and/or PPSV23 doses (see CDC notes).",
  },
  {
    id: "ipv",
    name: "Inactivated Poliovirus",
    abbreviation: "IPV",
    diseasesPrevented: "Poliomyelitis (polio)",
    routineDoseCount: 4,
    cdcUrl:
      "https://www.cdc.gov/vaccines/hcp/imz-schedules/child-adolescent-notes.html",
    doses: [
      {
        doseNumber: 1,
        label: "Dose 1",
        recommendedAgeMonths: 2,
        minAgeMonths: 1.5,
        rangeLabel: "2 months",
        notes: "Minimum age 6 weeks.",
      },
      {
        doseNumber: 2,
        label: "Dose 2",
        recommendedAgeMonths: 4,
        minAgeMonths: 3.5,
        rangeLabel: "4 months",
      },
      {
        doseNumber: 3,
        label: "Dose 3",
        recommendedAgeMonths: 6,
        minAgeMonths: 5.5,
        rangeLabel: "6–18 months",
      },
      {
        doseNumber: 4,
        label: "Dose 4",
        recommendedAgeMonths: 48,
        minAgeMonths: 48,
        rangeLabel: "4–6 years",
        notes:
          "Final dose must be given at age ≥4 years and ≥6 months after the previous dose.",
      },
    ],
    notes:
      "4-dose series at 2, 4, 6–18 months, and 4–6 years. Minimum age 6 weeks. Catch-up now recommended through age 18 years (2025 update).",
  },
  {
    id: "covid-19",
    name: "COVID-19",
    abbreviation: "COVID-19",
    diseasesPrevented: "COVID-19 (SARS-CoV-2)",
    routineDoseCount: 2,
    cdcUrl:
      "https://www.cdc.gov/vaccines/hcp/imz-schedules/child-adolescent-notes.html",
    doses: [
      {
        doseNumber: 1,
        label: "Dose 1",
        recommendedAgeMonths: 6,
        minAgeMonths: 6,
        rangeLabel: "6 months and older",
        notes:
          "Minimum age 6 months (Moderna/Pfizer); 12 years for Novavax. Number of doses to be up to date depends on age, vaccine product, and prior doses.",
      },
      {
        doseNumber: 2,
        label: "Dose 2",
        recommendedAgeMonths: 6,
        minAgeMonths: 6,
        rangeLabel: "per product interval",
        notes:
          "Ages 6 mo–4 yr: 2-dose (Moderna) or 3-dose (Pfizer) primary series. Ages 5–17: typically 1 dose to be up to date (or 2-dose Novavax). Immunocompromised children need additional doses.",
      },
    ],
    notes:
      "COVID-19 vaccination is age- and product-dependent and updated annually with current formulations. Routine dose count varies by product and age. Consult the current CDC COVID-19 schedule and notes; this entry is a simplified placeholder.",
  },
  {
    id: "influenza",
    name: "Influenza (annual)",
    abbreviation: "Flu (IIV3/LAIV3)",
    diseasesPrevented: "Seasonal influenza",
    routineDoseCount: 1,
    cdcUrl:
      "https://www.cdc.gov/vaccines/hcp/imz-schedules/child-adolescent-notes.html",
    doses: [
      {
        doseNumber: 1,
        label: "Annual dose",
        recommendedAgeMonths: 6,
        minAgeMonths: 6,
        rangeLabel: "6 months and older, every year",
        notes:
          "Minimum age 6 months (IIV3); 2 years (LAIV3). Children 6 months–8 years receiving flu vaccine for the first time (or with <2 prior lifetime doses) need 2 doses ≥4 weeks apart in that season.",
      },
    ],
    notes:
      "Annual vaccination for everyone ≥6 months. Some children aged 6 months–8 years require 2 doses in a given season (first-time vaccinees or <2 prior doses); otherwise 1 dose annually. 2025 season uses trivalent (IIV3/LAIV3) formulations.",
  },
  {
    id: "mmr",
    name: "Measles, Mumps, Rubella",
    abbreviation: "MMR",
    diseasesPrevented: "Measles, mumps, rubella",
    routineDoseCount: 2,
    cdcUrl:
      "https://www.cdc.gov/vaccines/hcp/imz-schedules/child-adolescent-notes.html",
    doses: [
      {
        doseNumber: 1,
        label: "Dose 1",
        recommendedAgeMonths: 12,
        minAgeMonths: 12,
        rangeLabel: "12–15 months",
        notes:
          "Minimum age 12 months for routine. Infants 6–11 months traveling internationally may get 1 dose, which does not count toward the routine series.",
      },
      {
        doseNumber: 2,
        label: "Dose 2",
        recommendedAgeMonths: 48,
        minAgeMonths: 13,
        rangeLabel: "4–6 years",
        notes:
          "May be given earlier, as long as ≥4 weeks (28 days) after dose 1.",
      },
    ],
    notes:
      "2-dose series at 12–15 months and 4–6 years. Minimum interval 4 weeks. MMRV may be used for children 12 months–12 years.",
  },
  {
    id: "var",
    name: "Varicella",
    abbreviation: "VAR",
    diseasesPrevented: "Varicella (chickenpox)",
    routineDoseCount: 2,
    cdcUrl:
      "https://www.cdc.gov/vaccines/hcp/imz-schedules/child-adolescent-notes.html",
    doses: [
      {
        doseNumber: 1,
        label: "Dose 1",
        recommendedAgeMonths: 12,
        minAgeMonths: 12,
        rangeLabel: "12–15 months",
        notes: "Minimum age 12 months.",
      },
      {
        doseNumber: 2,
        label: "Dose 2",
        recommendedAgeMonths: 48,
        minAgeMonths: 15,
        rangeLabel: "4–6 years",
        notes:
          "May be given as early as 3 months after dose 1 (children <13 years). For catch-up ≥13 years, minimum interval is 4 weeks.",
      },
    ],
    notes:
      "2-dose series at 12–15 months and 4–6 years. Minimum age 12 months. MMRV may be used for children 12 months–12 years.",
  },
  {
    id: "hepa",
    name: "Hepatitis A",
    abbreviation: "HepA",
    diseasesPrevented: "Hepatitis A",
    routineDoseCount: 2,
    cdcUrl:
      "https://www.cdc.gov/vaccines/hcp/imz-schedules/child-adolescent-notes.html",
    doses: [
      {
        doseNumber: 1,
        label: "Dose 1",
        recommendedAgeMonths: 12,
        minAgeMonths: 12,
        rangeLabel: "12–23 months",
        notes:
          "Minimum age 12 months (routine). Travel: infants 6–11 months may get 1 dose, which does not count toward the routine 2-dose series.",
      },
      {
        doseNumber: 2,
        label: "Dose 2",
        recommendedAgeMonths: 18,
        minAgeMonths: 18,
        rangeLabel: "≥6 months after dose 1 (18–23 months)",
        notes: "Minimum interval of 6 months after dose 1.",
      },
    ],
    notes:
      "2-dose series starting at 12–23 months, doses separated by ≥6 months. Minimum age 12 months. Catch-up recommended for all children/adolescents through age 18 who have not been vaccinated.",
  },
  {
    id: "hpv",
    name: "Human Papillomavirus",
    abbreviation: "HPV",
    diseasesPrevented: "HPV-associated cancers and genital warts",
    routineDoseCount: 2,
    cdcUrl:
      "https://www.cdc.gov/vaccines/hcp/imz-schedules/child-adolescent-notes.html",
    doses: [
      {
        doseNumber: 1,
        label: "Dose 1",
        recommendedAgeMonths: 132,
        minAgeMonths: 108,
        rangeLabel: "11–12 years (can start at 9)",
        notes:
          "Routinely recommended at 11–12 years; may start at age 9 (minimum age 9 years = 108 months).",
      },
      {
        doseNumber: 2,
        label: "Dose 2",
        recommendedAgeMonths: 138,
        minAgeMonths: 113,
        rangeLabel: "6–12 months after dose 1",
        notes:
          "For a 2-dose series (start age 9–14), give dose 2 6–12 months after dose 1 (minimum interval 5 months).",
      },
      {
        doseNumber: 3,
        label: "Dose 3 (only if 3-dose series)",
        recommendedAgeMonths: 138,
        minAgeMonths: 180,
        rangeLabel: "0, 1–2, 6 months (if starting at age ≥15)",
        notes:
          "A 3-dose series is required if the series is started at age ≥15 years, or for immunocompromised persons at any age. Schedule: 0, 1–2, 6 months.",
      },
    ],
    notes:
      "2-dose series when started before the 15th birthday (0, 6–12 months). 3-dose series (0, 1–2, 6 months) if started at age ≥15 years or for immunocompromised persons. Routinely recommended at 11–12 years; may start at age 9. Minimum age 9 years.",
  },
  {
    id: "menacwy",
    name: "Meningococcal Conjugate (ACWY)",
    abbreviation: "MenACWY",
    diseasesPrevented: "Meningococcal disease (serogroups A, C, W, Y)",
    routineDoseCount: 2,
    cdcUrl:
      "https://www.cdc.gov/vaccines/hcp/imz-schedules/child-adolescent-notes.html",
    doses: [
      {
        doseNumber: 1,
        label: "Dose 1",
        recommendedAgeMonths: 132,
        minAgeMonths: 2,
        rangeLabel: "11–12 years",
        notes:
          "Routine minimum age 2 months (Menveo) or 2 years (MenQuadfi); routinely given at 11–12 years for healthy adolescents. Higher-risk infants/children follow separate schedules.",
      },
      {
        doseNumber: 2,
        label: "Dose 2 (booster)",
        recommendedAgeMonths: 192,
        minAgeMonths: 192,
        rangeLabel: "16 years",
        notes:
          "Booster at 16 years. If dose 1 was given at 13–15 years, booster at 16–18 years (≥8 weeks after dose 1). No booster needed if dose 1 given at age ≥16 years.",
      },
    ],
    notes:
      "Routine 2-dose series at 11–12 years and 16 years for healthy adolescents. Minimum age 2 months (Menveo). Children with high-risk conditions have separate, earlier schedules.",
  },
  {
    id: "menb",
    name: "Meningococcal B",
    abbreviation: "MenB",
    diseasesPrevented: "Meningococcal disease (serogroup B)",
    routineDoseCount: 2,
    cdcUrl:
      "https://www.cdc.gov/vaccines/hcp/imz-schedules/child-adolescent-notes.html",
    doses: [
      {
        doseNumber: 1,
        label: "Dose 1",
        recommendedAgeMonths: 192,
        minAgeMonths: 120,
        rangeLabel: "16–23 years (shared clinical decision-making)",
        notes:
          "Minimum age 10 years. For healthy adolescents, given based on shared clinical decision-making, preferred at 16–18 years. Do NOT mix products (Bexsero vs Trumenba) within a series.",
      },
      {
        doseNumber: 2,
        label: "Dose 2",
        recommendedAgeMonths: 198,
        minAgeMonths: 120,
        rangeLabel: "≥6 months after dose 1",
        notes:
          "Healthy persons: 2 doses ≥6 months apart. High-risk/immunocompromised: 3-dose series (Bexsero 0, 6 mo; Trumenba 0, 1–2, 6 mo — product-dependent).",
      },
    ],
    notes:
      "Not routinely recommended for all adolescents. For healthy persons 16–23 years (preferred 16–18), a 2-dose series ≥6 months apart based on shared clinical decision-making. High-risk persons ≥10 years receive a 2- or 3-dose series depending on product. Minimum age 10 years.",
  },
  {
    id: "tdap",
    name: "Tetanus, Diphtheria, and Acellular Pertussis (adolescent booster)",
    abbreviation: "Tdap",
    diseasesPrevented: "Tetanus, diphtheria, pertussis",
    routineDoseCount: 1,
    cdcUrl:
      "https://www.cdc.gov/vaccines/hcp/imz-schedules/child-adolescent-notes.html",
    doses: [
      {
        doseNumber: 1,
        label: "Adolescent booster",
        recommendedAgeMonths: 132,
        minAgeMonths: 84,
        rangeLabel: "11–12 years",
        notes:
          "Routine minimum age 11 years; catch-up minimum age 7 years. Follows the childhood DTaP series. During pregnancy, 1 dose each pregnancy (preferably 27–36 weeks gestation).",
      },
    ],
    notes:
      "Single adolescent Tdap booster at 11–12 years, following the 5-dose DTaP series. A Td or Tdap booster is then recommended every 10 years (Tdap may be used in place of any Td dose).",
  },
  {
    id: "td",
    name: "Tetanus and Diphtheria (booster)",
    abbreviation: "Td",
    diseasesPrevented: "Tetanus, diphtheria",
    routineDoseCount: 1,
    cdcUrl:
      "https://www.cdc.gov/vaccines/hcp/imz-schedules/child-adolescent-notes.html",
    doses: [
      {
        doseNumber: 1,
        label: "Booster (every 10 years)",
        recommendedAgeMonths: 264,
        minAgeMonths: 84,
        rangeLabel: "Every 10 years after Tdap (from ~22 years)",
        notes:
          "Minimum age 7 years (catch-up). Routine Td (or Tdap) booster every 10 years following the adolescent Tdap dose. Either Td or Tdap may be used.",
      },
    ],
    notes:
      "Td (or Tdap) is used as a decennial tetanus/diphtheria booster. After the adolescent Tdap dose at 11–12 years, a booster is recommended every 10 years. Td is also used for wound management and catch-up in persons ≥7 years.",
  },
];
