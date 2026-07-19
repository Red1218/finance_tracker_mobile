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

  ## Migration Quality Checklist

Every migration must satisfy the following requirements before being committed:

### Structure
- One logical change per migration.
- Descriptive migration name.
- Migration file is not empty.
- Migration executes successfully on a fresh database.

### Schema
- Primary keys defined.
- Foreign keys added where required.
- Appropriate constraints implemented.
- Necessary indexes created.
- Table and important column comments included.

### Security
- RLS enabled for user-owned tables.
- FORCE ROW LEVEL SECURITY enabled.
- Required policies implemented.
- Ownership rules verified.

### Verification
- Migration applied successfully.
- Schema verified.
- Constraints verified.
- Indexes verified.
- Policies verified.
- Representative data tested where applicable.

### Documentation
- Related documentation updated.
- Clear commit message written.

### Immutable Migration Rule
Once a migration has been applied to a shared environment, it must never be modified. Any correction must be implemented through a new migration.

## Migration Verification Standards

A migration is not considered complete until it has been verified.

### Verification Stages

1. Schema Verification
   - Tables
   - Columns
   - Data types
   - Defaults
   - Comments

2. Integrity Verification
   - Primary keys
   - Foreign keys
   - CHECK constraints
   - UNIQUE constraints
   - NOT NULL constraints

3. Performance Verification
   - Indexes
   - Query plans
   - Expected index usage

4. Security Verification
   - RLS enabled
   - FORCE RLS enabled
   - Policies verified
   - Ownership rules verified

### Standard Workflow

Write → Apply → Verify → Document → Commit

### Rollback Consideration

Before deploying a migration, evaluate:
- Recovery strategy if the migration fails.
- Whether existing data is affected.
- Whether the migration can be safely rerun.
- Whether the change should be split into smaller migrations.

## Performance Standards

### Principles

- Optimize last.
- Measure before changing.
- Create indexes deliberately.
- Keep queries simple and maintainable.
- Review performance periodically.

### Performance Checklist

- Query performance measured before optimization.
- Query performance measured after optimization.
- Index necessity justified.
- Query plans reviewed when applicable.
- No redundant indexes introduced.
- Performance improvements documented.

### Scalability Principle

Optimize for expected scale, not hypothetical scale. Prefer maintainability and correctness until real-world usage demonstrates the need for further optimization.

## Database Review Checklist

### Design Review
- Schema design is appropriate.
- Relationships are correct.
- Constraints reflect business rules.
- Security model is appropriate.

### Implementation Review
- Migration follows project standards.
- Verification completed.
- Performance considered.
- Documentation updated.
- Commit message follows conventions.

## Database Release Readiness Checklist

### Migration
- Migrations verified.
- No empty migrations.
- Applied migrations unchanged.
- Naming follows convention.

### Schema
- Tables reviewed.
- Constraints verified.
- Indexes verified.
- Comments reviewed.

### Security
- RLS verified.
- FORCE RLS verified.
- Policies verified.
- Ownership isolation confirmed.

### Verification
- Schema verified.
- Integrity verified.
- Security verified.
- Performance verified.

### Documentation
- Database handbook updated.
- ADRs updated if required.
- README updated if required.

### Source Control
- Clean git status.
- Logical commits.
- Branch pushed.

### Deployment
- Fresh migration tested.
- Existing database tested.
- Recovery strategy reviewed.

### Migration Risk Classification
- Low
- Medium
- High

## Documentation Review Checklist

### Accuracy
- Documentation matches implementation.
- Examples verified.
- No obsolete guidance.

### Completeness
- Standards documented.
- Checklists actionable.
- Design decisions recorded.

### Consistency
- Terminology consistent.
- Naming consistent.
- Formatting consistent.

### Maintainability
- Single source of truth.
- Minimal duplication.
- Easy navigation.

## Documentation Lifecycle

Every major engineering document should include:

- Status
- Owner
- Last Reviewed

## Final Database Audit

### Architecture
- Schema reviewed.
- Relationships verified.
- Naming conventions consistent.
- Business rules enforced.

### Migrations
- Migration history complete.
- Applied migrations immutable.
- Fresh setup verified.

### Security
- RLS verified.
- FORCE RLS verified.
- Policies reviewed.

### Performance
- Indexes reviewed.
- Query paths documented.

### Documentation
- Engineering Principles complete.
- Database Handbook complete.
- Architecture documentation current.

### Quality
- Migration checklist complete.
- Verification standards complete.
- Review checklist complete.
- Release checklist complete.

### Repository
- Clean git status.
- Branch pushed.
- Ready for release.

## Future Improvements

Document enhancements that have been intentionally deferred, along with the reasoning behind each decision.

