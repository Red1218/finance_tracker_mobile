# Finance Tracker v2: Database Design

Version: 1.0

Status: Draft

---

# Purpose

This document defines the logical database design for Finance Tracker v2.

It translates the Domain Model into a relational database structure while preserving all business rules and architectural boundaries.

This document is the single source of truth for:

- Tables
- Relationships
- Constraints
- Indexes
- Views
- RLS Policies
- Database Functions
- Migration Strategy

This document intentionally does NOT contain SQL implementation.

---

# 1. Database Philosophy

The database exists to store authoritative financial facts.

It is not responsible for presentation, reporting, or UI behavior.

Every stored record must represent a real business fact.

Derived information is never stored.

Examples of derived information include:

- Remaining Budget
- Budget Usage Percentage
- Credit Utilization
- Remaining Credit
- Dashboard Totals
- History Timeline

These values are always calculated from authoritative data.

---

# 2. Design Principles

## Single Source of Truth

Every business fact exists in exactly one place.

No duplicated financial information is permitted.

---

## User Isolation

Every business record belongs to exactly one authenticated user.

No record may ever be accessible by another user.

---

## Facts Over Calculations

Store:

- Expenses
- Budgets
- Categories
- Credit Cards
- Borrowings
- Repayments

Do NOT store:

- Remaining Budget
- Credit Utilization
- Dashboard Totals
- Monthly Summaries

---

## Data Integrity

Business constraints must be enforced as close to the data as possible.

The database should reject invalid financial data rather than relying solely on application validation.

---

## Immutable Migrations

Once a migration has been applied, it is never edited.

Schema evolution always occurs through new migrations.

---

## Security First

Every table is protected by Row Level Security.

Every query executes within the authenticated user's scope.

No exceptions.

---

# 3. Naming Conventions

## Tables

Plural

Examples

- profiles
- expenses
- categories

---

## Columns

snake_case

Examples

- created_at
- updated_at
- credit_limit

---

## Primary Keys

id

(UUID)

---

## Foreign Keys

Singular table name + _id

Examples

- user_id
- category_id
- credit_card_id

---

## Constraints

Meaningful names.

Examples

- expenses_amount_positive
- categories_unique_name

---

## Indexes

table_column_idx

Examples

- expenses_user_id_idx
- borrowings_status_idx

---

## Views

vw_

Examples

- vw_dashboard
- vw_history

---

## Functions

fn_

Examples

- fn_budget_summary
- fn_credit_utilization

---

## Triggers

trg_

Examples

- trg_profiles_created

## Table: profiles

### Purpose

Stores user profile information that is not part of the authentication system.

Authentication data remains in `auth.users`.

---

### Ownership

One profile belongs to exactly one authenticated user.

Every authenticated user has exactly one profile.

---

### Columns

id
- UUID
- Primary Key
- References auth.users(id)

display_name
- Text
- Optional

created_at
- Timestamp (UTC)

updated_at
- Timestamp (UTC)

---

### Constraints

- id must exist in auth.users
- One profile per authenticated user

---

### Relationships

User (auth.users)
    │
    └── Profile

Profile
    ├── Categories
    ├── Budgets
    ├── Credit Cards
    ├── Borrowings
    ├── Expenses
    └── User Preferences

---

### Indexes

Primary Key

No additional indexes required.

---

### RLS

Users can

- SELECT their own profile
- INSERT their own profile
- UPDATE their own profile

Users cannot

- Read another user's profile
- Modify another user's profile
- Delete another user's profile

---

### Notes

A profile is automatically created after successful registration.

Deletion of a user account removes the associated profile.