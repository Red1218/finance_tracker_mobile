---
status: proposed
authority: pending-implementation
---

# Dashboard Addendum: Derived Overall Budget Health

**Document Status:** Design Approved — Pending Implementation & Verification
**Date:** 2026-08-31
**Governs:** Dashboard BudgetHealth section behavior when category budgets exist without an
explicit Overall Budget.
**Relationship to prior documents:** This is a standalone addendum, not a renumbered phase. It
supplements — and does not edit — the frozen `phase_1.2_domain_architecture.md`,
`phase_1.3_application_architecture.md`, `phase_1.5_presentation_architecture.md`, and
`phase_1.11_sprint_4_presentation_layer.md`. Those documents remain Approved & Frozen as originally
written; where this addendum introduces new behavior not covered by them, this addendum is
authoritative for that behavior only.
**Governing ADR:** [ADR-025](../../adr/ADR-025-dashboard-derived-overall-budget-health.md) (Proposed, extends [ADR-016](../../adr/ADR-016-budgets-bounded-context.md))

---

## 1. Purpose

Defines the implementation-facing contract for the Dashboard-only "Derived Overall" BudgetHealth
concept approved in ADR-025: a read-only, non-persisted, combined-category budget aggregate shown
when the user has category budgets but no explicit Overall Budget for the active period.

This document does not authorize implementation to begin on its own — it is the design contract
that an implementation must satisfy once the workflow moves past Design/Review.

---

## 2. Domain Behavior

**Component:** `src/features/dashboard/domain/services/BudgetHealthService.ts`
**Value object:** `src/features/dashboard/domain/value-objects/BudgetHealthStatus.ts`

### 2.1 Value object contract

```ts
export type BudgetHealthSource = 'Explicit' | 'Derived';

export class BudgetHealthStatus {
  constructor(
    public readonly source: BudgetHealthSource,
    public readonly amountConsumed: MonetaryAmount,
    public readonly limit: MonetaryAmount,
    public readonly categoryId?: string,
    public readonly budgetId?: string // present iff source === 'Explicit'
  )
}
```

- `source: 'Explicit'` — every row backed by a real, persisted `Budget` (category budgets and an
  explicit Overall Budget alike). `budgetId` is the real `BudgetId`.
- `source: 'Derived'` — only the synthesized aggregate row. `budgetId` must be `undefined`.
- Constructor must throw if `source === 'Derived' && budgetId !== undefined` — this is the
  structural enforcement of ADR-025's architectural correction; it must not be left to convention.
- The previously-proposed boolean `isDerived` field and the `budgetId === 'derived-overall'`
  sentinel string are both **superseded** by `source` and must not coexist with it.

### 2.2 Aggregate creation rule

`BudgetHealthService.calculateStatus` still returns one `source: 'Explicit'` status per input
budget (category or explicit-overall), unchanged from current behavior. In addition:

- **Trigger:** `budgets.length > 0 AND` no budget has `categoryId === undefined`.
- **Output:** exactly one additional `BudgetHealthStatus` with `source: 'Derived'`,
  `budgetId: undefined`, `categoryId: undefined`, prepended to the category rows.
- If an explicit Overall Budget exists, no Derived Overall is computed — unconditional precedence,
  regardless of how many category budgets also exist. (Already correctly implemented in the
  uncommitted branch via `hasExplicitOverall`; must be preserved.)

### 2.3 Aggregation semantics (normative — do not alter without a new ADR)

- `limit = Σ(category budget limits)` for all category budgets in the set; all must share one
  currency (mismatch throws, consistent with existing `MonetaryAmount` currency invariants).
- `consumed = Σ(expense.amount)` where:
  - `expense.direction === 'Expense'`
  - `period.contains(expense.occurredAt)` is true
  - `expense.categoryId` is a member of the set of categoryIds that have a budget
- Expenses whose `categoryId` is **not** in that set (including categories with no budget) are
  **excluded**.
- Transactions without a resolved category (uncategorized expenses) are **excluded** from the Derived Overall consumed amount. (Note: in the domain/repository representation, an unresolved category identifier is represented by an empty string `''` on `TransactionSnapshot.categoryId` rather than `undefined`.)
- This means "Derived Overall" = combined **budgeted-category** utilization, not total spending.
  This distinction must be surfaced to the user (§4.3).

### 2.4 Period semantics

Identical `ReportingPeriod.contains()` boundary check as every other row. No special-cased boundary
handling for the derived row.

### 2.5 Empty state

