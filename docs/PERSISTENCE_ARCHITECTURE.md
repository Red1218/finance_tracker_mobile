# Finance Tracker — Persistence Architecture

**Version:** 1.0  
**Status:** Approved & Frozen  
**Last Updated:** 2026-07  

---

## Overview

The **Persistence Architecture** defines the official data persistence layer, schema design, migration pipeline, lifecycle semantics, and database-level security policies for the Finance Tracker mobile application.

As part of the project's Clean Architecture & Domain-Driven Design (DDD) framework, the persistence layer acts as an infrastructure implementation of the Domain Model. It enforces domain invariants at the PostgreSQL database level using foreign keys, constraints, and Row Level Security (RLS).

---

## Approved & Frozen Decisions

### 1. Canonical Financial Record & Transactions Ledger

- Finance Tracker uses a **single `transactions` ledger** as the canonical financial record.
- **Superseding Domain Model**: The Expenses bounded context has been superseded by the **Transactions bounded context**. The application persists all financial events exclusively through the `Transactions` aggregate.
- **Supported Transaction Types**:
  - `EXPENSE` — Outflow of funds from an account to an external category/party.
  - `INCOME` — Inflow of funds to an account from an external source.
  - `TRANSFER_OUT` — Debit leg of an internal movement between user accounts.
  - `TRANSFER_IN` — Credit leg of an internal movement between user accounts.
  - `ADJUSTMENT` — *(Future Extension)* Balance adjustment for audit or reconciliation purposes.

### 2. Lifecycle & Archive Strategy

- `archived_at` is the **only** lifecycle field across all user-owned tables (`accounts`, `categories`, `transactions`, `budgets`, `preferences`).
- **Prohibited lifecycle fields**:
  - Do **not** use `deleted_at`.
  - Do **not** use `is_archived` (boolean).
- **Deletion Policy**: Physical deletes (`DELETE FROM ...`) are **prohibited** as part of normal business operations. Soft-archiving via `archived_at TIMESTAMP WITH TIME ZONE` preserves immutable financial history and auditability. Physical deletion is strictly reserved for administrative database maintenance or compliance requirements.

### 3. Database Migration Pipeline & Execution Order

All database changes are managed through forward-only versioned migration files in `supabase/migrations/`. 

The official frozen migration execution sequence is:

1. `001_enable_extensions` — PostgreSQL extension initializations (`uuid-ossp`, `pgcrypto`).
2. `002_shared_functions` — Global database trigger functions (e.g., `update_updated_at_column()`).
3. `003_accounts` — Table creation for `accounts` money holders.
4. `004_categories` — Table creation for income and expense `categories`.
5. `005_transactions` — Core canonical financial ledger table creation.
6. `006_budgets` — Planning and spending limit target table creation.
7. `007_preferences` — User application preferences table creation.
8. `008_indexes` — Query performance optimizations, compound indexes, and foreign key indexes.
9. `009_rls` — Tenant isolation via PostgreSQL Row Level Security policies (`FORCE ROW LEVEL SECURITY`).
10. `010_seed_data` — Essential system reference data (e.g., default system categories).
11. `011_validation` — Sanity checks and architectural boundary assertion scripts.

### 4. Accounts Bounded Context

- Represents money holders: **Cash**, **Bank**, **Credit Card**, **Wallet**, and future custom/extended account types.
- All financial transactions reference an account via foreign key (`account_id`).
- Accounts maintain lifecycle tracking via `archived_at`.

### 5. Categories Bounded Context

- Pure classification system for financial movements.
- Categories are typed: `INCOME` or `EXPENSE`.
- Supports both **system-defined** default categories and **user-defined** custom categories.
- Lifecycle managed exclusively via `archived_at`.

### 6. Budgets Bounded Context

- Budgets represent planning constructs for expense control across specific categories and time periods.
- Budgets calculate current spending strictly by aggregating `EXPENSE` type transactions referencing the assigned category within the budget period.
- References `categories` via foreign key constraint.

### 7. Preferences Bounded Context

- Stores per-user application runtime settings and configuration choices.
- Configurable settings include:
  - Base Currency (ISO code)
  - UI Theme (System, Light, Dark)
  - Week Start Day (Monday / Sunday)
  - Decimal Precision
  - Notification toggles
  - Default payment and category selections
- Lifecycle managed via `archived_at`.

### 8. Security Architecture & RLS

- **Tenant Isolation**: Owner-based Row Level Security (RLS) enforced via Supabase Auth `auth.uid()`.
- Every user-owned table includes a `user_id UUID` column linked to `auth.users(id)`.
- `FORCE ROW LEVEL SECURITY` is enabled on all tables to prevent privilege escalation via `SET ROLE`.
- System reference data (e.g., system categories) may be globally readable where explicitly approved by RLS policies (`user_id IS NULL`).

### 9. Governance & Forward-Only Schema Evolution

- The database schema is a pure implementation of the approved Domain Model.
- Schema changes are introduced **only** through forward-only versioned migrations.
- Historical migrations are immutable once approved and frozen. Modifications to applied migrations in production or main branch history are forbidden.

---

## Persistence Architecture Principles

The following principles form the mandatory governance rules for all current and future persistence layer developments:

1. **Domain Layer Ownership**: The Domain layer owns all business rules and domain invariants. Database schemas must reflect domain aggregate boundaries.
2. **Persistence Implements Domain**: The database is an infrastructure detail that implements the Domain model. Database tables must not dictate or distort business logic.
3. **Forward-Only Migrations**: Schema evolution is strictly append-only via forward-only versioned migration files.
4. **Immutable Historical Migrations**: Once a migration is approved and frozen, it must never be modified, renumbered, or deleted.
5. **Canonical Archive Lifecycle**: All entities implement soft-archiving using `archived_at TIMESTAMP WITH TIME ZONE`. Flag columns like `is_archived` or `deleted_at` are prohibited.
6. **No Physical Deletion**: Physical row deletes are prohibited during normal business operations. Data removal is achieved exclusively via archiving.
7. **Architectural Review Mandatory**: Every schema modification, index creation, or RLS policy change requires formal architectural review and approval before implementation.
