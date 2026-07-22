# Reporting Phase 4.1 Presentation Layer Design

**Status:** Draft

## Presentation Responsibilities
The Presentation layer is responsible for:
* Displaying reporting data.
* Managing UI state.
* Invoking Application use cases.
* Rendering charts.
* Handling loading states.
* Handling empty states.
* Handling error states.
* Containing no business logic.
* Containing no SQL.
* Containing no Supabase code.

## Directory Structure
```text
src/features/reporting/
    presentation/
        screens/
        components/
        hooks/
        charts/
```

## Screen Hierarchy
**ReportingScreen**

ReportingScreen is responsible for displaying:
* Dashboard Summary
* Category Breakdown
* Monthly Trend
* Budget Performance
* Largest Transactions
* Reporting Period Filter

## Component Hierarchy
```text
ReportingScreen
├── ReportingPeriodSelector
├── DashboardSummaryCard
├── CategoryBreakdownCard
├── MonthlyTrendCard
├── BudgetPerformanceCard
└── LargestTransactionsCard
```

## Hook Responsibilities
Presentation hooks are responsible for:
* Calling Application use cases.
* Managing loading state.
* Managing error state.
* Managing refresh state.
* Exposing immutable UI state.

Hooks must NOT:
* contain business logic
* execute SQL
* call Supabase directly
* compute reporting metrics

## State Ownership
- ReportingScreen owns page-level UI state.
- Presentation hooks own asynchronous data state.
- Child components are stateless.
- Child components receive immutable props only.
- Charts receive immutable data only.

## Chart Responsibilities
Charts receive already prepared data.

Charts must not:
* aggregate data
* compute percentages
* compute business values
* fetch data

Charts are rendering-only components.

## UI States
* **Initial Loading:** State displayed when data is being fetched for the first time.
* **Pull-to-Refresh:** State displayed when the user manually triggers a data refresh.
* **Empty State:** State displayed when there is no data available for the selected reporting period.
* **Error State:** State displayed when data fetching fails due to network or application errors.
* **Loaded State:** State displayed when data has been successfully retrieved and is ready to be presented.

## Refresh Behavior

Pull-to-Refresh:
- Re-fetches all reporting data for the currently selected reporting period.
- Does not reset the selected reporting period.
- Does not clear previously loaded data until new data is available.

## Error Recovery

When an error occurs:
- The user may retry.
- Retry re-executes the current reporting request.
- The selected reporting period is preserved.

## Not Included
This phase must NOT define:
* Styling
* Colors
* Typography
* Icons
* Responsive layouts
* Animations
* SQL
* Supabase
* TypeScript
* React component implementations

---
**Status:**
Draft
Pending Review
