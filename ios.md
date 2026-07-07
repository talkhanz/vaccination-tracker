# Running Vaccinator on iPhone

On iPhone, the easiest and **free** way to run Vaccinator is through **Expo Go**
(a free App Store app). It needs **no Apple Developer account**. A true
standalone app with its own icon is possible too, but it requires a paid Apple
Developer account — see the last section.

Because this app only uses modules already built into Expo Go, Expo Go can run
it directly.

---

## Option 1 — Expo Go, without your computer (recommended)

Publish your app once to Expo's cloud with **EAS Update**, then open it in Expo
Go on the iPhone. Your computer can be off afterwards.

**One-time setup**

1. Install [Node.js](https://nodejs.org) 20+ and the project deps: `npm install`
2. Create a free Expo account at <https://expo.dev/signup>.
3. Install the EAS CLI and sign in:
   ```bash
   npm install -g eas-cli      # or prefix commands with `npx eas-cli@latest`
   eas login
   eas init                    # links the project (writes projectId to app.json)
   eas update:configure        # sets updates URL + runtimeVersion in app.json
   ```
   (See [Running the app](README.md#running-the-app) in the README for more
   detail — this project already includes `expo-updates`.)

**Publish (repeat whenever the app changes)**

```bash
eas update --branch preview --message "ios test"
```
> Plain `eas update` publishes for **all** platforms. Don't pass
> `--platform android`, or the iOS bundle won't be included.

> **"Select environment" prompt** — choose **`preview`** to match the `preview`
> branch (`development` is for local dev; `production` is for a live release).
> It only selects which EAS environment variables are used when bundling; this
> app defines none, so the choice is about consistency. Skip the prompt next
> time by adding the flag:
> ```bash
> eas update --branch preview --environment preview --message "ios test"
> ```

**Open it on the iPhone**

1. Install **Expo Go** from the App Store.
2. Open Expo Go and **sign in with the same Expo account** that owns the project
   (needed to open your own published update).
3. Open the update: go to <https://expo.dev> → your project → **Updates** → the
   latest update, and scan its QR with the iPhone **Camera** app (or tap "Open
   with Expo Go"). The QR that `eas update` printed also works.
4. Tap **Allow** if it asks for notification permission (for reminders).

It downloads from Expo's cloud and runs — no computer needed. To ship changes,
run `eas update` again; the next launch picks them up.

## Option 2 — Expo Go via the dev server (quick local testing)

Fastest for trying changes live, but tied to your computer.

1. Install **Expo Go** from the App Store.
2. In the project: `npm start`
3. Point the iPhone **Camera** at the terminal QR and tap the "Open in Expo Go"
   banner.

Your Mac/PC and iPhone must be on the **same Wi‑Fi**. If it won't connect
(common on public/corporate networks), use `npx expo start --tunnel` and scan
that QR instead.

## Good to know

- **Keep Expo Go current** — Expo Go supports the latest SDK; this project is
  SDK 57, so an up-to-date Expo Go will match.
- **Runs inside Expo Go** — no separate home-screen icon or custom branding, and
  if Expo Go's cache is cleared you reopen via the saved link/QR.
- **Reminders** — local notifications generally work in Expo Go; allow
  notifications when prompted.
- **Your data is private** — records stay on the device; EAS only hosts the app's
  code, never your data. Export a backup from **Settings → Backup & restore**
  before switching phones (see [README](README.md#backing-up-your-data)).

## Troubleshooting

- **Can't open the update / "not found"** — make sure you're signed into Expo Go
  with the account that owns the project, and that your last `eas update`
  included iOS (don't restrict `--platform`).
- **`eas: command not found`** — `npm install -g eas-cli`, or prefix with
  `npx eas-cli@latest`.
- **Dev-server QR won't connect** — same Wi‑Fi, or use `npx expo start --tunnel`.

## Standalone iOS app (own icon) — requires a paid Apple account

For a real home-screen app installed outside Expo Go, build with EAS and
distribute via **TestFlight**:

```bash
eas build --profile preview --platform ios
```

This requires an **Apple Developer Program** membership ($99/year) for signing
and TestFlight distribution (a free Apple ID only allows 7‑day sideloaded
installs). For personal use, **Option 1 (Expo Go) is simpler and free** — prefer
it unless you specifically need the standalone app.
