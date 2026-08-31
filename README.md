# MediQuick — SIH 2026

## Layout

```
front-end/   Expo / React Native app  (all app code lives here)
back-end/    API server               (not scaffolded yet)
```

## Running the app

Everything runs from `front-end/`, **not** the repo root:

```bash
cd front-end
npm install
npx expo start
```

You also need `front-end/.env`, which is gitignored — ask the team for a copy. It
holds the Supabase URL / anon key and the Clerk publishable key. Expo reads `.env`
from the folder containing `app.json`, so it must sit in `front-end/`; a copy at the
repo root is ignored without any warning.

## If you're pulling after the front-end/ restructure

The app used to live at the repo root and has moved back down into `front-end/`.
After pulling:

1. Commit or stash any in-flight work **before** pulling, or you'll get conflicts on
   the old root paths.
2. `cd front-end && npm install` — your old root `node_modules` is now orphaned and
   can be deleted.
3. Move your `.env` from the repo root into `front-end/`.
4. Run `npx expo start` from `front-end/`. Running it from the root will fail.

If routes behave strangely afterwards, a stale Expo cache is the usual cause:
`npx expo start -c`.

## Learn more

- [Expo documentation](https://docs.expo.dev/) — this project targets
  [SDK 54](https://docs.expo.dev/versions/v54.0.0/)
- [expo-router](https://docs.expo.dev/router/introduction) — routing is file-based;
  `front-end/app/` is the route table