Zero budgets → existing Empty BudgetHealth state. Derived Overall computation is never attempted.

### 2.6 Non-goals (explicit)

- No new repository method.
- No new persistence table/column.
- No new command/use case in the Budgets bounded context.
- No `BudgetId` is ever minted for the derived row.
- No mutation of any `Budget` entity.

---

## 3. Application / View-Model Contract

**Components:** `src/features/dashboard/application/mappers/BudgetHealthMapper.ts`,
`src/features/dashboard/application/view-models/BudgetHealthViewModel.ts`

### 3.1 Mapper correction

The current uncommitted mapper determines "is this an overall-shaped row" via sentinel-string
matching:

```ts
// Superseded — do not carry forward:
const isOverall =
  status.categoryId === undefined ||
  status.categoryId === null ||
  status.budgetId === 'overall' ||
  status.budgetId === 'global' ||
  status.budgetId === 'derived-overall';
```

This must be replaced with a check against `source` and `categoryId`, since both explicit-overall
and derived rows always have `categoryId === undefined` by construction:

```ts
const isOverall = status.categoryId === undefined; // true for explicit-overall and derived alike
const isDerivedRow = status.source === 'Derived';
```

No string sentinel matching is required once `source` exists — this is a net simplification, not
just a substitution.

### 3.2 `BudgetHealthRow` contract

`BudgetHealthRow` keeps its existing boolean shape for minimal disruption to presentation code:

```ts
export interface BudgetHealthRow {
  // ...existing fields unchanged...
  readonly isOverall?: boolean;
  readonly isDerived?: boolean; // true iff the domain status had source === 'Derived'
}
```

`isDerived` is derived in the mapper from `status.source === 'Derived'`; it is a display-state flag
only and must not be used to drive any application-layer business logic.

---

## 4. Presentation Contract

**Components:** `src/features/dashboard/presentation/components/sections/MonthlyBudgetCard.tsx`,
`src/features/dashboard/presentation/components/sections/BudgetHealthSection.tsx`

### 4.1 Card selection (unchanged)

`BudgetHealthSection`'s existing `globalBudgetRow` lookup (row with `isOverall === true` /
`categoryId === undefined`) continues to route both explicit-overall and derived rows into
`MonthlyBudgetCard`. This routing logic itself does not change — only what `MonthlyBudgetCard`
does with `isDerived` changes.

### 4.2 "Estimated" indicator

When `budget.isDerived === true`, `MonthlyBudgetCard` must render a visible "Estimated" label/badge
adjacent to the "Monthly Budget" title. It must not rely on color alone (pair with visible text, not
a colored dot/icon in isolation).

### 4.3 Explanatory text

When `isDerived`, render a one-line caption visible by default (not hover/tooltip-only, since this
is a touch UI): **"Calculated from your category budgets."** This directly addresses §2.3's
semantics gap — users must not read "Estimated" as "your total spending."

### 4.4 Accessibility

`accessibilityLabel`/`accessibilityHint` must include the distinction in text form, e.g.:

- Derived: `"Estimated monthly budget, calculated from your category budgets"`
- Explicit: unchanged from current label (no "Estimated" wording)

The distinction must be perceivable via assistive technology independent of the visual badge.

### 4.5 No edit affordance

`MonthlyBudgetCard` has no tap/press handler today — no regression risk currently exists. This
contract exists to bind future work: **any** interaction added to this card must explicitly check
`isDerived` and disable or hide itself when true. A derived row must never navigate to, or imply,
an edit flow for a nonexistent Budget.

### 4.6 Explicit-overall path (unchanged)

When `isDerived` is falsy, `MonthlyBudgetCard` must render exactly as it does today — this contract
adds a branch, it does not rewrite the existing explicit-overall rendering path.

### 4.7 Terminology

"Estimated" is the approved term (per product decision). No stronger existing precedent was found
in `docs/ui/01-design-system.md` or component specs during design review.

---

## 5. Interaction Behavior

- Tapping/pressing a Derived Overall card: no-op (no navigation, no edit sheet) unless a future,
  separately-approved design adds a non-editing action (e.g., "View category budgets"), which must
  itself be explicit about not implying edit access to a Budget.
- Period/reporting-period changes: Derived Overall recomputes exactly like every other
  BudgetHealthStatus row, with no special-cased refresh behavior.
- Budget/category CRUD events (`BudgetUpdated`, `BudgetDeleted`, `CategoryUpdated`): existing
  Dashboard section-refresh behavior (per `phase_1.2_domain_architecture.md` §9) applies unchanged;
  no new event types are introduced for the derived value.

