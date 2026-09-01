---
status: completed-frozen
authority: historical-record
last_verified: 2026-09-01
---

# Walkthrough: Categories Persistence Enum Fix

**Document Status:** Completed & Frozen (Historical Implementation Record)
**Merge Status:** Implemented & Verified — Not Yet Merged to `main`
**Date:** 2026-09-01

---

## Overview

Creating a category from the Categories screen (e.g. name `"food"`, kind `Expense`) failed at save time with a PostgreSQL error:

```
code: 22P02
message: invalid input value for enum category_kind: "expense"
```

Root-cause investigation traced the defect to a single Infrastructure-layer mapper that still encoded an obsolete lowercase convention left over from the legacy, now-retired `category_type` enum (`supabase/migrations_legacy/202607190002_update_categories_schema.sql`). The current database enum, `public.category_kind`, was introduced by [ADR-012](../../../adr/ADR-012-category-model-realignment.md) as uppercase-only:

```sql
CREATE TYPE public.category_kind AS ENUM ('INCOME', 'EXPENSE');
```

Domain (`CategoryKind.Income = 'INCOME'`, `CategoryKind.Expense = 'EXPENSE'`), Application, and Presentation layers were already correct and consistent with this enum. Only the persistence mapper had not been migrated forward with the rest of the ADR-012 realignment.

---

## Root Cause

`CategoryMapper.toPersistence()` converted the (already-correct) domain value before sending it to Postgres:

```ts
kind: entity.kind === CategoryKind.Income ? 'income' : 'expense'
```

`entity.kind` is already the exact string `'INCOME'` or `'EXPENSE'` — this conversion was pure translation to the wrong casing, and Postgres rejected `'expense'` against `category_kind`.

`CategoryMapper.toDomain()` had the mirror-image defect on the read path: `row.kind === 'income'` can never be true against real rows (which contain `'INCOME'`), so any category successfully read back from the database would have been silently misclassified as `CategoryKind.Expense` — including genuine income categories. This had not yet surfaced in practice because the write path failed first.

The same lowercase literals were duplicated inline in `SupabaseCategoryRepository.getAll()` and `.existsByNameAndKind()`.

---

## Changes Implemented

Fix scope: **Infrastructure only**. No changes to Domain (`CategoryKind.ts`, `Category.ts`), Application (use cases), Presentation (form/controller/view-model), or the database schema/enum.

### 1. `CategoryMapper.ts`
- `toPersistence`: passes `entity.kind` through unchanged — no second translation layer.
- `toDomain`: replaced the lowercase equality check with an explicit mapper that fails loudly (throws) on any value other than `'INCOME'`/`'EXPENSE'`, rather than silently defaulting unknown values to Expense.

### 2. `CategoryRow.ts`
- `kind` contract type corrected from `'income' | 'expense'` to `'INCOME' | 'EXPENSE'`, matching the current database representation. Kept as a plain string-literal union (not the domain `CategoryKind` type), consistent with the existing `TransactionRow.type` precedent that keeps persistence contracts independent of Domain imports.

### 3. `SupabaseCategoryRepository.ts`
- The two inline `'income' : 'expense'` ternaries in `getAll()` and `existsByNameAndKind()` were corrected to use `CategoryKind.Income` / `CategoryKind.Expense` directly, so query predicates send the exact enum values Postgres expects.

### 4. Test coverage
- `CategoryMapper.test.ts`: fixtures and assertions rewritten to `'INCOME'`/`'EXPENSE'`; added explicit round-trip coverage for both kinds (Row → Domain → Row and Domain → Row → Domain), a guard test proving an `INCOME` row can never map to `CategoryKind.Expense`, and a test proving a stray legacy lowercase value now throws instead of being silently coerced.
- `SupabaseCategoryRepository.test.ts` (new): mocks the Supabase client using the project's existing chainable-mock convention and asserts the exact string sent to `.upsert()` and `.eq('kind', ...)` for `save`, `getAll`, and `existsByNameAndKind`, plus `getById` tests proving a row with `kind: 'INCOME'` / `'EXPENSE'` maps to `CategoryKind.Income` / `CategoryKind.Expense` respectively.
- `CategoriesLifecycleIntegration.test.ts` was left unchanged — it exercises `InMemoryCategoryRepository` only, so it never covered this defect and needed no change. This is a pre-existing coverage gap (no test previously exercised `CategoryMapper`/`SupabaseCategoryRepository` against the real enum representation).

### Not in scope (identified, not fixed)
`supabase/tests/categories_constraints_test.sql` targets a different, older `categories` table shape (`icon`, `color`, `slug`, `type`, `display_order` columns) that no longer matches the current schema at all. It is unrelated to this defect and was left untouched as a separate, pre-existing stale-test cleanup item.

---

## Verification Record

### Verification at Fix Completion (2026-09-01)
- ✅ **Category persistence tests**: 18 tests passed (`CategoryMapper.test.ts` + `SupabaseCategoryRepository.test.ts`).
- ✅ **Categories feature suite**: 34 tests across 13 files passed.
- ✅ **Full project suite**: 722 tests across 229 files passed (`npx vitest run`).
- ✅ **TypeScript**: `npx tsc --noEmit` returns 0 errors.
- ✅ **Android debug build**: `./gradlew assembleDebug` — `BUILD SUCCESSFUL`.
- ⚠️ **Lint**: not run — the repository has no configured lint script or ESLint config.
- ✅ **No migration required**: `public.category_kind` was already correct; only application code was wrong.
- ✅ **No architectural conflict**: fix stayed entirely within the existing Infrastructure layer boundary.

### Outstanding step
This record documents implementation and verification only. The change has not yet been merged into `main` — see `docs/status/PROJECT_STATUS.md` §7 for merge status.
