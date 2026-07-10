# Finance Tracker v2: Database Tables

## Purpose

This document defines the authoritative relational tables for Version 1. It stores financial facts only. Dashboard metrics, History entries, credit utilization, remaining credit, borrowing balances, and budget summaries are derived read models and are never persisted as duplicate facts.

## Derived Values

The database stores only authoritative business facts.

The following values are always calculated and are never persisted:

- Remaining Budget
- Budget Usage
- Outstanding Borrowing Balance
- Total Repaid
- Credit Utilization
- Remaining Credit
- Dashboard Totals
- Monthly Summaries
- Historical Aggregates

If a value can be deterministically derived from existing facts, it must never be stored.

All business tables use a stable UUID primary key named id, UTC creation timestamps, and an owning user_id unless the table is the profile itself. All money values use the precise Money representation defined by the Domain Model. Table and column names use the conventions established in the database design.

## Table Catalogue

| Table | Purpose | Ownership |
| --- | --- | --- |
| profiles | Non-authentication user profile | One row per authenticated user |
| user_preferences | User preferences and defaults | One row per user |
| categories | Protected and custom expense classifications | User-owned |
| budgets | Monthly global budget limits | User-owned |
| credit_cards | Credit-card limits, status, and default selection | User-owned |
| expenses | Individual money-out transactions | User-owned |
| borrowings | Informal borrowed and lent obligations | User-owned |
| repayments | Settlements against a borrowing | User-owned; linked to one borrowing |

The authentication system owns account credentials and authentication identifiers. This design does not duplicate credentials, passwords, or tokens.

## profiles

**Purpose:** Stores the user profile attributes that are not owned by the authentication system.

| Column | Meaning | Required |
| --- | --- | --- |
| id | Authenticated user identifier; primary key | Yes |
| display_name | Optional user display name | No |
| created_at | Creation time in UTC | Yes |
| updated_at | Last modification time in UTC | Yes |

Rules:

- Exactly one profile exists for each authenticated user.
- The profile identifier is the authenticated user identifier.
- Profile deletion occurs only as part of the user account-deletion lifecycle and cascades to all owned data.

## user_preferences

**Purpose:** Stores user preference values and their system defaults.

| Column | Meaning | Required |
| --- | --- | --- |
| id | Stable user-preferences identifier | Yes |
| user_id | Owning profile identifier | Yes |
| theme_preference | User-selected theme preference | Yes |
| base_currency | Display currency preference | Yes |
| created_at | Creation time in UTC | Yes |
| updated_at | Last modification time in UTC | Yes |

Rules:

- Each user has exactly one user_preferences row.
- Every required preference has a system default at profile creation.
- Base currency is a display preference only in Version 1. It must not introduce exchange rates, conversion, or multi-currency financial facts.

## categories

**Purpose:** Stores the category taxonomy for Expenses.

| Column | Meaning | Required |
| --- | --- | --- |
| id | Stable category identifier | Yes |
| user_id | Owning profile identifier | Yes |
| name | Human-readable category name | Yes |
| category_type | Protected or Custom | Yes |
| icon | Approved icon identifier used to represent the category | No |
| color_token | Approved semantic colour token used to represent the category | No |
| display_order | User-scoped ordering value for category presentation | No |
| created_at | Creation time in UTC | Yes |
| updated_at | Last modification time in UTC | Yes |

Rules:

- Category name is non-empty and unique for a user under case-insensitive comparison.
- Protected categories are provisioned with a new user and cannot be renamed or deleted.
- Custom categories may be renamed or deleted.
- A category with assigned expenses cannot be deleted unless every assigned expense is reassigned within the same business operation.
- The protected Uncategorized category is available as the defined fallback for a category-reassignment workflow.
- The table does not store a parent category, category budget, or nested hierarchy.

## budgets

**Purpose:** Stores the global budget ceiling for a user and budget period.

| Column | Meaning | Required |
| --- | --- | --- |
| id | Stable budget identifier | Yes |
| user_id | Owning profile identifier | Yes |
| budget_period_start | Inclusive start date of the budget period | Yes |
| budget_period_end | Inclusive end date of the budget period | Yes |
| limit | Monthly money limit | Yes |
| created_at | Creation time in UTC | Yes |
| updated_at | Last modification time in UTC | Yes |

Rules:

- A user has at most one budget for an identical budget period.
- Limit is greater than or equal to zero.
- budget_period_start must be on or before budget_period_end.
- Version 1 creates monthly budgets only: the period start and end must bound one calendar month. The period columns support future approved budgeting periods without a schema change.
- Remaining budget and budget usage are calculated from this table and Expenses; they are not stored.

## credit_cards

**Purpose:** Stores user-managed revolving credit lines.

