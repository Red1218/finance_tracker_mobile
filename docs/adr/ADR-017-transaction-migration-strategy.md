# ADR-017: Transaction Migration & Facade Strategy

## Status
**↩️ Superseded by [ADR-023](./ADR-023-retire-expenses-bounded-context.md)** (Retirement of Expenses Bounded Context)


## Context
During initial MVP development, expenses were modeled as an independent `Expense` entity within `src/features/expenses`. As the application evolved into an enterprise financial platform, a formal double-entry ledger was introduced in `src/features/transactions` with `Transaction` as the canonical aggregate root supporting all movement types (`INCOME`, `EXPENSE`, `TRANSFER_IN`, `TRANSFER_OUT`).

To avoid maintaining competing financial sources of truth, a unified ledger architecture was established. However, existing UI screens and feature components relied on `Expense` constructs.

## Decision
1. **Canonical Source of Truth**:
   - `Transaction` in `src/features/transactions` is the single authoritative financial aggregate root.
   - All account balance calculations, budget spend tracking, and reporting aggregations derive state exclusively from non-voided `Transaction` records.

2. **Presentation Facade Boundary**:
   - `src/features/expenses` is repurposed strictly as a presentation facade and entry form layer for quick expense recording.
   - Expense creation use cases in `src/features/expenses` delegate execution directly to `CreateExpenseTransactionUseCase` in `src/features/transactions`.

3. **Database Schema Harmonization**:
   - The database table `public.transactions` serves as the underlying persistence target for all ledger entries.

4. **Deprecation & Phasing Path**:
   - Phase 1 (Completed): Core transaction ledger aggregate and use cases operational.
   - Phase 2 (Completed): Expense creation workflow routed through `Transaction`.
   - Phase 3 (Planned): Full consolidation of legacy expense types into transaction value objects, deprecating duplicate expense domain types.

## Consequences
- **Positive**: Eliminates risk of dual financial truth; ensures account balances and budget summaries remain 100% consistent across all entry points.
- **Positive**: Preserves existing UI forms without breaking user workflows during platform evolution.
- **Negative**: Requires temporary maintainability of facade layer mapping between `Expense` UI commands and `CreateExpenseTransactionUseCase`.
