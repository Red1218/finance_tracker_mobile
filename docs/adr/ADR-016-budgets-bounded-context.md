# ADR-016: Budgets Bounded Context Architectural Design

* **Status:** ✅ Approved & Frozen
* **Date:** 2026-07-25
* **Author:** Antigravity AI & Enterprise Architecture Team

---

## Context & Problem Statement

The **Budgets** bounded context provides financial goal and limit planning functionality (`Accounts → Transactions → Categories → Budgets → Analytics`).

Budgets function strictly as **planning constructs, not financial ledgers**. Derived financial state (spent amount, remaining budget, percentage used, health status) is calculated dynamically in the Application layer without storing or duplicating balance fields in persistence.

---

## Budget Invariants

1. **Derived Financial State**: Budgets never store financial totals or transaction balances in persistence.
2. **Dynamic Summary Calculation**: `spentAmount`, `remainingAmount`, `percentageUsed`, and `healthStatus` (`ON_TRACK`, `NEAR_LIMIT`, `OVER_BUDGET`) are computed dynamically in the Application layer (`GetBudgetSummaryUseCase`) by querying non-voided `EXPENSE` transactions in `Transactions` within the budget date range (`[startDate, endDate]`).
3. **Self-Contained `BudgetPeriod` Value Object**:
   - `BudgetPeriod` encapsulates `kind` (`WEEKLY`, `MONTHLY`, `QUARTERLY`, `YEARLY`, `CUSTOM`), `startDate: Date`, and `endDate: Date`.
   - Enforces `startDate < endDate`.
4. **Explicit Budget Scope**:
   - `categoryId === null`: Represents an Overall Budget (applies across all expense categories).
   - `categoryId !== null`: Represents a Category Budget (applies strictly to specified category).
5. **Intersecting Date Range Overlap Prevention**:
   - Active budgets with the same scope cannot have intersecting date ranges (`existing.startDate <= new.endDate AND new.startDate <= existing.endDate`).
   - Overall budgets and category budgets may coexist for the same period window because they have distinct scopes.
6. **Single Source of Truth (`archivedAt`)**: `archivedAt: Date | null` is the single source of truth for archive state; `isArchived` is a derived getter (`archivedAt !== null`).
7. **Historical Budget Immutability**: Budgets whose `endDate < currentDate` are immutable (`HISTORICAL_BUDGET_IMMUTABLE`). Restoring a historical budget is permitted for historical visibility, but its amount cannot be updated.
8. **Active Category Association**: Budgets reference only active, non-archived categories (`CATEGORY_INACTIVE`). Historical transactions from archived categories continue to contribute to budget summaries if their dates fall within the budget period.
9. **Application-Layer `BudgetSummary` Projection**: `BudgetSummary` is an Application-layer projection DTO and not part of the Domain aggregate model.
10. **Currency Alignment**: `Budget.currency` must match the transaction currency used for summary calculations.

---

## Architectural Boundaries

- **Domain Layer**: `Budget` aggregate, `BudgetId`, `BudgetAmount`, `BudgetPeriod` (`BudgetPeriodType`), `BudgetDomainError`, and reserved domain events (`BudgetCreatedEvent`, `BudgetUpdatedEvent`, `BudgetArchivedEvent`, `BudgetRestoredEvent`, `BudgetExceededEvent`).
- **Application Layer**: `IBudgetRepository`, `BudgetSummary` DTO, single-responsibility use cases (`CreateBudgetUseCase`, `UpdateBudgetUseCase`, `ArchiveBudgetUseCase`, `RestoreBudgetUseCase`, `ListBudgetsUseCase`, `GetBudgetSummaryUseCase`).
- **Infrastructure Layer**: Supabase schema migration `20260725210000_update_budgets_archived_at.sql`, partial overlap index `idx_budgets_user_category_active`, `BudgetRow`, `BudgetMapper` (round-trip symmetry tests), `SupabaseBudgetRepository`.
- **Presentation Layer**: `BudgetViewModel`, `BudgetViewModelMapper`, `BudgetController` facade, React hooks (`useBudgets`, `useBudgetSummary`, `useCreateBudget`, `useUpdateBudget`, `useArchiveBudget`, `useRestoreBudget`), `BudgetsScreen.tsx`.
- **Route Wrapper**: `app/(tabs)/budgets.tsx` (conforming to ADR-011).