| Column | Meaning | Required |
| --- | --- | --- |
| id | Stable credit-card identifier | Yes |
| user_id | Owning profile identifier | Yes |
| name | User-visible card name | Yes |
| issuer | Optional card issuer name | No |
| credit_limit | Credit boundary | Yes |
| statement_day | Optional calendar day on which the statement is generated | No |
| payment_due_day | Optional calendar day on which payment is due | No |
| status | Active or Archived | Yes |
| is_default | Whether this is the user's default active card | Yes |
| display_order | User-scoped ordering value for card presentation | No |
| created_at | Creation time in UTC | Yes |
| updated_at | Last modification time in UTC | Yes |

Rules:

- Credit-card name is unique per user under case-insensitive comparison.
- credit_limit is strictly greater than zero.
- At most one active card is default for a user.
- Archived cards cannot be selected for a new credit Expense.
- Archival preserves all historic Expense links. The table must not support ordinary client deletion.
- Available credit, remaining credit, utilization, and alerts are derived from the credit limit and associated Expenses.

## expenses

**Purpose:** Stores one recorded instance of money leaving the user's possession.

| Column | Meaning | Required |
| --- | --- | --- |
| id | Stable expense identifier | Yes |
| user_id | Owning profile identifier | Yes |
| category_id | Exactly one assigned category | Yes |
| credit_card_id | Assigned card when payment method is Credit | Conditional |
| amount | Expense money amount | Yes |
| expense_date | Date and time of the expense in UTC | Yes |
| payment_method | Cash, Debit, Credit, or UPI | Yes |
| description | Optional user description | No |
| created_at | Creation time in UTC | Yes |
| updated_at | Last modification time in UTC | Yes |

Rules:

- amount is strictly greater than zero.
- expense_date is a valid transaction date and must comply with the product future-date threshold.
- payment_method is limited to Cash, Debit, Credit, and UPI.
- credit_card_id is present if and only if payment_method is Credit.
- category_id and credit_card_id, when present, must identify records owned by the same user_id.
- Deleting an Expense is permanent only after the required user confirmation; no soft-delete state is introduced.
- Merchant, recurring-expense, receipt, transfer, and investment fields are out of scope.

## borrowings

**Purpose:** Stores one informal debt or loan relationship.

| Column | Meaning | Required |
| --- | --- | --- |
| id | Stable borrowing identifier | Yes |
| user_id | Owning profile identifier | Yes |
| borrowing_type | Borrowed or Lent | Yes |
| counterparty_name | Person or entity involved | Yes |
| original_amount | Original money amount | Yes |
| note | Optional user note | No |
| closed_at | Time the Borrowing lifecycle was closed after settlement | No |
| created_at | Creation time in UTC | Yes |
| updated_at | Last modification time in UTC | Yes |

Rules:

- original_amount is strictly greater than zero.
- counterparty_name is non-empty.
- borrowing_type is limited to Borrowed and Lent.
- Outstanding balance is derived from original_amount less the total of linked Repayments.
- closed_at is empty while the Borrowing remains open and does not replace the calculated outstanding balance.
- Interest, due dates, reminders, bill splitting, and recurring obligations are out of scope.
- Deleting a Borrowing permanently deletes its linked Repayments within the same operation.

## repayments

**Purpose:** Stores one partial or full settlement of a Borrowing.

| Column | Meaning | Required |
| --- | --- | --- |
| id | Stable repayment identifier | Yes |
| user_id | Owning profile identifier | Yes |
| borrowing_id | Parent Borrowing identifier | Yes |
| amount | Repayment money amount | Yes |
| repayment_date | Date and time of repayment in UTC | Yes |
| created_at | Creation time in UTC | Yes |
| updated_at | Last modification time in UTC | Yes |

Rules:

- amount is strictly greater than zero.
- borrowing_id must identify a Borrowing owned by the same user_id.
- The total of all repayments for a borrowing cannot exceed that borrowing's original_amount.
- A repayment is visible in History but is not an Expense and must not contribute to expense totals, budgets, or credit utilization.
- Deleting a Repayment recalculates only the derived balance of its parent Borrowing.

## Relationships and Integrity

- profiles owns user_preferences, categories, budgets, credit_cards, expenses, borrowings, and repayments.
- categories has many expenses.
- credit_cards has many credit-payment expenses.
- borrowings has many repayments.
- Every foreign-key relationship must prevent cross-user references.
- Financial rows retain user_id even when ownership is also reachable through a parent relationship. This is ownership metadata required for direct isolation checks, not duplicated financial information.
- Each table must have indexes for its ownership key and for the ordered, user-scoped access paths required by its documented reads. Index definitions belong to a later schema migration, not this document.
