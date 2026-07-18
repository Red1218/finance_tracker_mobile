# Database Engineering Handbook

**Status:** Active

## Purpose

Defines the engineering standards for designing, evolving, and maintaining the PostgreSQL database used by Finance Tracker v2.

This document is the authoritative reference for all database development.

---

# 1. Philosophy

## Database Responsibilities

The database is responsible for:

- Data integrity
- Referential integrity
- Constraints
- Transaction consistency
- Performance through indexing

The application is responsible for:

- Business rules
- Validation beyond database constraints
- Authorization
- User workflows

---

# 2. Naming Standards

## Tables

- plural
- snake_case

Examples

users
categories
expenses
budgets

## Columns

snake_case

Primary key

id

Foreign keys

user_id
category_id

Boolean

is_active
is_archived

Timestamps

created_at
updated_at
deleted_at

Enums

payment_method_enum

Indexes

idx_table_columns

Unique indexes

uq_table_columns

Foreign keys

fk_table_reference

Triggers

trg_table_action

---

# 3. Enum Standards

Use enums only when:

- values are stable
- values rarely change
- values represent domain concepts

Examples

expense_type
budget_period
payment_method

Do not use enums for:

- categories
- user-created values
- frequently changing lists

---

# 4. Table Design Standards

Every table should define:

Purpose

Ownership

Relationships

Constraints

Indexes

Comments

Every table should include:

id

created_at

updated_at

Optional

deleted_at

---

# 5. Column Standards

Required fields should be NOT NULL.

Avoid nullable columns unless they represent optional data.

Prefer explicit defaults.

Never store calculated values unless justified.

---

# 6. Constraint Standards

CHECK

FK

UNIQUE

NOT NULL

Use CHECK for:

positive numbers

date validation

valid ranges

Use application validation for:

calendar rules

complex workflows

cross-table business rules

---

# 7. Foreign Keys

Always use foreign keys.

Choose ON DELETE intentionally.

CASCADE

RESTRICT

SET NULL

Never rely on application logic alone.

---

# 8. Indexing Standards

Never create indexes without understanding the query.

Follow:

Query Profile

↓

Index Design

↓

Verification

↓

Production

Prefer composite indexes over multiple single-column indexes where appropriate.

Use partial indexes whenever possible.

---

# 9. Soft Delete Strategy

Use:

deleted_at TIMESTAMPTZ

Never permanently delete user data unless required.

Indexes should exclude soft-deleted rows when appropriate.

---

# 10. Trigger Standards

Triggers should only:

maintain timestamps

audit

system-level consistency

Triggers should never implement business workflows.

---

# 11. Migration Workflow

Design

↓

Review

↓

Migration

↓

Verification

↓

Commit

↓

Deploy

Applied migrations are immutable.

---

# 12. SQL Verification Checklist

Verify:

constraints

indexes

comments

foreign keys

enums

triggers

Run verification queries before commit.

---

# 13. Performance Guidelines

Design for expected queries.

Avoid premature optimization.

Review execution plans.

Measure before optimizing.

---

# 14. Review Checklist

Every migration must answer:

Why is this needed?

Are constraints correct?

Are indexes justified?

Can it be rolled back?

Has it been verified?

Is documentation updated?

---

# 15. Common Mistakes

Missing indexes

Missing constraints

Nullable fields without reason

Duplicated data

Business logic in triggers

Editing applied migrations

Missing verification

---

# 16. References

Engineering Principles

Database Architecture

ADRs

Migration Guide

# Database Standards

## Migrations

- **Never create an empty migration.** 
  A migration should either:
  1. contain a complete implementation and be committed, or
  2. not exist yet.
  
  Empty migrations can be recorded as applied, leaving the database and repository out of sync. This complements our existing "immutable applied migrations" rule.