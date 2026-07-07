# Vaccinator 💉

A private, offline-first mobile app for tracking your child's immunizations —
what's been given, what's coming up, and what's overdue — based on the **CDC
Recommended Child & Adolescent Immunization Schedule (2025)**.

> ⚠️ Vaccinator is an informational and organizational tool. It is **not medical
> advice**. Recommended dates are estimates computed from your child's date of
> birth and the CDC schedule; always confirm timing with your pediatrician.

## Features

- **Multiple children** — track all your children in one app. Each child has
  their own records, vaccine selection, planned appointments, and reminders. You
  can **add several children during first-time setup** (a review step lets you
  add more or continue), and later tap the header on the dashboard (or
  **Settings → Children**) to switch between them or add another.
- **Dashboard** — completion progress, overdue/due-soon alerts, and a "next up"
  card with a one-tap way to record the dose, for the selected child.
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
- **Backup & restore** — export all records to a single JSON file you control
  (save to Files, iCloud/Drive, email…) and re-import it later, so your data
  survives reinstalling the app or moving to a new phone.
- **Private by design** — all data is stored only on the device via
  AsyncStorage. No account, no server, no network calls for your data.
- **Terms + Privacy gate** — on first launch parents must read and accept the
  **Terms of Use and Privacy Policy** (informational-only, not medical advice,
  data responsibility, on-device privacy, etc.) before using the app. The
  Privacy Policy is readable right from the gate (and Settings); re-accepting is
  required if either document's version changes.

## Running the app

Requires [Node.js](https://nodejs.org) 20+ and the Expo tooling (installed
automatically via `npx`). First, install dependencies once:

```bash
npm install
```

### Option A — On your own phone with Expo Go (easiest, no Xcode/Android Studio)

