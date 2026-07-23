# Finance Tracker — Architecture

**Version:** 1.2
**Status:** Active
**Last Updated:** 2026-07 (Platform Authentication Consolidation)

---

## Overview

Finance Tracker is a React Native mobile application built with Expo Router, Supabase, and TanStack Query.

The architecture enforces strict layer separation, feature isolation, and database-level security. Each layer has a single, well-defined responsibility. Dependencies flow in one direction only.

---

## Application Layers

```
UI (React Native Screens)
        ↓
React Query (Server State Cache)
        ↓
Service Layer (Business Logic)
        ↓
Repository Layer (Data Access)
        ↓
Supabase Client
        ↓
PostgreSQL + RLS
```

No component communicates directly with Supabase. The only entry point to the database is the Repository Layer.

---

### UI Layer

**Responsibility:** Render data. Handle user interaction. Dispatch state changes.

- Route screens live exclusively in `app/` using Expo Router file-based routing
- Feature-specific components live in `src/features/<feature>/components/`
- Shared UI components live in `src/components/`
- Contains no business logic
- Contains no direct database access

> **Routing boundary rule:** `app/` must contain only Expo Router route files (`_layout.tsx`, screen files, route groups). Infrastructure modules — bootstrap, navigation guards, providers — must never be placed inside `app/` or any directory named `app`. See [ADR-011](./adr/ADR-011-expo-router-directory-boundary.md).

---

### React Query Layer

**Responsibility:** Own all server state. Cache, sync, and invalidate data.

- All data fetching goes through a `useQuery` hook
- All mutations go through a `useMutation` hook that calls a service function
- Query keys are namespaced per feature and filtered context
- Mutations invalidate related queries after success
- No manual state synchronization with server data

---

### Service Layer

**Responsibility:** Coordinate business workflows. Apply business rules.

- Services call repositories — they do not call Supabase directly
- Services enforce business constraints (e.g., prevent assigning a spend to an archived category)
- Services translate low-level persistence errors into user-facing business errors
- Services contain no UI logic and no React imports

**File naming:** `<feature>.service.ts`

---

### Repository Layer

**Responsibility:** Manage all database interactions. Map database rows to domain models.

- Repositories call the Supabase client
- Repositories map `Database['public']['Tables']['x']['Row']` to domain model types
- Repositories contain no business logic
- Repositories do not filter by `user_id` — Row Level Security handles tenant isolation automatically

**File naming:** `<feature>.repository.ts`

---

### Database Layer

**Responsibility:** Enforce data integrity, referential integrity, authorization, and consistency.

- PostgreSQL hosted on Supabase
- Row Level Security (RLS) is enabled on all user-owned tables
- `FORCE ROW LEVEL SECURITY` is set to prevent bypass via elevated roles
- Schema changes are made exclusively through migrations
- Applied migrations are immutable

---

## Folder Structure

```
app/                            ← Expo Router route files ONLY
├── _layout.tsx                 ← Root layout (provider tree, navigation shell)
├── auth.tsx                    ← Authentication screen
├── +html.tsx                   ← Web HTML root (web-only)
└── (tabs)/                     ← Tab navigator route group
    ├── _layout.tsx
    ├── index.tsx
    ├── categories.tsx
    ├── spends.tsx
    ├── finances.tsx
    └── budgets.tsx

src/
├── bootstrap/                  ← Application composition root
│   ├── Bootstrap.tsx           ← Top-level provider + error boundary wrapper
│   ├── ErrorBoundary.tsx       ← React error boundary
│   └── index.ts
│
├── navigation/                 ← Navigation infrastructure
│   ├── AuthGuard.tsx           ← Redirects unauthenticated users to /auth
│   ├── GuestGuard.tsx          ← Redirects authenticated users away from /auth
│   ├── NavigationContainer.tsx ← Thin navigation wrapper
│   ├── NavigationLoading.tsx   ← Loading state during auth resolution
│   ├── routes.ts               ← Typed route constants (ROUTES.AUTH, ROUTES.HOME)
│   └── index.ts
│
├── providers/                  ← Dependency composition
│   ├── AppProvider.tsx         ← Canonical provider compositor (ReactQuery + Auth)
│   ├── ReactQueryProvider.tsx
│   ├── index.ts
│   └── legacy/                 ← Archived files pending cleanup PR
│
├── features/                   ← Feature-scoped code (see Import Rules)
│   └── <feature>/
│       ├── components/         ← UI components owned by this feature
│       ├── hooks/              ← React Query hooks for this feature
│       ├── services/           ← Business logic
│       ├── repositories/       ← Data access
│       ├── types/              ← Feature-specific types
│       ├── validation/         ← Zod schemas
│       └── index.ts            ← Public API — only import from here
│
├── platform/                   ← Cross-cutting platform adapters
│   └── authentication/
│
├── core/                       ← Core utilities (logger, etc.)
├── config/                     ← Environment configuration
├── database/                   ← Database client and schema
├── shared/                     ← Shared types and utilities
└── components/                 ← Shared, reusable UI components
```

