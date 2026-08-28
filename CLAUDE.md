# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

The repo root contains only `LICENSE` and `README.md`. **All application code lives in `MediQuick/`** — run every command from that directory, not the repo root.

`MediQuick/CLAUDE.md` re-exports `MediQuick/AGENTS.md`, which carries one standing rule:

> **Expo has changed.** Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

Expo SDK 54, expo-router 6, React 19.1, and React Native 0.81 all differ substantially from older patterns in training data — verify APIs against the v54 docs rather than recalling them.

## Commands

All from `MediQuick/`:

```bash
npm install
npm start              # expo start — dev server + QR code
npm run android        # expo start --android
npm run ios            # expo start --ios
npm run web            # expo start --web
npm run lint           # expo lint (ESLint flat config, eslint-config-expo)
npx tsc --noEmit       # typecheck (strict mode; no npm script for this)
```

There is no test framework configured — no test runner, no test files, nothing to run a single test with. If tests are needed, one must be added first.

`npm run reset-project` moves the starter `app/`, `components/`, `hooks/`, `constants/`, `scripts/` into `app-example/` and scaffolds a blank `app/`. It is destructive to the current tree — confirm before running.

## Architecture

**Routing is file-based** via expo-router. `MediQuick/app/` *is* the route table:

- `app/_layout.tsx` — root Stack. Wraps everything in `@react-navigation/native`'s `ThemeProvider`; declares the `(tabs)` group (headerless) and `modal` (modal presentation). `unstable_settings.anchor = '(tabs)'` sets the deep-link fallback route.
- `app/(tabs)/_layout.tsx` — bottom tab bar; each `<Tabs.Screen name>` must match a file in `app/(tabs)/`.
- Typed routes are enabled (`experiments.typedRoutes`), so `href` strings are checked against actual route files. Route types regenerate into `.expo/types/` when the dev server runs — a stale `href` type error usually means the dev server hasn't rebuilt them.

**Theming runs through two parallel systems that must be kept in sync:**

1. `constants/theme.ts` exports `Colors.light` / `Colors.dark` (plus platform `Fonts`). Consumed via `hooks/use-theme-color.ts` → `ThemedText` / `ThemedView`, which accept per-instance `lightColor` / `darkColor` overrides. Adding a color key means adding it to *both* `light` and `dark` — `useThemeColor`'s `colorName` param is typed as the intersection of the two.
2. React Navigation's own `DarkTheme` / `DefaultTheme` in `app/_layout.tsx`, which colors headers, tab bars, and screen backgrounds. Changing `Colors` alone will not restyle navigation chrome.

`hooks/use-color-scheme.ts` is a plain re-export of RN's hook; `use-color-scheme.web.ts` is a platform override that returns `'light'` until hydration, because web output is statically rendered (`web.output: "static"`) and the server has no color scheme.

**Cross-platform component pattern:** `components/ui/icon-symbol.ios.tsx` uses native SF Symbols; `icon-symbol.tsx` is the Android/web fallback that maps SF Symbol names to MaterialIcons through a hand-maintained `MAPPING` object. Metro picks the `.ios` variant automatically. **Any new icon name must be added to `MAPPING`** or it renders nothing on Android/web — the `IconSymbolName` type is derived from `MAPPING`'s keys, so TypeScript catches unmapped names at the call site. `components/haptic-tab.tsx` follows the same shape, gating haptics on `process.env.EXPO_OS === 'ios'` rather than branching at build time.

**Imports use the `@/*` alias**, mapped in `tsconfig.json` to the `MediQuick/` root (e.g. `@/components/themed-text`, `@/assets/images/icon.png`).

## Project state

`app/(tabs)/index.tsx`, `app/(tabs)/explore.tsx`, and `app/modal.tsx` are still the unmodified `create-expo-app` starter screens (React logo, "Step 1: Try it"), as are `MediQuick/README.md` and the `hello-wave` / `parallax-scroll-view` / `collapsible` components. None of it is MediQuick product code yet. Treat these as scaffolding to replace, not as conventions to imitate.

`app.json` has the New Architecture (`newArchEnabled`) and the React Compiler (`experiments.reactCompiler`) both enabled. Under the React Compiler, avoid hand-written `useMemo` / `useCallback` unless profiling shows a need, and be aware that Rules-of-React violations become build-time errors rather than subtle bugs.

There is no `ios/` or `android/` directory — this is a managed (CNG) project and both are gitignored. Native config belongs in `app.json` plugins, not in generated native files.
