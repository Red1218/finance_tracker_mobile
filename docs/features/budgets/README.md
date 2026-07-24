# Budgets Feature

**Status**: ✅ Approved & Frozen

## Feature Overview
The Budgets feature allows users to set, track, and manage spending limits over specific time periods. Users can create budgets for individual categories or set an overall budget across all categories. It provides real-time tracking of expenses against these budgets.

## Supported CRUD Operations
- **Create**: Add new budgets with specified amounts, periods, dates, and categories.
- **Read**: View existing budgets, including summary metrics (spent, remaining, percentage used) with proper loading, empty, and error states.
- **Update**: Edit the amount of an existing budget.
- **Delete**: Remove a budget with a confirmation dialog.

## BudgetPeriod Options
The system supports the following budget periods:
- `WEEKLY`
- `MONTHLY`
- `QUARTERLY`
- `YEARLY`
- `CUSTOM`

## Category Selection Workflow
- Users can choose a specific category or select an "Overall" budget that applies to all categories.
- **Architectural Decision**: Categories are supplied to `BudgetForm` via props (retrieved using `useCategoryOptions` in the parent screen) rather than instantiated internally. This preserves Clean Architecture boundaries and enhances component reusability by decoupling the form from module initialization and DI concerns.

## Date Selection Workflow
- Users can select a `startDate` and `endDate` using native date pickers (`@react-native-community/datetimepicker`).
- The selected date timestamps are correctly preserved and passed through the existing use cases.

## Dashboard Integration
- The Budgets feature integrates with the Dashboard to provide real-time visual summaries of budget health (e.g., Safe, Near Limit, Over Budget).
- Relevant budget events automatically trigger Dashboard updates.

## Reporting Integration
- The Budgets feature provides live budget data for Reporting, enabling users to analyze budget performance (budget amount vs. actual spent) over custom periods.

## Presentation Architecture
- Adheres strictly to Clean Architecture: 
  - `BudgetsScreen` handles screen-level layout, orchestration, and module injection.
  - Custom React Hooks (`useCreateBudget`, `useUpdateBudget`, `useDeleteBudget`, `useBudgetSummary`, `useCategoryOptions`) encapsulate the ViewModels and use-case interactions.
  - Presentational components like `BudgetForm`, `BudgetCard`, and `BudgetSummaryCard` remain agnostic of business logic and receive data and callbacks via props.

## Error Handling Strategy
- Mutation hooks expose an `error` state.
- During operations (Create, Update, Delete), if an operation fails, the modal form remains open.
- The UI displays mutation errors inline within the `BudgetForm` via an error banner.
- The Zod validation schema (`budgetSchema.ts`) serves as the single source of truth for validation rules, with validation errors displayed inline.

## Toast Notification Behavior
- Success feedback is provided via transient toast notifications (`@/hooks/use-toast`).
- Triggered on:
  - Create: "Budget created"
  - Edit: "Budget updated"
  - Delete: "Budget deleted"

## Verification Results
- **TypeScript**: Clean (`npx tsc --noEmit` passed with 0 errors).
- **Unit Tests**: All tests passing (`npm test` passed 251 tests cleanly).
- **Expo Doctor**: Successful (`npx expo-doctor` passed with no issues).
