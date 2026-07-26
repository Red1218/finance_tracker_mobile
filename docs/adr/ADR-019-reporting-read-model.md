# ADR-019: Reporting Read Model & CQRS Separation Architecture

## Status
**✅ Approved**

## Context
The Finance Tracker platform requires analytical reporting (financial performance summaries, monthly trends, category spend breakdowns, budget performance). Prior to this ADR, reporting logic risks creating mutable financial state or directly depending on write-side repositories (`ITransactionRepository`), creating tight coupling and performance bottlenecks as transaction volume grows.

## Decision
1. **Stateless Read-Only Bounded Context**:
   - Reporting is strictly a **read-only** context that derives analytics from the canonical transaction ledger (`public.transactions`).
   - Reporting never owns, mutates, or persists financial state.

2. **Dedicated Read-Side Abstraction (`IReportingRepository`)**:
   - `IReportingRepository` acts as a dedicated CQRS-style read boundary separating analytical queries from transactional operations.
   - `SupabaseReportingRepository` executes optimized SQL queries directly against `public.transactions` and `public.budgets`.

3. **SQL Query Aggregation & Voided Filtering**:
   - Repository queries enforce `.is('voided_at', null)` to strictly exclude voided transactions from all reporting metrics.
   - Grouping, date range filtering (`gte`, `lte`), sorting, and pagination are performed in SQL rather than loading raw rows into application memory.

4. **Domain Projection Model**:
   - Value objects (`ReportingPeriodValue`, `FinancialSummary`, `CategorySpendBreakdown`) are immutable projections.
   - Financial formulas (`netSavings = totalIncome - totalExpense`, `savingsRate = (netSavings / totalIncome) * 100`) remain encapsulated within `FinancialSummary`.
   - Division by zero invariant: when `totalIncome <= 0`, `savingsRatePercentage` returns `0%` explicitly.

5. **Presentation Layer Architecture**:
   - `ReportingViewModel` exposes presentation-formatted values (`₹`, `%`).
   - `ReportingController` manages period selection, loading state, and reactive subscriptions.
   - `ReportingScreen` renders UI components conforming to project dark-theme standards.

## Consequences
- **Positive**: Complete decoupling between financial write side (transactions, accounts) and analytical read side (reporting).
- **Positive**: High query performance and scalability—analytical queries can be independently optimized (e.g. materialized views or analytical indexes) without touching domain logic.
- **Negative**: Requires separate domain projection mapping for query results.