> **Critical rule:** No directory named `app` may exist anywhere under `src/`. Expo Router scans directories named `app` as route sources. Infrastructure modules placed inside any `app`-named directory will be misidentified as routes, producing "missing default export" warnings and broken navigation. See [ADR-011](./adr/ADR-011-expo-router-directory-boundary.md).

---

## Import Rules

| Module | May Import From | Cannot Import From |
|--------|-----------------|--------------------|
| `features/<A>` | `shared/`, `components/`, `lib/`, `contexts/`, `hooks/` | `features/<B>` |
| `components/` | `shared/`, `lib/`, `hooks/` | `features/`, `contexts/` |
| `shared/` | `lib/` | `features/`, `components/`, `contexts/`, `hooks/` |
| `contexts/` | `shared/`, `lib/` | `features/`, `components/` |
| `hooks/` (shared) | `shared/`, `lib/`, `contexts/` | `features/`, `components/` |

Each feature exposes its public API exclusively through `src/features/<feature>/index.ts`.
No other module imports from inside a feature's subdirectories.

---

## State Management

| Category | Solution | Notes |
|----------|----------|-------|
| Server State | TanStack Query | `useQuery`, `useMutation` |
| Form State | React Hook Form + Zod | Validated before submission |
| Auth State | React Context | `src/platform/authentication/AuthContext` |
| UI State | `useState` / `useReducer` | Kept local; not lifted unless necessary |
| Derived State | Computed inline | Never persisted or stored |

---

## Authentication

- **Single Source of Truth:** `src/platform/authentication` owns the `AuthContext`, `AuthProvider`, `useAuth`, and all authentication state management (login, logout, registration, session restoration).
- **Clean Architecture Boundary:** Features (e.g., the Identity feature) consume the platform authentication layer. They do not own or provide global authentication state. The legacy feature-layer authentication implementation has been removed.
- Supabase Auth issues JWTs on sign-in.
- Sessions are stored securely via `expo-secure-store` on native platforms.
- Protected routes (via `AuthGuard` and `GuestGuard` in `src/navigation`) rely on `useAuth()` to orchestrate redirects.
- The JWT is forwarded by the Supabase client on every request, enabling RLS policy evaluation.

---

## Security Architecture

- **Row Level Security (RLS)** is the primary authorization mechanism — enforced at the PostgreSQL level on every user-owned table
- `FORCE ROW LEVEL SECURITY` prevents privilege escalation via `SET ROLE`
- The repository layer does not append `WHERE user_id = ?` — RLS provides tenant isolation transparently
- The Supabase Service Role key is never exposed to client-side code
- Secrets are managed via environment variables and never committed to Git

See [adr/ADR-010-row-level-security-strategy.md](./adr/ADR-010-row-level-security-strategy.md) for the full decision record.

---

## Key Dependencies

**Runtime**

| Package | Purpose |
|---------|---------|
| `expo` / `expo-router` | App framework and file-based routing |
| `@supabase/supabase-js` | Database and authentication client |
| `@tanstack/react-query` | Server state management |
| `react-hook-form` | Form state management |
| `zod` | Runtime schema validation |
| `date-fns` | Date formatting and arithmetic |
| `lucide-react-native` | Icon system |
| `react-native-reanimated` | Gesture and animation engine |
| `expo-secure-store` | Secure JWT session storage |

**Development**

| Package | Purpose |
|---------|---------|
| `typescript` | Static type safety |

---

## Data Flow Example — Creating a Spend

```
User taps "Save" on the Add Spend form
        ↓
React Hook Form validates input against the Zod schema
        ↓
useMutation calls spendService.create(dto)
        ↓
Service validates business rules
(e.g., category exists and is not archived)
        ↓
Service calls spendRepository.insert(row)
        ↓
Repository calls supabase.from('spends').insert(...)
        ↓
PostgREST forwards the JWT to PostgreSQL
        ↓
RLS evaluates: NEW.user_id = auth.uid() ✅
        ↓
Row is inserted — response returned
        ↓
Repository maps Row → Domain type
        ↓
Service returns domain model to the mutation
        ↓
React Query invalidates ['spends'] cache key
        ↓
UI re-renders with the updated spend list
```

---

## Architectural Decisions

All significant architectural decisions are documented as ADRs.

See [adr/INDEX.md](./adr/INDEX.md) for the full list.
