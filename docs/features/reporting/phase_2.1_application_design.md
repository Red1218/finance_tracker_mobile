# Reporting Phase 2.1 Application Layer Design

**Status:** Draft

## Application Layer Responsibilities
* Orchestrate reporting use cases.
* Consume ReportingRepository.
* Return immutable Response DTOs.
* Perform application-level validation.
* Coordinate mapping between Domain projections and Response DTOs.
* Contain no SQL.
* Contain no Supabase code.
* Contain no React/UI code.

## Directory Structure
```
src/features/reporting/
    application/
        use-cases/
        requests/
        responses/
        mappers/
```

## Shared Requests
**ReportingRequest**
* reportingPeriod
* customStartDate (optional)
* customEndDate (optional)

## Use Cases

**GetDashboardSummaryUseCase**
* **Purpose:** Orchestrates the retrieval of the dashboard summary.
* **Input Request DTO:** ReportingRequest
* **Output Response DTO:** DashboardSummaryResponse
* **Repository Dependency:** ReportingRepository.getDashboardSummary()
* **Validation Responsibilities:** If CUSTOM reporting period is selected: customStartDate is required, customEndDate is required, and customStartDate must be before customEndDate.

**GetCategoryBreakdownUseCase**
* **Purpose:** Orchestrates the retrieval of category breakdown data.
* **Input Request DTO:** ReportingRequest
* **Output Response DTO:** CategoryBreakdownResponse
* **Repository Dependency:** ReportingRepository.getCategoryBreakdown()
* **Validation Responsibilities:** If CUSTOM reporting period is selected: customStartDate is required, customEndDate is required, and customStartDate must be before customEndDate.

**GetMonthlyTrendUseCase**
* **Purpose:** Orchestrates the retrieval of monthly trend data.
* **Input Request DTO:** ReportingRequest
* **Output Response DTO:** MonthlyTrendResponse
* **Repository Dependency:** ReportingRepository.getMonthlyTrend()
* **Validation Responsibilities:** If CUSTOM reporting period is selected: customStartDate is required, customEndDate is required, and customStartDate must be before customEndDate.

**GetBudgetPerformanceUseCase**
* **Purpose:** Orchestrates the retrieval of budget performance metrics.
* **Input Request DTO:** ReportingRequest
* **Output Response DTO:** BudgetPerformanceResponse
* **Repository Dependency:** ReportingRepository.getBudgetPerformance()
* **Validation Responsibilities:** If CUSTOM reporting period is selected: customStartDate is required, customEndDate is required, and customStartDate must be before customEndDate.

**GetLargestTransactionsUseCase**
* **Purpose:** Orchestrates the retrieval of the largest transactions.
* **Input Request DTO:** ReportingRequest
* **Output Response DTO:** LargestTransactionsResponse
* **Repository Dependency:** ReportingRepository.getLargestTransactions()
* **Validation Responsibilities:** If CUSTOM reporting period is selected: customStartDate is required, customEndDate is required, and customStartDate must be before customEndDate.

## Response DTOs

**DashboardSummaryResponse**
* totalIncome
* totalExpenses
* netCashFlow
* savingsRate
* transactionCount

**CategoryBreakdownResponse**
* items: CategoryBreakdownItem[]
  * categoryId
  * categoryName
  * amount
  * percentage
  * transactionCount

**MonthlyTrendResponse**
* items: MonthlyTrendPoint[]
  * period
  * income
  * expenses
  * netCashFlow

**BudgetPerformanceResponse**
* items: BudgetPerformanceItem[]
  * budgetId
  * categoryId
  * categoryName
  * budgetAmount
  * actualSpent
  * remaining
  * utilization
  * status

**LargestTransactionsResponse**
* items: LargestTransactionItem[]
  * expenseId
  * merchant
  * categoryName
  * amount
  * transactionDate

## Mapper Responsibilities
* Domain projection → Response DTO only.
* No business logic.
* No formatting.
* No localization.

## Not Included
This phase must NOT define:
* Supabase
* SQL
* React Query
* Hooks
* Components
* Screens
* Charts
* Repository implementations
* API clients

---
**Status:**
Draft
Pending Review
