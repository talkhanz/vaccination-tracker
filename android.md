# Running Vaccinator on Android (standalone app)

This guide covers installing Vaccinator as a **real, standalone Android app** —
its own home-screen icon, data that persists, and working reminders — by
building an **APK** with [EAS Build](https://docs.expo.dev/build/introduction/)
and installing it directly on your phone.

No Google Play account is needed, and no purchase — a **free Expo account**
covers the cloud build, and installing an APK on your own phone is free.

> Just want a quick look first? Use Expo Go: `npm start`, then scan the QR with
> the Expo Go app. See the main [README](README.md#running-the-app). This guide
> is for keeping the app on your phone for everyday use.

---

## Prerequisites (one time)

1. [Node.js](https://nodejs.org) 20+ installed, and project deps installed:
   ```bash
   npm install
   ```
2. A free Expo account — sign up at <https://expo.dev/signup>.
3. The EAS CLI:
   ```bash
   npm install -g eas-cli      # or prefix commands below with `npx eas-cli@latest`
   ```
4. Sign in and link the project (writes an `extra.eas.projectId` into `app.json`):
   ```bash
   eas login
   eas init
   ```

## Build the APK

The project's [`eas.json`](eas.json) has a `preview` profile configured to
output an installable **APK**:

```bash
eas build --profile preview --platform android
```

- The build runs in Expo's cloud (a few minutes). It handles the Android signing
  keystore for you.
- When it finishes, the terminal prints a **build page URL with a QR code and a
  download link** for the `.apk`. The build is also listed at
  <https://expo.dev> → your project → **Builds**.

## Install it on your phone

1. On the phone, open the build link (scan the QR, or open the URL) and **download
   the APK**.
2. Tap the downloaded file to install. The first time, Android will ask to
   **allow installing unknown apps** for your browser/Files app — enable it, then
   confirm the install.
3. Open **Vaccinator** from your home screen. Tap **Allow** if it asks for
   notification permission (needed for due-date reminders).

That's it — it now runs on its own, with no computer or dev server required.

## Shipping updates later

You have two ways to update the installed app:

- **JS-only changes (fastest)** — push an over-the-air update; the app picks it up
  the next time it's opened, no reinstall:
  ```bash
  eas update --branch preview --message "what changed"
  ```
- **Native changes** (new native module, app icon, permissions, SDK bump) — build
  and install a fresh APK (repeat the two steps above). Installing the new APK
  over the old one keeps your data, because EAS reuses the same signing key.

## Troubleshooting

- **`eas: command not found`** — run `npm install -g eas-cli`, or prefix commands
  with `npx eas-cli@latest`.
- **"App not installed" / blocked install** — make sure "install unknown apps" is
  allowed for the app you're installing *from* (your browser or Files app), then
  retry.
- **Reminders don't fire** — confirm notifications are enabled for Vaccinator in
  Android **Settings → Apps → Vaccinator → Notifications**, and that reminders are
  turned on in the app's **Settings**.
- **Wrong Expo account owns the build** — check with `eas whoami`; use
  `eas logout` then `eas login` to switch.

## Notes

- Your data lives **only on the device**. Before reinstalling or switching
  phones, export a backup from **Settings → Backup & restore** (see the
  [README](README.md#backing-up-your-data)).
- For distributing to others or the Play Store, use the `production` profile
  (`eas build --profile production --platform android`), which produces an **AAB**
  for Google Play. That path requires a Google Play Developer account and is
  beyond this personal-use guide.
