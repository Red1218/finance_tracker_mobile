# Finance Tracker — Documentation

Engineering documentation for the Finance Tracker mobile application.

---

## Documents

| Document | Purpose |
|----------|---------|
| [PROJECT_CONSTITUTION.md](./PROJECT_CONSTITUTION.md) | Core principles, standards, and philosophy governing the project |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System layers, folder structure, import rules, and data flow |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Git workflow, commit conventions, PR process, and Definition of Done |
| [ROADMAP.md](./ROADMAP.md) | High-level product phases and feature milestones |

---

## Architectural Decision Records

Significant architectural decisions are recorded as ADRs in [adr/](./adr/).

| Document | Purpose |
|----------|---------|
| [adr/README.md](./adr/README.md) | When to write an ADR, numbering, lifecycle, and creation steps |
| [adr/INDEX.md](./adr/INDEX.md) | Full index of all ADRs and their current status |

---

## Documentation Policy

Documentation in this repository describes architecture, standards, and decisions.

- Feature implementation details are derived from code, not maintained separately.
- A feature is not considered done until relevant documentation is updated.
- ADRs are immutable once approved. Create a new ADR to supersede an old decision.

See [PROJECT_CONSTITUTION.md — Documentation Policy](./PROJECT_CONSTITUTION.md) for the full policy.

---

## Architecture at a Glance

```
UI → React Query → Service → Repository → Supabase → PostgreSQL
```

No component communicates directly with Supabase.
