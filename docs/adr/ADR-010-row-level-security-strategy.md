# ADR-010: Row Level Security Strategy

**Status:** Approved
**Date:** 2026-07

---

## Context

Finance Tracker stores sensitive personal financial data — transactions, categories, credit cards, and budgets — mapped to individual authenticated users.

The system must guarantee that one user's data is never visible or modifiable by another user, regardless of how a request reaches the database.

---

## Problem

Relying on the Service Layer or Repository Layer to append `WHERE user_id = ?` to every query introduces a systemic risk: a single developer omission, a refactoring regression, or an API bug can expose one user's data to another. This class of vulnerability is known as Broken Object Level Authorization (BOLA / IDOR) and is consistently ranked in the OWASP API Security Top 10.

---

## Decision Drivers

- **Zero Trust** — The API and Service Layers are assumed to be fallible. Authorization must not depend on application code being written correctly.
- **Performance** — Authorization checks must be index-compatible and mathematically fast.
- **Auditability** — Financial records must remain historically intact.
- **Developer Velocity** — Engineers must be able to write queries without manually constructing authorization predicates.

---

## Considered Alternatives

| Alternative | Reason Rejected |
|-------------|----------------|
| Application-Layer Authorization (TypeScript services/ORMs) | High risk of human error; a single missed check causes BOLA |
| Hard Deletion of Financial Records | Destroys historical ledger integrity and referential integrity |
| Multi-Tenant Workspace Structure (from the start) | YAGNI; premature complexity for a single-user product phase |

---

## Decision

Authorization is enforced exclusively at the PostgreSQL database level using **Row Level Security (RLS)**.

### Key Design Choices

**RLS is the only authorization tier.** Regardless of the entry point — API endpoint, rogue query, or a compromised service — PostgreSQL evaluates the session JWT and enforces access control before returning any data.

**The Service Layer does not perform authorization.** Services focus exclusively on business logic. Decoupling authorization from business rules ensures that API regressions cannot silently leak data.

**The Repository Layer does not filter by `user_id`.** Appending `user_id` predicates to every query is repetitive and fragile. RLS provides transparent, automatic tenant isolation at query execution time.

**System categories use `user_id = NULL` and `is_system = true`.** This avoids duplicating baseline category records across users, enables universal updates, and is clearly distinguishable from user-owned records.

**The Service Role bypasses RLS.** Backend administrative tasks, scheduled jobs, and GDPR compliance operations require a superuser context. This is acceptable provided the Service Role key is never exposed to client-side code or user-facing API handlers.

**Archive, not delete.** Hard-deleting a category breaks the foreign keys of historical transactions. Archiving preserves the full audit trail, referential integrity, and historical classification data required for analytics and compliance.

**Single-user ownership only.** The current model enforces strict `user_id = auth.uid()` ownership, optimized for composite index performance. Collaborative household features are a deliberate future scope item.

---

## Consequences

### Positive

- Complete protection against BOLA / IDOR attacks at the database tier
- Repository and Service Layers remain clean — no authorization boilerplate
- High query performance via composite indexes aligned with RLS policy predicates
- Bulletproof referential integrity for all financial records

### Tradeoffs

- RLS failures on `SELECT` are silent: Postgres returns zero rows rather than a permission error, which can make debugging tenant isolation issues non-obvious
- Collaborative features (shared household budgets) are explicitly out of scope and will require a comprehensive architectural pivot

---

## Future Considerations

When multi-tenant or household sharing becomes a product requirement, a new ADR must be written to define the transition from direct user ownership (`user_id = auth.uid()`) to a `workspace_members` joining architecture. That transition will require migration planning, index redesign, and updated RLS policies.
