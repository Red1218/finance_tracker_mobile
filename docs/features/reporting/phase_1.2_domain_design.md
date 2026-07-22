# Reporting Phase 1.2 Domain Design

**Status:** Draft

## Read-Only Nature
The Reporting module is **READ-ONLY**. The Domain layer MUST NOT mutate financial data.

## Reporting Domain Responsibilities
* Expose reporting projections.
* Define repository contracts.
* Define value objects.
* Define business invariants.
* Contain no database logic.
* Contain no UI logic.
* Contain no application DTOs.

## Directory Structure
```
src/features/reporting/
    domain/
        projections/
        repositories/
        value-objects/
```

## Domain Projections

**DashboardSummary**
* totalIncome
* totalExpenses
* netCashFlow
* savingsRate
* transactionCount

**CategoryBreakdown**
* categoryId
* categoryName
* amount
* percentage
* transactionCount

**MonthlyTrendPoint**
* period
* income
* expenses
* netCashFlow

**BudgetPerformance**
* budgetId
* categoryId
* categoryName
* budgetAmount
* actualSpent
* remaining
* utilization
* status

**LargestTransaction**
* expenseId
* merchant
* categoryName
* amount
* transactionDate

## Repository Interfaces

**ReportingRepository** must expose:
* getDashboardSummary()
* getCategoryBreakdown()
* getMonthlyTrend()
* getBudgetPerformance()
* getLargestTransactions()

## Value Objects

**ReportingPeriod**
Supported values:
* CURRENT_MONTH
* PREVIOUS_MONTH
* LAST_3_MONTHS
* LAST_6_MONTHS
* LAST_12_MONTHS
* CUSTOM

## Business Invariants
* Reporting is read-only.
* Status is derived.
* Percentages are computed.
* Aggregates are immutable.
* Domain contains no persistence logic.

## Not Included
This phase must NOT define:
* DTOs
* Supabase
* SQL
* Hooks
* React Query
* Components
* Screens
* Charts
* Mappers
* Application services

---
**Status:**
Draft
Pending Review
