# Contributing to Finance Tracker

Read [PROJECT_CONSTITUTION.md](./PROJECT_CONSTITUTION.md) for engineering principles and [ARCHITECTURE.md](./ARCHITECTURE.md) for system design before contributing.

---

## Branching Strategy

All work is developed on a short-lived branch off `main`.

```
main
  ├── feature/<feature-name>
  ├── fix/<bug-description>
  ├── chore/<task-description>
  └── docs/<document-name>
```

| Rule | Detail |
|------|--------|
| `main` is always deployable | Never commit broken code to `main` |
| No direct commits to `main` | All changes go through a Pull Request |
| Branch names use `lowercase-kebab-case` | `feature/add-spend-form`, not `AddSpendForm` |
| Delete branches after merge | Keep the branch list clean |

### Examples

```
feature/categories-crud
feature/add-spend-form
fix/rls-policy-select
chore/upgrade-supabase-sdk
docs/update-architecture
```

---

## Commit Conventions

This project follows [Conventional Commits](https://www.conventionalcommits.org/).

```
<type>(<scope>): <short description>
```

### Types

| Type | Use for |
|------|---------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code restructuring with no behavior change |
| `test` | Adding or updating tests |
| `db` | Database migration or schema change |
| `build` | Native build toolchain, EAS, or CI changes |
| `docs` | Documentation only |
| `chore` | Tooling, dependencies, or configuration |
| `style` | Formatting or linting changes (no logic change) |
| `perf` | Performance improvement |

### Rules

- Use present tense: `add` not `added`
- Keep the subject line under 72 characters
- Reference issues where applicable: `fix(auth): handle expired session (#42)`
- Every commit must leave the repository in a working, deployable state

### Examples

```
feat(categories): add archive support
fix(rls): correct select policy for categories
db(categories): add is_archived column and index
docs(architecture): update data flow example
chore(deps): upgrade supabase-js to 2.99
```

---

## Development Workflow

### 1. Start from an up-to-date `main`

```bash
git checkout main
git pull origin main
git checkout -b feature/<feature-name>
```

### 2. Develop in small, logical commits

Commit when a logical unit of work is complete. Do not batch unrelated changes into a single commit.

Do not commit broken or incomplete code unless the commit message is prefixed with `WIP:`.

### 3. Keep your branch current

Rebase against `main` regularly to minimize merge conflicts:

```bash
git fetch origin
git rebase origin/main
```

Resolve conflicts on your branch — never on `main`.

### 4. Push and open a Pull Request

```bash
git push origin feature/<feature-name>
```

Then open a Pull Request on GitHub following the PR guidelines below.

---

## Pull Request Guidelines

### Title

PR titles follow the same Conventional Commits format:

```
feat(categories): implement archive and restore
```

### Description

Every PR description must answer:

- **What** — what does this change do?
- **Why** — what problem does it solve?
- **How** — summary of the technical approach taken
- **Testing** — how was this tested?

### Author Checklist

Complete this checklist before requesting review:

**Architecture**
- [ ] Code follows the layer separation defined in [ARCHITECTURE.md](./ARCHITECTURE.md)
- [ ] No business logic exists in UI components
- [ ] No direct Supabase calls outside the repository layer

**Type Safety**
- [ ] No `any` types without an explicit comment justifying the exception
- [ ] Generated database types are used where applicable

**Validation**
- [ ] Zod schemas exist for all new user inputs
- [ ] Inputs are validated before reaching the service layer

**State Management**
- [ ] React Query hooks are used for all server state
- [ ] Mutations correctly invalidate affected query keys

**Database (if applicable)**
- [ ] Migration performs one logical change
- [ ] Migration name is descriptive
- [ ] Migration includes RLS, indexes, constraints, and column comments
- [ ] No empty migrations are committed
- [ ] No applied migrations are modified

**Quality**
- [ ] Existing tests pass
- [ ] Documentation reviewed — updated if architecture, standards, or decisions have changed

---

## Code Review Standards

Reviewers evaluate every PR against the following criteria:

| Category | Criteria |
|----------|----------|
| Architecture | Correct layer separation; no Supabase calls in components |
| Naming | Follows the project naming conventions in the Constitution |
| Type Safety | No `any`; generated types used correctly |
| Security | RLS present on new tables; no hardcoded secrets |
| Validation | Zod schemas present for all user input |
| Error Handling | Errors are logged and surfaced with actionable feedback |
| Performance | No unnecessary re-renders; correct query invalidation |
| Accessibility | Interactive elements carry accessible labels |
| Code Quality | No dead code; no commented-out code left in place |
| Testing | Business logic is covered by tests |

Reviewers are expected to leave clear, actionable comments. Authors are expected to address all comments before merging.

---

## Database Migration Guidelines

Every migration must satisfy the following requirements before commit.

### Structure

- One logical change per migration
- Descriptive filename: `YYYYMMDD_<verb>_<change>.sql`

```
20260720_add_is_archived_to_categories.sql
```

### Required Contents

- Table and column comments
- `NOT NULL`, `CHECK`, and `UNIQUE` constraints where appropriate
- Foreign keys with an explicit `ON DELETE` action
- Composite indexes aligned with expected query patterns
- `ENABLE ROW LEVEL SECURITY`
- `FORCE ROW LEVEL SECURITY`
- All required policies: `SELECT`, `INSERT`, `UPDATE`

### Verification (required before commit)

- Schema verified against expected structure
- Constraints verified
- RLS policies verified
- Representative data inserted and confirmed

### Immutability

Once a migration has been applied to any shared environment, it must not be modified.
All corrections require a new migration.

---

## Definition of Done

A task is complete only when all of the following are true:

- [ ] Requirements are satisfied
- [ ] Architecture aligns with project principles
- [ ] Implementation follows project standards
- [ ] Documentation is updated where relevant
- [ ] Verification is completed
- [ ] Tests pass where applicable
- [ ] Code is reviewed and approved
- [ ] Changes are committed with descriptive messages
- [ ] Branch is merged and deleted

---

## Getting Help

If you are unsure about an architectural decision, consult:

1. [PROJECT_CONSTITUTION.md](./PROJECT_CONSTITUTION.md) — core principles and standards
2. [ARCHITECTURE.md](./ARCHITECTURE.md) — system design and layer responsibilities
3. [adr/INDEX.md](./adr/INDEX.md) — past architectural decisions

If the answer is not documented, raise it in a PR discussion or open a new ADR.
