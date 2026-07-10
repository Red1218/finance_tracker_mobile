# Finance Tracker v2: Database Migration Governance

## Purpose

This document governs schema evolution. It does not define or generate a migration. Migrations implement the approved table, RLS, and view documents while preserving the Domain Model and production data.

## Immutable Migration Rules

- A migration is immutable once applied to any shared environment.
- A correction is made by a new forward migration; an applied migration is never edited, deleted, reordered, or reused.
- Migration identifiers are strictly increasing and use the repository naming convention established when the migration tool is selected.
- Each migration has one purpose. It cannot combine unrelated schema changes, policy changes, data corrections, or feature work.
- A migration must not contain placeholder objects, unused tables, speculative fields, or future-feature scaffolding.
- SQL, migration files, and migration execution are separate approved tasks and are out of scope for this document.

## Baseline Delivery Order

The Version 1 baseline is delivered in this order:

1. Establish controlled database values required by the Domain Model, including payment method, category type, borrowing type, and card status.
2. Establish profiles as the application identity boundary linked to authenticated users.
3. Establish user_preferences and category provisioning requirements.
4. Establish budgets, credit_cards, and borrowings.
5. Establish expenses with Category and CreditCard relationships.
6. Establish repayments with Borrowing relationships and repayment-bound integrity.
7. Establish user-scoped indexes for documented ownership, period, relation, and ordering access paths.
8. Enable and verify RLS for every table before client exposure.
9. Establish the read-only views documented in 03-Views.md after their source tables and RLS are verified.

A migration may not expose an application table to client traffic until the necessary ownership constraints, integrity constraints, indexes, and RLS policies are active.

## Change Classification

| Change | Required migration approach |
| --- | --- |
| Add non-null field to populated table | Add safely, populate existing rows through an approved data transition, then enforce required state in a later migration. |
| Add nullable optional field | Add only when it represents an approved current business fact. |
| Add or change constraint | Verify all existing data first; then add the constraint in a dedicated migration. |
| Add index | Add only for a documented read or integrity path; verify query bounds and expected access pattern. |
| Change ownership or RLS policy | Deliver policy and verification together; requires an ADR when isolation semantics change. |
| Rename table, column, enum value, or published view output | Use a staged compatibility transition; requires an ADR and contract transition plan. |
| Remove field, table, view, or controlled value | Remove only after all consumers and retained data transitions are complete; requires an ADR. |
| Change financial semantics | Prohibited without an accepted ADR and explicit data impact assessment. |

## Data Preservation Rules

- Migrations preserve existing financial facts exactly unless an accepted ADR explicitly authorizes a correction.
- A migration cannot recalculate and persist a derived amount, balance, utilization value, dashboard metric, or history timeline.
- A data transition is user-scoped and preserves each row's ownership.
- A data transition cannot grant a user access to another user's data, even temporarily.
- A migration cannot convert an Expense into a Repayment, or a Borrowing into an Expense, because those represent different domain facts.
- Destructive operations require a prior compatibility release, a verified data-retention decision, and an accepted ADR.

## Deployment and Verification Gates

Before a migration is approved for a shared environment, it must have:

1. A documented owning feature and business purpose.
2. A review against 01-Tables.md, 02-RLS.md, and 03-Views.md.
3. Tests for all new or changed constraints, including relevant cross-user reference attempts.
4. RLS tests for select, insert, update, delete, and affected views.
5. Contract tests for every changed published read model.
6. A performance check for any new index, view, or high-volume query path.
7. A rollback decision. For shared environments, the default rollback is a forward corrective migration, not reversal of an already-applied migration.
8. An ADR when the change meets the Architecture Handbook ADR criteria.

## Operational Records

Each applied migration must be traceable to its source change, owning feature, review, test evidence, and deployment environment. The migration record must not include user financial data, authentication credentials, tokens, or personal notes.

Schema changes are completed only after the migration has been applied, verification gates have passed, and the resulting schema documentation remains consistent with the final product, domain, and architecture documents.
