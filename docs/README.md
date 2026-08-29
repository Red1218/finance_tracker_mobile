# Finance Tracker — Documentation Master Index

Engineering documentation, specifications, architecture standards, and historical records for the Finance Tracker mobile application.

---

## 1. Governance & Specifications

| Document | Purpose | Authority |
|----------|---------|-----------|
| [AGENTS.md](../AGENTS.md) | Authoritative instructions and rules for AI coding agents | Master Rule |
| [PROJECT_CONSTITUTION.md](./PROJECT_CONSTITUTION.md) | Core principles, DDD, SOLID, and architectural standards | Authoritative |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System layers, Expo Router boundary, import rules, and data flow | **Approved & Frozen 🔒** |
| [PERSISTENCE_ARCHITECTURE.md](./PERSISTENCE_ARCHITECTURE.md) | PostgreSQL schema, single ledger persistence, and RLS specifications | **Approved & Frozen 🔒** |
| [ROADMAP.md](./ROADMAP.md) | High-level product phases and feature milestones (Phase 1–6) | Authoritative |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Git workflow, commit conventions, PR process, and Definition of Done | Standard |

---

## 2. Project Status & Operations

| Directory / Document | Purpose |
|----------------------|---------|
| [status/PROJECT_STATUS.md](./status/PROJECT_STATUS.md) | **Single Authoritative Living Status Snapshot** (Current phase, verification baselines, test counts) |
| [operations/](./operations/) | Release runbooks, EAS Build profiles, environment variable provisioning, and store submissions |

---

## 3. Architectural Decision Records (ADRs)

Significant architectural decisions are recorded as ADRs in [adr/](./adr/).

| Document | Purpose |
|----------|---------|
| [adr/INDEX.md](./adr/INDEX.md) | Master index of all 15 ADR records (ADR-010 through ADR-024) and dependency chain |
| [adr/README.md](./adr/README.md) | Guidance on writing ADRs, numbering, lifecycle, and creation steps |

---

## 4. Bounded Contexts & UI Specifications

| Directory | Purpose |
|-----------|---------|
| [features/](./features/) | Specifications for 12 bounded contexts (`accounts`, `auth`, `bills`, `budgets`, `dashboard`, `reporting`, etc.) |
| [ui/](./ui/) | Design system, component registry, navigation, motion, and accessibility specifications |

---

## 5. Execution History

| Directory | Purpose |
|-----------|---------|
| [history/refactors/](./history/refactors/) | Archived, frozen execution logs of completed refactor phases (e.g. `2026-08-24_dto-refactor`) |

---

## Architecture at a Glance

```text
UI → React Query / DTO → Use Case Service → Repository Port → Supabase → PostgreSQL + RLS
```

- **Routing Boundary (`ADR-011`)**: `app/` is for Expo Router route entry points only.
- **Security (`ADR-010`)**: Row Level Security (`FORCE ROW LEVEL SECURITY`) handles multi-tenant data isolation.
- **Ledger Model (`ADR-015`, `ADR-023`)**: Single `transactions` table is the canonical financial record.
