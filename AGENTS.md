# Finance Tracker Agent Instructions

## Project

Finance Tracker is a React Native / Expo mobile app written in TypeScript.

Primary stack:

- TypeScript
- React Native
- Expo / Expo Router
- Supabase Auth and database
- Vitest for tests

## Architecture

Follow Clean Architecture, DDD, SOLID, and Dependency Inversion.

Layer rules:

- Domain contains business rules only.
- Application contains use cases, commands, queries, ports, and orchestration.
- Infrastructure implements ports for Supabase, storage, notifications, files, native APIs, and crypto.
- Presentation contains screens, components, hooks, and ViewModels only.
- Do not call Supabase, SecureStore, AsyncStorage, notifications, file APIs, or crypto directly from React components.
- Do not put business rules in Presentation.

## Expo Router Boundary

The root `app/` directory is for Expo Router route files only.

Allowed in `app/`:

- `_layout.tsx`
- Screen files with a default export
- Route group directories such as `(tabs)/` and `(auth)/`
- Expo Router special files such as `+html.tsx` and `+not-found.tsx`

Never put providers, guards, services, utilities, constants, types, or platform adapters in `app/`.

Do not create any directory named `app` under `src/`. Use role-based names such as `bootstrap/`, `navigation/`, `providers/`, `platform/`, `core/`, or `features/`.

`.expo/` is generated. Do not edit or commit `.expo/types/router.d.ts` manually.

## Implementation

Prefer small, focused, reviewable changes.

Before changing code:

- Inspect the existing architecture and local patterns.
- Identify the exact root cause for bugs before editing.
- Preserve unrelated user changes in the working tree.

When implementing features:

- Work inside-out when practical: Domain -> Application -> Infrastructure -> Presentation -> Integration.
- Add abstractions only when they match existing boundaries or remove real duplication.
- Keep commits focused.
- Do not commit `.idea/`, local editor files, generated temp files, or unrelated worktree changes.

## Supabase And Security

For Supabase/Auth work:

- Do not weaken RLS.
- Do not hardcode credentials, JWTs, API keys, or user IDs.
- Preserve secure session persistence.
- Keep auth/session bootstrap separate from UI navigation guards.

For backup, restore, encryption, or financial data export:

- Do not claim encryption is implemented unless authenticated encryption and integrity verification are real.
- Never ship placeholder crypto, fake tags, default passphrases, or reversible obfuscation as security.
- Strip auth/session tokens from export payloads.

## Verification

Run checks proportional to the change.

Typical checks:

- `npx tsc --noEmit`
- `npm test`
- `npx expo-doctor`
- Android build/runtime verification when native, auth, navigation, storage, Expo config, or app startup behavior changes.

When reporting completion:

- State root cause.
- List changed files.
- Summarize verification results.
- Mention any manual test still needed.

If a check is unavailable or not relevant, report it as not run with the reason. Do not claim it passed.

## Documentation

Keep docs synchronized with implementation.

Only mark phases as Approved or Frozen when implementation and verification actually match the documented architecture.
