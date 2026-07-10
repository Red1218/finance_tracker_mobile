# Finance Tracker v2: Database Views

## Purpose

Views provide read-only, user-scoped database projections over authoritative financial facts. They exist to support the documented Dashboard, History, and feature read models without storing duplicate calculations.

Views do not own state, accept mutations, or replace feature-owned services. The application still owns product presentation, empty-state calls to action, utilization-warning presentation, and query orchestration.

## View Rules

- Every view is read-only and derives its output solely from the tables documented in 01-Tables.md.
- A view must preserve the authenticated caller's row-level security scope.
- A view cannot expose a fact that the caller cannot read from its source tables.
- A view cannot persist totals, balances, percentages, status flags, or snapshots.
- A view has one named consumer purpose and a bounded source period where the product requires one.
- A view must expose enough source-state information to distinguish absence of data from a calculated zero. It cannot fabricate a budget, transaction, or metric for an empty state.
- A view must use deterministic ordering whenever it returns a collection.
- A view cannot contain business mutation logic. Commands remain feature-owned.

## Required Views

### vw_budget_summary

**Purpose:** Supplies the BudgetSummary value for one user and one budget period.

**Sources:** budgets and expenses.

**Outputs:**

- User ownership identifier.
- budget_period_start and budget_period_end.
- Whether a budget exists for the period.
- Budget limit when present.
- Total Expenses occurring within the budget period.
- Remaining budget derived from limit less total expenses.
- Budget usage derived from total expenses and limit, with an explicit no-limit state when limit is zero or absent.

**Rules:**

- Expenses are included by their expense_date within the budget period.
- Version 1 supplies calendar-month budget periods; the view remains period-based for future approved budgeting periods.
- It never stores the summary.
- A negative remaining budget is valid and represents overspending.
- The view does not decide how an empty state is presented.

### vw_credit_card_utilization

**Purpose:** Supplies per-card credit values and inputs for aggregate dashboard credit information.

**Sources:** credit_cards and credit-payment expenses.

**Outputs:**

- Card identity, user ownership identifier, name, status, default flag, and credit limit.
- Total charged Expenses for the card.
- Remaining credit derived from credit limit less total charged expenses.
- Credit utilization derived from total charged expenses and credit limit.
- Explicit over-limit state derived when total charged expenses exceeds credit limit.

**Rules:**

- The calculation includes all Expenses linked to a card, including historical Expenses for archived cards.
- An archived card remains visible to historical and dashboard reads but is excluded from active-entry eligibility.
- Lowering a credit limit does not alter historic Expenses; it may produce an over-limit result.
- The view does not decide warning thresholds or visual severity.

### vw_borrowing_balances

**Purpose:** Supplies the current balance for every Borrowing.

**Sources:** borrowings and repayments.

**Outputs:**

- Borrowing identity, user ownership identifier, borrowing type, counterparty name, original amount, and note.
- Total linked Repayments.
- Outstanding balance derived from original amount less total repayments.
- Settlement state derived from whether the outstanding balance is zero.

**Rules:**

- The repayment total cannot exceed original amount because table integrity prevents it.
- Borrowed and Lent remain distinct types; the view must not net them against each other.
- The view does not store a balance or alter repayment facts.

### vw_history

**Purpose:** Supplies the transparent chronological ledger required by History.

**Sources:** expenses, repayments, categories, credit_cards, and borrowings.

**Outputs:**

- Transaction identity and transaction kind: Expense or Repayment.
- User ownership identifier.
- Transaction date, sourced from expense_date or repayment_date.
- Amount.
- Expense classification and payment context when the row is an Expense.
- Borrowing context when the row is a Repayment.
- Stable ordering key.

**Rules:**

- The view contains only Expenses and Repayments. Borrowing creation is not a History transaction under the Product Requirements.
- Rows are ordered newest first by transaction date, then by stable identity for equal timestamps.
- Repayments remain distinct from Expenses and cannot be counted as spending.
- Query consumers apply the selected viewing-period bound and pagination before rendering.

### vw_dashboard_current_month

**Purpose:** Provides the current-calendar-month Dashboard projection.

**Sources:** vw_budget_summary, vw_credit_card_utilization, vw_borrowing_balances, expenses, categories, and vw_history.

**Outputs:**

- Current-month total spending.
- Budget summary.
- Aggregate credit utilization and remaining credit across cards.
- Borrowed and Lent totals from current borrowing balances.
- Highest spending category for current-month Expenses.
- Largest single current-month Expense.
- A bounded recent-transaction feed.

**Rules:**

- The calendar month is based on the documented application calendar boundary and is declared by the requesting read.
- The view computes its result from source facts at read time and stores no monthly summary.
- Ties for highest category and largest Expense use a documented stable identity tie-breaker.
- The dashboard view is user-scoped and cannot aggregate any other user's data.
- Empty-state decisions remain in the Dashboard feature; the view returns source absence explicitly.

## View Change Control

- Adding, removing, or changing a view output is a published read-model contract change.
- A view change requires contract tests for isolation, source correctness, empty state, ordering, and affected calculations.
- A view cannot be introduced as a substitute for a table that owns a business fact.
- A material change to financial calculation semantics, user isolation, or view execution context requires an accepted ADR before migration work begins.
