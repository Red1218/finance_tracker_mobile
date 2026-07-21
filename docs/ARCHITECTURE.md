# Finance Tracker — Architecture

**Version:** 1.0
**Status:** Active

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

- Screens live in `src/app/` using Expo Router file-based routing
- Feature-specific components live in `src/features/<feature>/components/`
- Shared UI components live in `src/components/`
- Contains no business logic
- Contains no direct database access

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
src/
├── app/                        ← Expo Router screens (file-based routing)
│   ├── _layout.tsx             ← Root layout — provider tree
│   ├── auth.tsx                ← Authentication screen
│   └── (tabs)/                 ← Tab navigator group
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
├── components/                 ← Shared, reusable UI components
│
├── shared/
│   ├── types/
│   │   └── generated/          ← Auto-generated Supabase TypeScript types
│   └── lib/                    ← Shared utility functions
│
├── contexts/                   ← React contexts (AuthContext, etc.)
├── hooks/                      ← Shared hooks
├── styles/                     ← Theme tokens and shared styles
└── lib/
    └── supabase/
        └── client.ts           ← Supabase client singleton
```

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
| Auth State | React Context | `AuthContext` |
| UI State | `useState` / `useReducer` | Kept local; not lifted unless necessary |
| Derived State | Computed inline | Never persisted or stored |

---

## Authentication

- Supabase Auth issues JWTs on sign-in
- Sessions are stored securely via `expo-secure-store` on native platforms
- Auth state is managed by `AuthContext` and accessible via `useAuth()`
- Protected routes redirect to `/auth` when no active session exists
- The JWT is forwarded by the Supabase client on every request, enabling RLS policy evaluation

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
