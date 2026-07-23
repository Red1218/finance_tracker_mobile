# ADR-011: Expo Router Directory Boundary

**Status:** ✅ Approved
**Date:** 2026-07

---

## Context

Finance Tracker uses Expo Router for file-based routing. Expo Router scans for
route files by discovering directories named `app` relative to the project root.
Any `.tsx` or `.ts` file found under such a directory is treated as a route
definition and must export a React component as its default export.

Prior to this decision, the project maintained infrastructure modules under
`src/app/bootstrap`, `src/app/navigation`, and `src/app/providers`. These
modules contain named exports only (HOCs, class components, constants) and have
no default export, because they are not screens — they are application
infrastructure.

---

## Problem

Expo Router misidentified the `src/app/` directory as a route source directory,
causing the following runtime warnings on every boot:

```
Route "./bootstrap/Bootstrap.tsx" is missing the required default export.
Route "./navigation/AuthGuard.tsx" is missing the required default export.
Route "./providers/AppProvider.tsx" is missing the required default export.
```

The application also opened to an "Unmatched Route" screen (`mobiletemp:///`)
because the router could not resolve the initial route correctly.

---

## Decision Drivers

- **Correctness** — Expo Router must only discover actual route files
- **Clarity** — Infrastructure modules must not be reachable as routes
- **Safety** — The rule must prevent recurrence without relying on developer memory
- **Scope** — Fix routing structure without touching business logic

---

## Considered Alternatives

| Alternative | Reason Rejected |
|-------------|----------------|
| Add `app.json` `router.root` override to exclude `src/app` | Expo Router does not support granular exclusion of subdirectories; configuration options are coarse |
| Rename `src/app/` to `src/application/` | Changes the meaning of the directory without improving clarity of purpose for each module |
| Keep infrastructure in `src/app/` and add stub default exports | Violates architectural intent — default exports in non-route files mislead Expo Router into treating them as screens |
| Move screens from `app/` into `src/app/` and delete the top-level `app/` | Increases configuration complexity and diverges from Expo Router conventions |

---

## Decision

**Infrastructure modules must never reside in any directory path that contains a
segment named `app`.**

Expo Router's route discovery is path-based. Any directory named `app` anywhere
in the project may be scanned as a route source. The only safe boundary is a
physical separation: route files in `app/`, everything else outside it.

### Directory Assignments

| Module type | Assigned location | Rationale |
|-------------|------------------|-----------|
| Expo Router route files | `app/` | Framework convention — required |
| Application composition root | `src/bootstrap/` | Bootstrap wraps the app, not a route |
| Navigation infrastructure (guards, loading, routes) | `src/navigation/` | Navigation is infrastructure, not a screen |
| Provider composition | `src/providers/` | Dependency injection layer, not a screen |
| Feature screens (presentation layer) | `src/features/<feature>/presentation/` | Feature-scoped; routed via `app/(tabs)/<screen>.tsx` |

### The Invariant

```
app/            ← routes ONLY: _layout.tsx, screen files, route groups
src/            ← everything else: MUST NOT contain any directory named `app`
```

### Generated Files

Expo Router generates route type declarations in `.expo/types/router.d.ts` based
on the discovered route manifest. This file:

- Is excluded from source control via `.gitignore` (`.expo/` is gitignored)
- Must **never** be edited by hand
- Must be regenerated via `npx expo start --clear` whenever the route structure changes

If the generated file becomes stale (e.g., after a migration), the correct
remediation is:

```powershell
Remove-Item -Recurse -Force .expo
npx expo start --clear
```

---

## Consequences

### Positive

- Expo Router produces zero "missing default export" warnings
- The initial route resolves correctly — no "Unmatched Route" screen
- The directory structure clearly communicates the role of each module
- TypeScript typed routes (`typedRoutes: true`) generate correct path types
- The separation is enforceable through code review and tooling rules

### Tradeoffs

- Developers accustomed to an `src/app/` convention must learn the project's
  deliberate separation of `app/` (routes) from `src/` (infrastructure)
- Renaming directories requires updating all import paths (one-time cost already paid)

---

## Enforcement Rules

The following rules are derived from this decision and must be observed on all
future changes:

1. **`app/` is reserved exclusively for Expo Router route definitions.**
   It must contain only `_layout.tsx`, screen files, and route group directories.

2. **No infrastructure module may be placed inside `app/` or any directory
   named `app`.**
   Infrastructure includes: providers, guards, HOCs, utilities, services,
   repositories, constants, types.

3. **No new directory named `app` may be created anywhere under `src/`.**
   If a module group needs a home, choose a name that describes its role
   (`bootstrap/`, `navigation/`, `providers/`, `platform/`, etc.).

4. **`.expo/` must not be committed to source control.**
   It is gitignored. Generated files within it are not maintained manually.

5. **When route structure changes, run `npx expo start --clear`.**
   This regenerates the route manifest and typed route declarations atomically.

---

## Future Considerations

If the project adopts Expo Router's `expo.router.root` configuration option to
set an explicit route root (e.g., `"router": { "root": "app" }`), this ADR
should be revisited to confirm whether `src/app` exclusion becomes configurable.
Until then, the physical separation described here is the enforceable contract.
