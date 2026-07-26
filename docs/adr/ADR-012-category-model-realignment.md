# ADR-012: Category Model Realignment (Domain & Schema Alignment)

* **Status:** ✅ Approved & Frozen
* **Date:** 2026-07-25
* **Author:** Antigravity AI & Architecture Team

---

## Context & Problem Statement

The legacy `Category` model presented an architectural mismatch between the Domain model and the underlying database schema. Editability (`CUSTOM` / `PROTECTED`) was conflated with transaction classification (`INCOME` vs `EXPENSE`).

The **Categories** bounded context has been realigned as a pure **transaction classification system** (`Accounts → Transactions → Categories → Budgets → Analytics`).

---

## Category Lifecycle Invariants

1. **Transaction Classification Only**: Categories function strictly as classification metadata for transactions (`EXPENSE` vs `INCOME`).
2. **No Financial Behavior**: Categories never own balances, ledger entries, budgets, or analytics calculations.
3. **Single Source of Truth (`archivedAt`)**: `archivedAt: Date | null` is the single source of truth for archive state; `isArchived` is a derived getter (`archivedAt !== null`).
4. **Historical Reference Preservation**: Archiving a category retains all historical transaction classification references permanently without mutating past ledger records.
5. **Protected Transaction Assignment**: Archived categories cannot be assigned to newly created or updated transactions (`ARCHIVED_CATEGORY_ASSIGNMENT_REJECTED`).
6. **Guaranteed System Categories**: Every user always owns immutable system categories for both `EXPENSE` (`Uncategorized Expense`) and `INCOME` (`Uncategorized Income`).
7. **System Category Modification Protection**: System categories (`isSystem = true`) cannot be renamed, archived, restored, or deleted (`SYSTEM_CATEGORY_MODIFICATION`).
8. **Scoped Uniqueness**: Category names must be unique per user per `CategoryKind` among active categories (`existsByNameAndKind`).
9. **Derived Spend Totals**: Category spending totals are always computed dynamically from non-voided transaction ledger entries.
10. **Presentation Metadata**: Optional presentation metadata (`colorHex` and `iconName`) is stored in the Category aggregate for deterministic styling without influencing core domain invariants.

---

## Architectural Boundaries

- **Domain**: `Category` aggregate root (`id`, `name`, `kind`, `isSystem`, `archivedAt`, `colorHex`, `iconName`), `CategoryKind` enum (`INCOME`, `EXPENSE`), `CategoryDomainError`.
- **Application**: Single-responsibility use cases (`CreateCategory`, `RenameCategory`, `ArchiveCategory`, `RestoreCategory`, `ListCategories`, `ValidateCategoryForTransaction`).
- **Infrastructure**: Database schema migration (`20260725200000_update_categories_archived_at_and_indexes.sql`), `CategoryRow`, `CategoryMapper`, partial unique index `idx_categories_user_name_type_active`, `SupabaseCategoryRepository`.
- **Presentation**: `CategoryViewModel`, `CategoryViewModelMapper`, `CategoryController` facade, React hooks (`useCategories`, `useCreateCategory`, `useRenameCategory`, `useArchiveCategory`, `useRestoreCategory`), screen component `CategoriesScreen.tsx`.
