# ADR Index

Architectural Decision Records for Finance Tracker, ordered by number and dependency chain.

For guidance on writing ADRs and architecture standards, see [ADR-CONTRIBUTING.md](./ADR-CONTRIBUTING.md) and [README.md](./README.md).
For the reusable template, see [ADR_TEMPLATE.md](./ADR_TEMPLATE.md).

---

## Records

| Number | Title | Status | Date | Notes |
|--------|-------|--------|------|-------|
| [ADR-010](./ADR-010-row-level-security-strategy.md) | Row Level Security Strategy | ✅ Approved | 2026-07 | Multi-tenant data isolation via Supabase RLS |
| [ADR-011](./ADR-011-expo-router-directory-boundary.md) | Expo Router Directory Boundary | ✅ Approved | 2026-07 | Enforces `app/` = route files only; prevents path scanning bugs |
| [ADR-012](./ADR-012-category-model-realignment.md) | Category Model Realignment | ✅ Approved | 2026-07 | Pure classification system; archivedAt timestamp single source of truth |
| [ADR-013](./ADR-013-preferences-bounded-context.md) | Preferences Bounded Context Architecture | ✅ Approved | 2026-07 | Preferences aggregate, value objects, controller, and system boundaries |
| [ADR-014](./ADR-014-accounts-bounded-context.md) | Accounts Bounded Context Architecture | ✅ Approved | 2026-07 | Source of truth for money holders, derived balances, default account switching |
| [ADR-015](./ADR-015-transactions-bounded-context.md) | Transactions Bounded Context Architecture | ✅ Approved | 2026-07 | Single-account ledger entries, transfer integrity invariant, soft voiding audit trail |
| [ADR-016](./ADR-016-budgets-bounded-context.md) | Budgets Bounded Context Architecture | ✅ Approved | 2026-07 | Planning construct boundaries, derived spend calculation, self-contained BudgetPeriod, archivedAt lifecycle |
| [ADR-017](./ADR-017-transaction-migration-strategy.md) | Transaction Migration & Facade Strategy | ✅ Approved | 2026-07 | Unified transaction ledger source of truth & legacy expense presentation facade delegation |
| [ADR-018](./ADR-018-authentication-bounded-context.md) | Authentication Bounded Context Architecture | ✅ Approved | 2026-07 | UserSession aggregate, provider abstraction, token isolation, and session lifecycle |
| [ADR-019](./ADR-019-reporting-read-model.md) | Reporting Read Model Architecture | ✅ Approved | 2026-07 | Read-only CQRS separation, IReportingRepository abstraction, SQL aggregations, and domain projections |
| [ADR-020](./ADR-020-cloud-sync-engine.md) | Cloud Sync Engine Architecture | ✅ Approved | 2026-07 | SyncQueueItem aggregate root, queue state machine, transport & network abstractions, conflict resolution |
| [ADR-021](./ADR-021-ai-insights.md) | AI Insights Bounded Context Architecture | ✅ Approved | 2026-07 | Read-only analytical consumer, Insight aggregate, ConfidenceScore, provider abstraction with rule-based fallback |

---

## Status Legend

| Status | Meaning |
|--------|---------|
| ✅ Approved | Accepted and implemented |
| 🟡 Proposed | Under discussion |
| ↩️ Superseded | Replaced — see linked ADR |
| ❌ Rejected | Considered but not adopted |

- [ADR-017: Retirement of Expenses Bounded Context](ADR-017-retire-expenses-bounded-context.md)
- [ADR-018: Authentication Architecture Consolidation](ADR-018-auth-architecture-consolidation.md)
