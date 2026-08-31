# CLAUDE.md

Guidance for Claude Code (claude.ai/code) working in this repository.

## Repository layout

This is a two-folder monorepo:

- **`front-end/`** — the Expo / React Native app. All app code, `package.json`,
  `tsconfig.json`, and `node_modules` live here.
- **`back-end/`** — the API server. Not scaffolded yet.

**Run every frontend command from `front-end/`, not the repo root.** There is no
`package.json` at the root, so `npm install` and `npx expo start` fail here.

```bash
cd front-end
npm install
npx expo start
```

`front-end/CLAUDE.md` re-exports `front-end/AGENTS.md`, which carries the standing
rule for app code: Expo SDK 54 differs substantially from older patterns in training
data, so verify APIs against https://docs.expo.dev/versions/v54.0.0/ before writing.

## Environment

Secrets are gitignored and never committed. `front-end/.env` must exist for the app
to work, and it belongs in `front-end/` — Expo reads `.env` from the folder holding
`app.json`, so a copy left at the repo root is silently ignored.

Required keys:

- `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` — read by
  `front-end/lib/supabase.ts`. Both fall back to `''`, so a missing `.env` produces
  a client pointed at nothing rather than an error: the gallery tab just stays empty.
- The Clerk publishable key, for auth.
