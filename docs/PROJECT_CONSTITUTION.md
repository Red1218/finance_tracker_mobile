# Finance Tracker — Project Constitution

**Version:** 1.0
**Status:** Active

This document defines the engineering philosophy and standards for the Finance Tracker project.
Every implementation decision, architecture choice, and process must be traceable back to these principles.

---

# Core Principles

## 1. Code for the Future

Write code as if another developer will maintain it in two years.

Readable code is preferred over clever code.

---

## 2. Single Responsibility

Every module has one responsibility.

| Layer | Responsibility |
|-------|---------------|
| Component | Render UI |
| Hook | Manage state |
| Service | Business logic |
| Repository | Data access |
| Database | Integrity and security |

---

## 3. Strong Type Safety

- Avoid `any`. Every exception requires a comment explaining why.
- Prefer interfaces, utility types, and generated database types.
- TypeScript must catch mistakes before runtime.

---

## 4. Keep Components Small

React components focus on rendering.

Business logic belongs in services, hooks, and the repository layer — not in components.

---

## 5. Feature Isolation

Each feature owns its code inside `src/features/<feature>/`.

Cross-feature imports are forbidden. Features communicate through shared types only.

---

## 6. Security by Design

- Row Level Security (RLS) is mandatory on all user-owned database tables.
- Never trust client-side authorization.
- Secrets are never committed. Environment variables stay outside Git.

---

## 7. Consistency Over Cleverness

Readable, predictable solutions are preferred over clever or compact implementations.

Consistency reduces onboarding time and maintenance costs.

---

## 8. Incremental Quality

- Build in small, verifiable increments.
- Every commit leaves the repository in a better state than before.
- Do not commit broken or partially complete work unless explicitly marked `WIP:`.

---

# Architecture Reference

The application follows a strict layered architecture:

```
UI → React Query → Service → Repository → Supabase → PostgreSQL
```

For the full architectural specification, see [ARCHITECTURE.md](./ARCHITECTURE.md).

---

# Naming Conventions

| Artifact | Convention | Example |
|----------|-----------|---------||
| Component | `PascalCase` | `ExpenseCard.tsx` |
| Hook | `camelCase` with `use` prefix | `useExpenses.ts` |
| Service file | `<feature>.service.ts` | `expense.service.ts` |
| Repository file | `<feature>.repository.ts` | `expense.repository.ts` |
| Types file | `<feature>.types.ts` | `expense.types.ts` |
| Validation schema | `<feature>.schema.ts` | `expense.schema.ts` |
| Constant | `UPPER_SNAKE_CASE` | `MAX_CATEGORIES` |
| Database table | `plural_snake_case` | `budget_settings` |
| Database column | `snake_case` | `created_at`, `user_id` |

---

# Dependency Management

- All runtime dependencies must be justified by a concrete need.
- Prefer established, well-maintained packages.
- Avoid adding dependencies that duplicate existing functionality.
- Dependencies with security vulnerabilities must be patched or replaced promptly.
- Dependency upgrades are tracked as `chore(deps):` commits.
- Lock files (`package-lock.json` / `yarn.lock`) are committed and kept up to date.

---

# Database Standards

Database changes require:

- A migration file performing one logical change
- Descriptive migration name (e.g., `20260720_add_is_archived_to_categories.sql`)
- RLS enabled and all policies defined
- Verification SQL confirming schema, constraints, and policies
- Applied migrations are immutable — never modify a deployed migration

---

# Security Standards

- RLS is enforced at the database level — never rely on the application layer for authorization.
- Service Role keys are never exposed to client-side code.
- All user input is validated via Zod schemas before reaching the service layer.
- Environment variables manage secrets; they are never hardcoded.

---

# State Management Standards

| Category | Solution |
|----------|----------|
| Server State | TanStack Query |
| Form State | React Hook Form + Zod |
| Auth State | React Context |
| UI State | `useState` / `useReducer` |
| Derived State | Compute — never store |

Never manually synchronize server state. Always use React Query for data fetching and cache invalidation.

## React Query Standards

- Every server request goes through a React Query hook.
- Query keys are scoped per feature and context.
- Mutations invalidate the correct query keys after success.
- Optimistic updates require explicit rollback handling.

---

# Error Handling Standards

- Errors are never silently ignored.
- Errors are logged with enough context to diagnose the problem.
- User-facing errors display actionable feedback — never raw database or network errors.
- Service Layer translates technical errors into business-level error messages.

---

# Testing Standards

Every feature must include appropriate tests:

- **Unit tests** — services and validation schemas
- **Integration tests** — repository layer against a test database
- **SQL verification** — schema, constraints, indexes, and RLS policies

Critical business logic must never remain untested.

---

# Performance Standards

- Optimize only after measurement.
- Avoid premature optimization.
- Prefer lazy loading, pagination, and virtualized lists for large datasets.
- Use memoization only when a measured performance problem justifies it.

---

# Documentation Policy

Documentation describes architecture, standards, and decisions.

- A feature is not complete until its documentation is current.
- Feature implementation details are derived from code, not maintained in separate docs.
- ADRs are immutable once approved. Supersede them with a new ADR when a decision changes.

---

# Document Hierarchy

When a conflict exists between documents, this precedence applies:

```
Project Constitution (this document)
        ↓
ARCHITECTURE.md
        ↓
ADRs (specific decisions)
        ↓
CONTRIBUTING.md (process)
```

---

# Definition of Done

A task is complete only when:

- [ ] Requirements are satisfied
- [ ] Architecture aligns with project principles
- [ ] Implementation follows project standards
- [ ] Documentation is updated where relevant
- [ ] Verification is completed
- [ ] Tests pass where applicable
- [ ] Code is reviewed and approved
- [ ] Changes are committed with a descriptive message
- [ ] Branch is merged and deleted

---

# Project Philosophy

> Consistency over cleverness.
> Maintainability over shortcuts.
> Security over convenience.
> Readable code over compact code.
> Long-term quality over short-term speed.