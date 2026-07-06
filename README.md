# Vaccinator 💉

A private, offline-first mobile app for tracking your child's immunizations —
what's been given, what's coming up, and what's overdue — based on the **CDC
Recommended Child & Adolescent Immunization Schedule (2025)**.

> ⚠️ Vaccinator is an informational and organizational tool. It is **not medical
> advice**. Recommended dates are estimates computed from your child's date of
> birth and the CDC schedule; always confirm timing with your pediatrician.

## Features

- **Dashboard** — completion progress, overdue/due-soon alerts, and a "next up"
  card with a one-tap way to record the dose.
- **Schedule** — browse every vaccine by series or along an age timeline, each
  dose tagged Done / Overdue / Due soon / Upcoming with its recommended date.
- **Timeline** — two toggleable views of every dose across time:
  - **Timeline (list)** — a vertical calendar of the past and future:
    administered doses at the date given, pending doses at their booked
    appointment (or CDC-recommended date). A date scrubber jumps to any past or
    future date with an "as of then" snapshot (given / due / ahead).
  - **Chart (grid)** — vaccines down the side, age across the top (like the CDC
    schedule chart), with a frozen vaccine column, a highlighted "Now" band at
    the child's current age, and color-coded status dots.
  From either view you can **book a planned appointment date** on a pending dose.
- **Vaccine detail** — what each vaccine protects against, CDC series notes,
  per-dose timing, and a link out to the relevant CDC.gov page.
- **History** — a running log of every recorded dose (date, provider, lot #,
  notes), fully editable.
- **Smart prioritization** — the CDC schedule is embedded as structured data and
  the app computes due dates from your child's birth date, so the most relevant
  vaccines surface first. Works entirely offline.
- **Reminders** — optional local notifications a configurable number of days
  before each dose is due (mobile only).
- **Manage vaccines** — pick which vaccines apply (e.g. choose your rotavirus
  product, enable MenB) so progress and reminders stay accurate.
- **Private by design** — all data is stored only on the device via
  AsyncStorage. No account, no server, no network calls for your data.

## Running the app

Requires [Node.js](https://nodejs.org) and the Expo tooling (via `npx`).

```bash
npm install

# On your phone: install "Expo Go", then run and scan the QR code
npm start

# Or target a platform directly
npm run ios       # iOS simulator (needs Xcode)
npm run android   # Android emulator (needs Android Studio)
npm run web       # open in a browser
```

> Note: local notification reminders require running on a real device (or a
> development build), not the web preview.

## How it's built

| Area | Choice |
| --- | --- |
| Framework | Expo (SDK 57) + React Native + TypeScript |
| Navigation | React Navigation (bottom tabs + native stack) |
| Storage | `@react-native-async-storage/async-storage` (on-device only) |
| Reminders | `expo-notifications` (local, opt-in) |

### Project structure

```
src/
  data/
    schedule.ts       # CDC 2025 schedule as structured data (source of truth)
    vaccineMeta.ts    # which vaccines are active by default; variant groups
    types.ts          # Child, DoseRecord, PlannedDoses, Settings models
  logic/
    scheduling.ts     # the engine: status + due dates, timeline, as-of summary
    dates.ts          # dependency-free date helpers
    validation.ts     # birth-date / dose-date validation
    notifications.ts  # local reminder scheduling (safe no-op on web)
  storage/store.ts    # AsyncStorage CRUD (child, records, planned dates, settings)
  state/AppContext.tsx# app-wide state + derived schedule
  components/          # Card, Button, DoseRow, DateField, ChildForm, ...
  screens/            # Dashboard, Schedule, Timeline, VaccineDetail, RecordDose,
                      #   PlanDose, History, Settings, EditChild, ManageVaccines,
                      #   Onboarding
  navigation/         # tab + stack wiring
theme/theme.ts        # colors, spacing, typography tokens
```

## Updating the CDC schedule

The schedule lives in [`src/data/schedule.ts`](src/data/schedule.ts) with its CDC
sources cited at the top of the file. When the CDC publishes a new yearly
schedule, update the dose ages/notes there — the rest of the app derives
everything from that data.
