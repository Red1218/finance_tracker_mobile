# ADR-025: Dashboard Derived Overall Budget Health

* **Status:** 🟡 Proposed (Extends [ADR-016](./ADR-016-budgets-bounded-context.md))
* **Date:** 2026-08-31
* **Author:** Product & Enterprise Architecture Review

> **Note on status:** The underlying design decision described in this ADR has been reviewed and
> approved by the product owner (see Decision below). Per `docs/adr/README.md`, ADR status moves
> from `Proposed` to `Approved` upon the ADR's own PR merge, independent of whether implementation
> has started. This ADR remains `Proposed` because it has not yet been committed/merged, and no
> implementation of the described behavior exists yet. It must not be described as "Approved &
> Frozen" until both steps have actually occurred.

---

## Context & Problem Statement

ADR-016 (Approved & Frozen) defines the Budgets bounded context's Overall Budget strictly as a
persisted `Budget` record with `categoryId === null` (ADR-016, Budget Invariant #4).

The Dashboard's BudgetHealth section previously rendered a per-category linear list whenever a
user had only category-scoped budgets and no such record — it never synthesized a combined figure.
An uncommitted implementation on `feature/dashboard-budget-health-derived-overall` introduced a
synthesized aggregate row for this case, but did so without a governing design: it reused the
`BudgetHealthStatus.budgetId` field with a sentinel string (`'derived-overall'`) to mark the
synthetic row, and propagated a display flag (`isDerived`) to the view-model that the presentation
layer never consumed. This risked (a) a Dashboard-only computed value being structurally
indistinguishable from a real persisted Budget identity, and (b) users being unable to tell a
calculated estimate from a budget they actually configured.

A Design Review (prior to this ADR) established that:
- No approved/frozen design specified this behavior; the only prior record of intended behavior
  for the category-only case was a test asserting the opposite outcome.
- The aggregation mechanics were reasonable, but the identity representation and the presentation
  contract were not.

## Problem

The Dashboard needs a way to present a combined budget-utilization figure for users who have only
category budgets, without weakening ADR-016's explicit-scope invariant, without persisting a value
the user never configured, and without letting a computed value be mistaken — structurally or
visually — for a real Overall Budget.

## Decision Drivers

- **Invariant preservation** — ADR-016 §4 (explicit budget scope) must not be weakened, reinterpreted, or edited.
- **Structural honesty** — a value that does not correspond to a persisted `Budget` must not carry an identity shape that implies it does.
- **User transparency** — a calculated figure must never be presented as if the user configured it.
- **Bounded context isolation** — Dashboard is a read-only observer of Budgets/Transactions (per `phase_1.2_domain_architecture.md`, DC-001); it must not gain write/entity concepts belonging to Budgets.

## Considered Alternatives

| Alternative | Reason Rejected |
|---|---|
| Amend ADR-016 to allow an implicit/synthetic Overall Budget record | Violates ADR-016's explicit-scope invariant and its "planning construct, not derived ledger" boundary; would require reopening a frozen, approved model. |
| Keep category-only budgets as a list only (status quo) | Leaves a validated product need (combined utilization view) unaddressed. Rejected in favor of a bounded, presentation-only alternative. |
| Auto-create a real Overall Budget row when category budgets exist | Persists a value the user never configured; violates ADR-016's "planning construct" boundary and risks a phantom record a user could rely on or attempt to edit. |
| Represent the derived value using a sentinel `budgetId` string (e.g. `'derived-overall'`) with a boolean `isDerived` flag | Rejected on architectural-correction review: a string sentinel is a fragile, stringly-typed discriminator, and a non-optional `budgetId` field structurally implies every `BudgetHealthStatus` corresponds to a real `Budget` identity, which is untrue for the derived case. |

## Decision

The Dashboard BudgetHealth section may compute a **Derived Overall** aggregate, entirely within
the Dashboard bounded context, when:
1. One or more category budgets exist for the active period, AND
2. No explicit Overall Budget (`categoryId === null`) exists for the active period.

### Explicit Overall Budget (unchanged)

The definition, persistence, and precedence of the Overall Budget as established in ADR-016 are
**unaffected by this ADR**. `categoryId === null` continues to mean exactly what ADR-016 says it
means: a user-created, persisted `Budget` record.

### Derived Overall (new)

- Exists only as a value produced by the Dashboard's `BudgetHealthService`; never written to the
  `budgets` table; never returned by any Budgets-context repository or use case.
- Is **not** a `Budget` entity and does not receive a `BudgetId`.
- Is **read-only** — no use case, command, or route accepts a Derived Overall as an edit target.
- Is **non-persisted** — it is recomputed on every load from current budgets and transactions,
  consistent with ADR-016's "Budgets never store financial totals" philosophy (ADR-016 Invariant #1)
  applied here to a value that isn't even a Budget at all.

### Explicit-overall precedence (unchanged rule, restated for this context)

If an explicit Overall Budget exists for the period, it is used and no Derived Overall is computed,
regardless of how many category budgets also exist.

### Aggregation semantics

- **Limit** = sum of the limits of all category budgets active in the period.
- **Consumed** = sum of expense transactions whose `categoryId` belongs to a category that has a
  budget, whose direction is `Expense`, and whose `occurredAt` falls within the active period.
- Expenses in categories that have **no** budget are **excluded**.
- Transactions without a resolved category (uncategorized expenses) are **excluded** from the Derived Overall consumed amount. (Note: in the domain/repository contract, an unresolved category is represented by an empty-string category identifier `''` rather than `undefined`.)
- This is a deliberate scope decision: Derived Overall means *combined budgeted-category
  utilization*, not *total spending*. This must be stated in user-facing help text (see
  presentation contract below), since "Estimated" alone could otherwise be misread as "total spend."

### Period semantics

Uses the same `ReportingPeriod.contains()` boundary check as every other BudgetHealthStatus row.
No special-cased boundary logic is introduced.

### Empty state (unchanged)

Zero budgets for the period still produces the existing Empty BudgetHealth state; Derived Overall
is never attempted in that case.

### Key Design Choice — Identity Representation (architectural correction)

The original uncommitted implementation modeled the derived value using a required `budgetId`
field populated with the sentinel string `'derived-overall'`, plus a boolean `isDerived` flag. This
representation is **rejected**: a required `budgetId` implies every instance is a persisted Budget's
projection, which is false for the derived case, and a string sentinel is an ad hoc, unenforced way
to signal that.

The corrected contract for `BudgetHealthStatus` (domain value object,
`src/features/dashboard/domain/value-objects/BudgetHealthStatus.ts`):

```ts
export type BudgetHealthSource = 'Explicit' | 'Derived';

export class BudgetHealthStatus {
  constructor(
    public readonly source: BudgetHealthSource,
    public readonly amountConsumed: MonetaryAmount,
    public readonly limit: MonetaryAmount,
    public readonly categoryId?: string,
    public readonly budgetId?: string // present only when source === 'Explicit'
  ) {
    // existing currency/limit invariants unchanged
    if (source === 'Derived' && budgetId !== undefined) {
      throw new Error('A derived BudgetHealthStatus must not carry a persisted budgetId');
    }
  }
}
```

- `source: 'Explicit'` — used for every row that corresponds to a real, persisted `Budget`
  (both category budgets and an explicit Overall Budget). `budgetId` is the real `BudgetId`.
- `source: 'Derived'` — used only for the synthesized aggregate. `budgetId` is `undefined`/absent.
  This is enforced by a constructor invariant, not left to convention.
- This follows the project's existing convention of a string-literal-union discriminant field
  (e.g. `BudgetStatus = 'OnTrack' | 'AtRisk' | 'OverBudget'` in the same file, and `BudgetPeriodType`
  assigned to a `kind` field in `src/features/budgets/domain/value-objects/BudgetPeriod.ts`) rather
  than introducing a new pattern.
- The boolean `isDerived` field from the uncommitted implementation is superseded by `source`;
  it should not additionally exist once `source` is introduced, to avoid two overlapping
  discriminants drifting out of sync.

Full implementation-facing detail (application/view-model/presentation mapping of `source`) is
specified in the Dashboard addendum, not in this ADR.

### UX distinction — "Estimated"

Any Dashboard surface displaying a Derived Overall value must carry a visible, accessible
**"Estimated"** indicator, and accompanying explanatory text, distinguishing it from an explicit
Overall Budget. It must never render identically to, or be confusable with, an explicit Overall
Budget card. Full presentation requirements are in the Dashboard addendum.

### Accessibility requirement

The derived/explicit distinction must be conveyed in text exposed to assistive technology
(`accessibilityLabel`/`accessibilityHint` or equivalent), not through color or iconography alone.

### No edit path

No tap, press, or navigation affordance may treat a Derived Overall value as an editable Budget.
Any future interaction added to the Overall budget card must explicitly branch on `source` and
disable/hide itself for `'Derived'`.

### Architectural boundaries

- **Domain**: `BudgetHealthService` (Dashboard domain) computes the aggregate as a pure derived
  value. It must not create, mutate, or reference a `Budget` aggregate.
- **Application**: `BudgetHealthMapper`/`BudgetHealthViewModel` (Dashboard application) may carry
  the `source` distinction across the boundary as a display-state contract.
- **Infrastructure**: no new persistence, no new repository method, no new table/column for the
  derived value.
- **Presentation**: must explicitly branch on `source`/`isDerived` to render the "Estimated"
  indicator and must never expose an edit affordance for it.
- The Budgets bounded context (`src/features/budgets/**`) is untouched by this decision in every
  layer.

## Consequences

### Positive
- Category-only users get a combined utilization view without any change to the Budgets bounded
  context, its persistence model, or ADR-016's invariants.
- The value object's shape now makes it structurally impossible (via the constructor invariant) for
  a derived value to carry a real Budget identity, rather than relying on a naming convention.

### Tradeoffs
- `BudgetHealthStatus`'s constructor contract changes (from a required `budgetId: string` to an
  optional `budgetId` plus a new `source` discriminant), which is a breaking change to every
  existing call site of that constructor and to `BudgetHealthMapper`'s current sentinel-string
  matching (`status.budgetId === 'overall' || 'global' || 'derived-overall'`), which must be
  replaced with a `source`-based check as part of implementation.
- Two visually similar cards (explicit vs. derived) increase presentation-layer testing surface.
- Dashboard domain logic now encodes a cross-cutting aggregation rule that must stay in sync with
  ADR-016's definition of Overall Budget; if ADR-016's definition of `categoryId === null` ever
  changes, this ADR's precedence rule must be revisited.

## Future Considerations

If a future decision allows users to "promote" a Derived Overall into a real Budget (e.g., a
"Create Overall Budget from this estimate" action), that is a Budgets-context feature requiring its
own ADR — it is explicitly out of scope here and must not be implemented as a side effect of this
decision.

This ADR supersedes no prior ADR. It extends [ADR-016](./ADR-016-budgets-bounded-context.md),
which remains unmodified and fully in force.
