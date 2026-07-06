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

To use it **without a running dev server**, publish the JS bundle to Expo's
cloud once with **EAS Update**. Expo Go then downloads it from Expo's servers —
no computer, no same-Wi-Fi requirement.

This project already includes the two pieces needed for this: the
[`expo-updates`](https://docs.expo.dev/versions/latest/sdk/updates/) package and
an [`eas.json`](eas.json) with a `preview` channel. Follow these steps to
reproduce a publish from a clean checkout:

**One-time setup**

1. Create a **free Expo account** at https://expo.dev/signup (remember the
   username/password — that account owns your published updates).
2. Install the EAS CLI and dependencies:
   ```bash
   npm install                    # if you haven't already
   npm install -g eas-cli         # or use `npx eas-cli@latest` in place of `eas`
   ```
3. Sign in:
   ```bash
   eas login
   ```
4. Link this project to your Expo account. This writes an `extra.eas.projectId`
   into `app.json`:
   ```bash
   eas init
   ```
5. Configure updates. This adds the `updates.url` and a `runtimeVersion` to
   `app.json` so the app knows where to fetch published bundles from:
   ```bash
   eas update:configure
   ```
   > Steps 4–5 edit `app.json` (and may touch `eas.json`) — commit those changes
   > so the setup is reproducible next time.

**Publish (repeat this whenever you change the app)**

6. Bundle the current app and upload it to the `preview` branch:
   ```bash
   eas update --branch preview --message "First version"
   ```
   The command prints a **QR code and a link** (also visible later at
   `https://expo.dev` → your project → **Updates**).

**Open it on the iPhone**

7. Install **Expo Go** from the App Store (if not already), then either:
   - point the **Camera** app at the QR code and tap the banner, or
   - open the printed link on the phone.

   Expo Go downloads the published bundle from Expo's cloud and runs it — your
   computer can be off. It stays in Expo Go's **Recently opened** list, so it
   reopens with one tap; keep the link saved as a backup entry point.

**Ship an update later**

8. Make your changes, then re-run step 6 (`eas update --branch preview ...`).
   The next time the app opens in Expo Go it picks up the new version.

This works because every native module this app uses (date picker,
notifications, local storage, updates) is already built into the Expo Go
runtime. If you ever add a *custom* native module that Expo Go doesn't include,
Expo Go can no longer run it and you'd need a development build instead.

**Troubleshooting**

- *"No compatible build/update found" or nothing loads in Expo Go* — the Expo Go
  app on your phone must support this project's Expo SDK (57). Update Expo Go
  from the App Store, or keep the project on the SDK your Expo Go supports.
- *`eas` command not found* — either `npm install -g eas-cli`, or prefix every
  command with `npx`, e.g. `npx eas-cli@latest update --branch preview`.
- *Wrong account owns the update* — run `eas whoami` to check who you're logged
  in as; `eas logout` then `eas login` to switch.

**Limitations of the Expo Go route** (it's a preview tool, not a store app):

- **No standalone icon** — the app lives *inside* Expo Go (open Expo Go, then the
  project), with Expo Go branding around it.
- **Cache can be cleared** — if Expo Go is deleted or its cache evicted, reopen
  via the saved link/QR. Keep it handy.
- **SDK coupling** — when Expo Go updates in the App/Play Store it targets newer
  SDKs, so occasionally you'd bump this project's Expo SDK to stay compatible.
- **Notifications** — local due-date reminders generally work in Expo Go, though
  Expo increasingly steers notification features toward a development build; the
  app fails safe if a reminder can't be scheduled.
- **Local data** — records live in Expo Go's on-device sandbox, so keep a backup
  if you rely on them (see notes on a future export/restore feature).

For a true home-screen app (own icon, most reliable), the next step up is a
**development build** or a store/**TestFlight** build — see
[Installing it as a standalone app](#installing-it-as-a-standalone-app-optional)
below. Building for iPhone reintroduces Apple signing, so Expo Go + EAS Update is
the best **free** option for personal use.

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

> Note: iOS builds/installs require an Apple Developer account; Android `.apk`
> builds can be installed directly on a device.

> **Reminder about notifications:** local due-date reminders require running on a
> real device (Expo Go or a build), not the web preview or a fresh simulator
> without notification permissions.

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
