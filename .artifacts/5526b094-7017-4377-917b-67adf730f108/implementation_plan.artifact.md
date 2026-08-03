# Fix 8 TypeScript Errors after DTO Refactor

This plan addresses the TypeScript compilation errors introduced during the migration from Domain entities to DTOs in the Application layer.

## User Review Required

> [!IMPORTANT]
> The changes strictly adhere to Clean Architecture by ensuring the Presentation layer consumes DTOs instead of Domain entities.

## Proposed Changes

### [Accounts Feature]

#### [MODIFY] [ArchiveAccountUseCase.test.ts](file:///D:/Projects/finance_tracker_mobile/src/features/accounts/application/__tests__/ArchiveAccountUseCase.test.ts)
- Narrow `RepositoryResult` in `getActiveCount` call to ensure `data` is accessible.

#### [MODIFY] [SetDefaultAccountUseCase.test.ts](file:///D:/Projects/finance_tracker_mobile/src/features/accounts/application/__tests__/SetDefaultAccountUseCase.test.ts)
- Narrow `RepositoryResult` in `getById` call to ensure `data` is accessible.

---

### [Categories Feature]

#### [MODIFY] [useCategories.ts](file:///D:/Projects/finance_tracker_mobile/src/features/categories/presentation/hooks/useCategories.ts)
- Update state type to `CategoryDTO[]`.
- Remove Domain entity imports.

#### [MODIFY] [useCategoryOptions.ts (Budgets)](file:///D:/Projects/finance_tracker_mobile/src/features/budgets/presentation/hooks/useCategoryOptions.ts)
- Update state type to `CategoryDTO[]`.
- Update mapping to use `cat.id` and `cat.name` directly.

#### [MODIFY] [useCategoryOptions.ts (Reporting)](file:///D:/Projects/finance_tracker_mobile/src/features/reporting/presentation/hooks/useCategoryOptions.ts)
- Update state type to `CategoryDTO[]`.
- Update mapping to use `cat.id` and `cat.name` directly.

---

### [Expenses Feature]

#### [MODIFY] [ExpensesScreen.tsx](file:///D:/Projects/finance_tracker_mobile/src/features/expenses/presentation/screens/ExpensesScreen.tsx)
- Update state type to `CategoryDTO[]`.
- Update mapping to use `cat.id` and `cat.name` directly.

---

### [Transactions Feature]

#### [MODIFY] [useAccountLedger.ts](file:///D:/Projects/finance_tracker_mobile/src/features/transactions/presentation/hooks/useAccountLedger.ts)
- Update state type to `LedgerProjectionDTO`.
- Import `LedgerProjectionDTO` from `../../application/queries/LoadAccountLedgerQueryUseCase`.
- Remove `AccountLedgerSummary` import.

#### [MODIFY] [TransactionViewModelMapper.ts](file:///D:/Projects/finance_tracker_mobile/src/features/transactions/presentation/mappers/TransactionViewModelMapper.ts)
- Implement exhaustive type-safe mapping for `typeStr` instead of using explicit casting.
- Ensure the result matches the `TransactionViewModel['type']` union.

## Verification Plan

### Automated Tests
- Run `bun x tsc --noEmit` to verify all 8 errors are resolved.
- Run `vitest` to ensure no regression in tests.
- Run `./gradlew lint` and `./gradlew test` (and `assembleDebug`) to ensure Android build is still healthy.