---

## 6. Integration Implications

- No new persistence contract, table, column, or migration.
- No change to `SupabaseDashboardRepository`'s budgets/transactions queries beyond what already
  exists in the uncommitted branch (the unrelated `is_system` category fix is tracked as an
  independent workstream, not part of this feature — see commit plan from the prior design review).
- No change to any Budgets-context repository, use case, or route.
- `DashboardDataFlowEndToEnd.test.ts` / `DashboardIntegration.test.ts` continue to exercise the
  Supabase-shaped mock contract; their assertions must be updated to check `source`/`isDerived`
  per the corrected contract (§2.1, §3.2) rather than the sentinel `budgetId` string.

---

## 7. Test Requirements

### Domain (`BudgetHealthService` / `BudgetHealthStatus`)
1. Explicit Overall present + category budgets present → only the explicit row returned; no
   derived row synthesized.
2. Category-only, single category budget → derived row with correct limit/consumed,
   `source: 'Derived'`, `budgetId: undefined`.
3. Category-only, multiple category budgets, same currency → correctly summed limit, correctly
   filtered consumed.
4. Mixed currency across category budgets → throws (existing invariant), asserted specifically for
   the aggregate path.
5. Empty budgets → no derived row; Empty state unaffected.
6. Expense in a category with no budget → excluded from derived consumed (explicit regression test
   locking in §2.3's semantics decision).
7. Transaction without a resolved category (uncategorized expense, e.g. `categoryId: ''`) → excluded from derived consumed.
8. Expense at/outside the period boundary → excluded/included consistent with per-category rows,
   tested at the boundary, not just "sometime in period."
9. Constructing `BudgetHealthStatus` with `source: 'Derived'` and a defined `budgetId` → throws
   (structural invariant from ADR-025).
10. Defensive: multiple budgets with `categoryId === undefined` reaching the service (a data
    anomaly ADR-016 should prevent upstream) → assert and document the actual resulting behavior
    rather than leaving it unspecified.

### Application (`BudgetHealthMapper`)
11. `source: 'Explicit'`, `categoryId: undefined` → `isOverall: true`, `isDerived: false`.
12. `source: 'Derived'` → `isOverall: true`, `isDerived: true`.
13. `source: 'Explicit'`, `categoryId` defined (category budget) → `isOverall: false`,
    `isDerived: false`.
14. No sentinel-string (`'overall'`/`'global'`/`'derived-overall'`) based assertions remain in the
    test suite once the mapper is corrected.

### Presentation (`MonthlyBudgetCard`, `BudgetHealthSection`)
15. `isDerived: true` → renders "Estimated" indicator and explanatory caption.
16. `isDerived: false` → indicator and caption absent; output unchanged from the pre-existing
    explicit-overall snapshot.
17. Accessibility: `accessibilityLabel`/`accessibilityHint` text differs correctly between the two
    states (assert the actual string, not just presence/absence).
18. No pressable/edit affordance is rendered on the derived card (regression guard).

### Integration
19. `DashboardDataFlowEndToEnd`/`DashboardIntegration`: end-to-end wiring from repository →
    `source`/`isDerived` → rendered "Estimated" text, replacing the currently-inverted test that
    still asserts "no false aggregate card" in its title/body.

---

## 8. Traceability to ADR-025

| ADR-025 provision | This addendum section |
|---|---|
| Explicit Overall definition unchanged | §2.2, §3.1 (both explicit-overall and category rows use `source: 'Explicit'`) |
| Derived Overall definition | §2.2, §2.3 |
| Dashboard-only boundary | §2.6, §6 |
| Non-persistence / read-only | §2.6, §4.5 |
| Explicit-overall precedence | §2.2 |
| Aggregation / consumed / period semantics | §2.3, §2.4 |
| Empty state | §2.5 |
| Identity representation correction (`source`, optional `budgetId`) | §2.1 |
| UX distinction / "Estimated" | §4.2, §4.3, §4.7 |
| Accessibility requirement | §4.4 |
| No edit path | §4.5 |
| Architectural boundaries | §2 (Domain), §3 (Application), §6 (Infrastructure/Integration), §4 (Presentation) |

---

## 9. Open Items Carried Forward

- Final sign-off on "Estimated" as user-facing copy (recommended, not exhaustively validated
  against every design-system document).
- Whether a future "view category budgets" tap action is wanted on the derived card — explicitly
  out of scope for this addendum; would need its own review if proposed.