This runs the app on a real iPhone or Android phone in minutes. It's the
recommended way to try it, and the only way to test the **reminder
notifications** (which don't work in the web preview).

**iOS (iPhone / iPad)**
1. Install **Expo Go** from the App Store:
   https://apps.apple.com/app/expo-go/id982107779
2. On your Mac/PC, from the project folder run:
   ```bash
   npm start
   ```
   A QR code appears in the terminal.
3. Open the **Camera** app on your iPhone and point it at the QR code, then tap
   the "Open in Expo Go" banner.
4. The app loads in Expo Go. When prompted, **Allow Notifications** so due-date
   reminders can work.

> Your computer and iPhone must be on the **same Wi-Fi network**. If it won't
> connect (common on public/corporate Wi-Fi), run `npx expo start --tunnel`
> instead and scan that QR code.

**Android**
1. Install **Expo Go** from the Play Store:
   https://play.google.com/store/apps/details?id=host.exp.exponent
2. From the project folder run:
   ```bash
   npm start
   ```
3. Open **Expo Go** on your phone → **Scan QR code** → scan the QR in the
   terminal.
4. The app loads. **Allow Notifications** when prompted for reminders.

> Same-Wi-Fi requirement and the `npx expo start --tunnel` fallback apply here
> too.

#### How Expo Go loads the app (and using it without your computer)

By default, `npm start` runs a **Metro dev server** on your computer. Expo Go on
the phone downloads the app's JavaScript from that server **every time it
launches**, so the app is tethered to your machine — it needs your computer on,
the dev server running, and the phone reachable (same Wi-Fi, or `--tunnel`).
That's ideal for development (save a file → it hot-reloads on the phone) but not
for everyday use.

To run it **computer-free**, or to push updates to an already-installed copy,
you use **EAS Update** — but an important distinction:

- **EAS Update publishes to your app _builds_, not Expo Go.** This project sets a
  `runtimeVersion` (for its standalone builds), so a published `eas update`
  **cannot be opened in Expo Go** — Expo Go only runs updates matching its own
  SDK runtime, and will say *"incompatible with this version of Expo Go."* For
  Expo Go, use the **dev server** above.
- **Computer-free therefore means a real build.** Build the app once, install it,
  then `eas update` pushes JS-only changes to it over the air. See the per-device
  guides: **[android.md](android.md)** (free APK, no developer account) and
  **[ios.md](ios.md)** (paid Apple account for a standalone iOS app).

One-time EAS setup (this project already ships `expo-updates` and an `eas.json`):

```bash
npm install -g eas-cli     # or use `npx eas-cli@latest`
eas login                  # free Expo account — expo.dev/signup
eas init                   # links the project (writes projectId to app.json)
eas update:configure       # adds updates.url + runtimeVersion to app.json
```

Then push JS updates to your installed build(s) anytime:

```bash
eas update --branch preview --message "what changed"
```

**Limitations to keep in mind:**

- **Expo Go is a preview host** — via the dev server it has no standalone icon and
  needs your computer, and it can't open this project's published updates.
- **Local data** lives on-device, so export a backup periodically (**Settings →
  Backup & restore**; see [Backing up your data](#backing-up-your-data)) before
  reinstalling or switching phones.
- **Custom native modules** — if you add one Expo Go doesn't include, Expo Go
  can't run the app even via the dev server; you'd need a development build.

### Option B — On a simulator / emulator (needs Apple/Google tooling)

**iOS Simulator (macOS only)** — requires [Xcode](https://developer.apple.com/xcode/)
from the Mac App Store:
```bash
npm run ios
```
This builds and opens the app in the iOS Simulator automatically.

**Android Emulator** — requires [Android Studio](https://developer.android.com/studio)
with an Android Virtual Device (AVD) created and running:
```bash
npm run android
```

### Option C — In a web browser (quick look, limited)

```bash
npm run web
```
Good for a fast preview of the UI, but the native date picker and notification
reminders are unavailable in the browser.

### Everyday commands

| Command | What it does |
| --- | --- |
| `npm start` | Start the dev server + QR code (use with Expo Go) |
| `npm run ios` | Open in the iOS Simulator (macOS + Xcode) |
| `npm run android` | Open in the Android Emulator (Android Studio) |
| `npm run web` | Open in a browser |

While the dev server is running, press `r` to reload, or just save a file and it
hot-reloads on the device.

### Installing it as a standalone app (optional)

Expo Go is perfect for personal use. To produce an installable build (an `.ipa`
for iOS or `.apk`/`.aab` for Android) — e.g. to keep it on your phone without
Expo Go, or to share it — use [EAS Build](https://docs.expo.dev/build/setup/):

```bash
npm install -g eas-cli
eas login
eas build --profile preview --platform android   # or: --platform ios
```

> **Per-device guides:** to install Vaccinator as a standalone app on Android
> (build an APK and sideload it), see **[android.md](android.md)**. To run it on
> an iPhone via Expo Go (free, no Apple account), see **[ios.md](ios.md)**.

> Note: iOS builds/installs require an Apple Developer account; Android `.apk`
> builds can be installed directly on a device.

> **Reminder about notifications:** local due-date reminders require running on a
> real device (Expo Go or a build), not the web preview or a fresh simulator
> without notification permissions.

## Backing up your data

Because everything is stored **only on the device**, exporting a backup now and
then is the way to keep your records safe.

**Export a backup**
1. Go to **Settings → Backup & restore → Export a backup**.
2. On a phone, the share sheet opens — save the file to **Files / iCloud
   Drive / Google Drive**, email it to yourself, or AirDrop it. In a browser it
   downloads directly.
3. The file is named `vaccinator-backup-YYYY-MM-DD.json` and contains the child
   profile, every dose record, planned appointments, and settings.

**Restore a backup** (e.g. on a new phone, or after clearing Expo Go)
1. Get the backup file onto the device (save it into Files, or have it in an
   email).
2. Go to **Settings → Backup & restore → Restore from a backup** and pick the
   file.
3. Confirm — this **replaces** the current data on the device with the backup's
   contents.

The backup is plain JSON, so it's easy to inspect and future-proof. Invalid or
unrelated files are rejected with a clear message, and a backup from a newer
app version won't be imported by an older one.

> Tip: export a fresh backup after each doctor visit where you record new doses.

## How it's built

| Area | Choice |
| --- | --- |
| Framework | Expo (SDK 57) + React Native + TypeScript |
| Navigation | React Navigation (bottom tabs + native stack) |
| Storage | `@react-native-async-storage/async-storage` (on-device only) |
| Reminders | `expo-notifications` (local, opt-in) |
| Backup | `expo-file-system` + `expo-sharing` + `expo-document-picker` (JSON export/import) |

### Project structure

```
src/
  data/
    schedule.ts       # CDC 2025 schedule as structured data (source of truth)
    vaccineMeta.ts    # which vaccines are active by default; variant groups
    terms.ts          # Terms of Use content + version (acceptance gate)
    privacy.ts        # Privacy Policy content + version
    types.ts          # Child, DoseRecord, PlannedDoses, Settings models
  logic/
    scheduling.ts     # the engine: status + due dates, timeline, as-of summary
    dates.ts          # dependency-free date helpers
    validation.ts     # birth-date / dose-date validation
    notifications.ts  # local reminder scheduling (safe no-op on web)
    backup.ts         # export/import all data as a JSON file (native + web)
  storage/store.ts    # AsyncStorage CRUD (child, records, planned dates, settings)
  state/AppContext.tsx# app-wide state + derived schedule
  components/          # Card, Button, DoseRow, DateField, ChildForm, ...
  screens/            # Terms, Privacy, Dashboard, Schedule, Timeline,
                      #   VaccineDetail, RecordDose, PlanDose, History, Settings,
                      #   Children, EditChild, ManageVaccines, Onboarding
  navigation/         # tab + stack wiring
theme/theme.ts        # colors, spacing, typography tokens
```

## Updating the CDC schedule

The schedule lives in [`src/data/schedule.ts`](src/data/schedule.ts) with its CDC
sources cited at the top of the file. When the CDC publishes a new yearly
schedule, update the dose ages/notes there — the rest of the app derives
everything from that data.

## Legal

- **License** — MIT. See [LICENSE.md](LICENSE.md) (update the copyright holder to
  your name/organization).
- **Terms of Use** — [`src/data/terms.ts`](src/data/terms.ts); shown as an
  acceptance gate on first launch and viewable in Settings.
- **Privacy Policy** — [`src/data/privacy.ts`](src/data/privacy.ts); linked from
  the Terms gate and Settings.

> The Terms and Privacy text are practical, plain-language templates — **not
> legal advice**. Before publishing an app that handles children's health data,
> have a qualified attorney review and adapt them (and consider COPPA/HIPAA and
> app-store requirements).
