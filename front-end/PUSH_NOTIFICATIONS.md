# Push notifications — how to test

## Pick your path

| You have | Use | Cost |
|---|---|---|
| **A Mac** | [Option S — iOS Simulator + `simctl push`](#option-s--ios-simulator-on-a-mac-free) | Free |
| **Android phone** | [Option A — Firebase Console](#option-a--firebase-console-android-only-no-extra-setup) | Free |
| **iPhone only, Windows PC** | [Option 0 — local notifications in Expo Go](#option-0--local-notifications-on-iphone-free) | Free |
| **iPhone + Apple Developer membership** | [Option B — Expo push tool](#option-b--expo-push-tool-android-and-ios) | $99/yr |

Remote push cannot reach a **physical** iPhone without a paid Apple Developer
membership. Firebase is not a way around this — it delivers to iOS *through*
Apple's APNs, so it needs the same APNs key.

The iOS **Simulator** is the exception, and it is the best free option: it
receives real remote notifications via `xcrun simctl push` with no account, no
key and no server.

---

## Option S — iOS Simulator on a Mac (free)

The closest you can get to real iOS push without paying Apple. Simulator builds
need no code signing, and `simctl push` needs no credentials.

```bash
cd front-end
npm install
npx expo run:ios          # builds for the simulator — no Apple account needed
```

Sign in and allow the notification prompt. Then, from a second terminal:

```bash
xcrun simctl push booted scripts/sim-push/appointment.json
```

The payloads in [`scripts/sim-push/`](scripts/sim-push/) are the exact shape the
real backend sends, so the app cannot tell them apart from a genuine APNs
delivery. See that folder's [README](scripts/sim-push/README.md) for testing the
background and killed states.

What it does not prove: that Apple would accept your credentials — nothing leaves
the machine.

> Copy `front-end/.env` to the Mac by hand. It is gitignored, and without it
> Clerk and Supabase will not work, so you will not get past the login screen.

---

## Option 0 — Local notifications on iPhone (free)

Covers the permission prompt, banner, sound, the in-app notification drawer,
tap-to-deep-link, and cold-start handling. It does **not** cover actual delivery
from a server — nothing free can test that on an iPhone.

```bash
cd front-end
npx expo start
```

Scan the QR code with the Camera app to open in **Expo Go**, sign in, then go to
**Settings → Developer → Fire a test notification**.

Two delays are offered:

- **Now** — verifies the foreground banner, sound, and the in-app drawer entry
- **In 10 seconds** — background or fully close the app first, then check the
  tray notification and that tapping it navigates to History

The Developer section is wrapped in `__DEV__`, so it does not exist in a
production build.

> The consultation/video-call screens crash in Expo Go because LiveKit is a
> native module Expo Go does not include. Home, Settings and notifications are
> unaffected.

---

## First: the remote-push options need a development build

Expo Go cannot receive push notifications on either platform. `google-services.json`
is only compiled into the app during a build, so a real build is required:

```bash
cd front-end
npx expo run:android                                    # Android, over USB from Windows
npx eas build --profile development --platform ios      # iOS, built in EAS cloud
```

Emulators and simulators cannot receive remote push either. Use a real device.

iOS additionally needs a paid Apple Developer Program membership — see
[On iPhone specifically](#on-iphone-specifically).

## Getting your token

Sign in to the app. The Metro terminal prints both tokens at registration:

```
────────────────────────────────────────────────────────────────
 PUSH TOKENS — android   user_id: 9b1deb4d-…   role: patient
────────────────────────────────────────────────────────────────
 FCM (Firebase Console → Cloud Messaging → Send test message):
 dXe2Kp8QSm...

 Expo (expo.dev/notifications):
 ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
────────────────────────────────────────────────────────────────
```

They are also under **Settings → the bug row at the bottom** (dev builds only).

The two tokens are different addresses for the same phone and are **not**
interchangeable — each tool below accepts only its own kind.

---

## Option A — Firebase Console (Android only, no extra setup)

Works immediately with the Firebase project you already have.

1. [Firebase Console](https://console.firebase.google.com/) → project **mediquick-4037f**
2. Left sidebar → **Engage → Messaging** → **Create your first campaign**
3. Choose **Firebase Notification messages** → **Create**
4. Enter a title and body
5. Click **Send test message** (right-hand panel)
6. Paste the **FCM** token → click **+** to add it → tick it → **Test**

The notification should arrive within a couple of seconds.

To test tap-to-navigate, use **Additional options (optional)** → **Custom data**
and add:

| Key | Value |
|---|---|
| `route` | `/(tabs)/history` |
| `type` | `appointment` |

> Firebase cannot reach iOS in this app. An iPhone running `expo-notifications`
> produces an **APNs** token, and Firebase only accepts FCM tokens — reaching iOS
> through Firebase would require compiling the Firebase iOS SDK into the app.
> Use Option B or the test engine for iOS.

---

## Option B — Expo push tool (Android **and** iOS)

Works on both platforms, but needs an EAS project first.

### One-time setup

```bash
cd front-end
npx eas init          # creates the project, writes extra.eas.projectId into app.json
npx eas credentials   # Android → FCM V1 → upload your service-account JSON
                      # iOS → let EAS create an APNs key (needs an Apple Developer account)
```

`projectId` lives in `extra` in app.json, which the dev server sends to the app in
its manifest — so a full native rebuild is **not** needed. Just restart Metro:

```bash
npx expo start --clear
```

Reload the app and the Expo token appears in the terminal. Until `eas init` has
been run the Expo token is simply absent and the terminal says so; the FCM token
still works for Option A.

### On iPhone specifically

Getting an Expo token on a physical iPhone requires a **paid Apple Developer
Program membership ($99/year)**. This is an Apple restriction, not an Expo one:
Push Notifications is an entitlement, and Apple does not grant entitlements to
free "Personal Team" accounts.

You do not need a Mac — EAS builds iOS on Apple hardware in the cloud.

```bash
cd front-end
npx eas init
npx eas device:create                                   # register the iPhone's UDID
npx eas build --profile development --platform ios
```

During the build, EAS asks for your Apple account and then automatically
registers the bundle id, creates the signing certificate and provisioning
profile, and **creates and uploads the APNs key** — that last step is what makes
push actually deliver.

Install the finished build via the QR code, then:

```bash
npx expo start --dev-client
```

Open the app, sign in, allow notifications, and the token appears in the terminal.

> Before registering with Apple, consider changing `ios.bundleIdentifier` in
> app.json from the placeholder `com.anonymous.MediQuick` to a real reverse-domain
> id. It is awkward to change once the app is on the App Store.

### Sending

1. Go to **https://expo.dev/notifications**
2. Paste the **`ExponentPushToken[…]`** value
3. Fill in title and body
4. Under **Data**, add JSON for deep-link testing:
   ```json
   { "type": "appointment", "route": "/(tabs)/history" }
   ```
5. **Send a notification**

---

## Option C — the local test engine

`notification-test-engine/` sends to Android via Firebase and iOS via Apple
directly, and looks devices up by user id. Useful when testing the real
server-side flow rather than a one-off message. See its
[README](../notification-test-engine/README.md).

---

## What to check

Test all three app states — they take different code paths:

| State | Expected |
|---|---|
| **Open and focused** | Banner + sound, and a new entry in the in-app notification drawer |
| **Backgrounded** (home button) | System tray notification; tapping it navigates to the `route` in the data payload |
| **Killed** (swiped from recents) | Tapping the tray notification cold-starts the app and still navigates |

## Troubleshooting

| Symptom | Cause |
|---|---|
| No token printed at all | Running in Expo Go or on an emulator, or notification permission was denied |
| `Expo: not available` | `eas init` has not been run — expected, and only affects Option B |
| Firebase Console says sent, nothing arrives | Battery optimisation is throttling the app, or Cloud Messaging API (V1) is disabled in Google Cloud for the project |
| Nothing arrives on iOS via Firebase | Expected — see the note in Option A |
| Tap does nothing | The `route` key is missing from the data payload, or the route does not exist |
