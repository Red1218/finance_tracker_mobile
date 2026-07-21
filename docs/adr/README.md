# Architectural Decision Records (ADRs)

This directory contains all Architectural Decision Records for the Finance Tracker project.

---

## What is an ADR?

An ADR is a short document that captures a single significant architectural decision — the context that drove it, the decision itself, and its consequences.

ADRs create an auditable history of why the system is designed the way it is. They are invaluable for onboarding, code review, and architectural governance.

---

## When to Write an ADR

Create an ADR when a decision:

- Significantly impacts the architecture (e.g., choosing a framework, selecting a data access pattern, defining a security model)
- Has consequences that future maintainers need to understand
- Replaces or significantly alters a prior architectural decision
- Requires team or stakeholder consensus

Do **not** create an ADR for:

- Minor implementation details
- Transient configuration changes
- Decisions that are obvious from the code itself

---

## Numbering

ADRs are numbered sequentially using a three-digit zero-padded format:

```
ADR-001-<short-title>.md
ADR-002-<short-title>.md
```

Numbering in this project begins at `ADR-010`. The first nine numbers were allocated to architectural decisions made before this ADR system was formalised — those decisions are now embedded in `PROJECT_CONSTITUTION.md` and `ARCHITECTURE.md` rather than in separate ADR files.

---

## Lifecycle

| Status | Meaning |
|--------|---------|
| `Proposed` | Under discussion — not yet implemented |
| `Approved` | Accepted and implemented |
| `Superseded` | Replaced by a newer ADR (referenced in the document) |
| `Rejected` | Considered but not adopted |

### Immutability Rule

ADRs are immutable records of historical decisions.

- **Do not** edit the decision or consequences of an approved ADR because the system has evolved.
- **Do** create a new ADR if a prior decision needs to be reversed or replaced. The new ADR references the old one and updates its status to `Superseded by ADR-XXX`.

---

## Creating a New ADR

1. Copy [ADR_TEMPLATE.md](./ADR_TEMPLATE.md)
2. Name it: `ADR-<NNN>-<short-title>.md`
3. Fill in every section
4. Set status to `Proposed`
5. Submit for review via Pull Request
6. Update status to `Approved` upon merge
7. Add it to [INDEX.md](./INDEX.md)

---

## Index

See [INDEX.md](./INDEX.md) for the full list of all ADRs and their current status.
