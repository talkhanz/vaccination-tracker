# Running Vaccinator on iPhone

On iPhone, the easiest and **free** way to run Vaccinator is through **Expo Go**
(a free App Store app, **no Apple Developer account** needed) using your
computer's dev server. Running it **computer-free** on iPhone needs a real build,
which requires a paid Apple Developer account — see the last section.

> **Why can't I use a published `eas update` in Expo Go?** Expo Go only opens
> updates whose runtime matches its own SDK-based runtime (`exposdk:57.0.0`).
> This project publishes updates with `runtimeVersion: appVersion` (for the
> standalone **build**), so Expo Go rejects them with *"This project is
> incompatible with this version of Expo Go."* That's expected — published EAS
> Updates are for your app builds, not Expo Go. Use the dev-server route below.

---

## Option 1 — Expo Go via the dev server (recommended, free)

The reliable way to run it in Expo Go. It uses the SDK directly (ignoring the
EAS Update runtime), so it just works — but your computer must be running.

1. Install [Node.js](https://nodejs.org) 20+ and the project deps: `npm install`
2. On the iPhone, install **Expo Go** from the App Store — and **update it** so it
   supports this project's Expo SDK (57).
3. Start the dev server on your computer:
   ```bash
   npm start            # or: npx expo start --tunnel
   ```
4. Point the iPhone **Camera** at the QR code in the terminal and tap the "Open
   in Expo Go" banner.
5. Tap **Allow** if it asks for notification permission (for reminders).

Your Mac/PC and iPhone must be on the **same Wi-Fi**. If it won't connect
(common on public/corporate networks), use `npx expo start --tunnel` and scan
that QR instead.

> Still see "incompatible with this version of Expo Go" here? Then the installed
> Expo Go doesn't support SDK 57 — update Expo Go from the App Store. (If Expo Go
> has moved past SDK 57, tell me and we can align the project's SDK.)

## Option 2 — Run it computer-free on iPhone (needs a build)

Expo Go always depends on either your dev server or a compatible published
update, so for a self-contained app on iPhone you need a real build:

- **Standalone app / TestFlight** — requires a paid **Apple Developer Program**
  membership ($99/year) for signing and distribution (a free Apple ID only allows
  7-day sideloaded installs):
  ```bash
  eas build --profile preview --platform ios
  ```
- **No Apple account?** Use the **Android APK** instead — it runs computer-free on
  an Android phone with no developer account. See [android.md](android.md).

## Good to know

- **Keep Expo Go current** — Expo Go supports the latest SDK; this project is
  SDK 57, so an up-to-date Expo Go will match.
- **Runs inside Expo Go** — no separate home-screen icon or custom branding.
- **Reminders** — local notifications generally work in Expo Go; allow
  notifications when prompted.
- **Your data is private** — records stay on the device; EAS only hosts the app's
  code, never your data. Export a backup from **Settings → Backup & restore**
  before switching phones (see [README](README.md#backing-up-your-data)).

## Troubleshooting

- **"This project is incompatible with this version of Expo Go"**
  - When opening a **published `eas update`**: expected — Expo Go can't open this
    project's updates (see the note at the top). Use the dev server (Option 1).
  - When using the **dev server**: your Expo Go is older than SDK 57 — update it
    from the App Store.
- **Dev-server QR won't connect** — same Wi-Fi, or use `npx expo start --tunnel`.
- **`eas: command not found`** — `npm install -g eas-cli`, or prefix with
  `npx eas-cli@latest`.
