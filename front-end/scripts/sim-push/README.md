# iOS Simulator push payloads

Deliver a real remote notification to the iOS Simulator with no Apple Developer
account, no APNs key, and no server. Requires a Mac with Xcode.

```bash
cd front-end
npx expo run:ios                                    # simulator build — no code signing needed
xcrun simctl push booted scripts/sim-push/appointment.json
```

`booted` targets whichever simulator is currently running. The bundle id is read
from the `Simulator Target Bundle` key inside each payload.

## What this actually tests

These payloads are byte-for-byte the shape the real backend sends — `aps` for the
alert, custom keys at the top level for the app to read — so the app cannot tell
the difference between this and a genuine APNs delivery. It exercises the real
remote-notification path: payload parsing, the foreground handler, the in-app
drawer, and tap-to-deep-link.

The one thing it does not prove is that Apple's servers will accept your
credentials, since nothing leaves the machine.

## Testing each app state

| State | How | Expected |
|---|---|---|
| Foreground | App open, run the command | Banner + sound, new entry in the in-app drawer |
| Background | Press Cmd+Shift+H, then run | Notification in tray; tapping opens History |
| Killed | Swipe the app away, then run | Notification in tray; tapping cold-starts to History |

## Notes

- If `Simulator Target Bundle` does not match, pass the bundle id explicitly:
  `xcrun simctl push booted com.anonymous.MediQuick scripts/sim-push/appointment.json`
- If you change `ios.bundleIdentifier` in app.json, update it in these files too.
- Notification permission must have been granted in the app first — sign in and
  allow the prompt, or use Settings → Developer → Fire a test notification once.
- `route` must match a real route. `/(tabs)/…` for patients, `/(tabs2)/…` for doctors.
