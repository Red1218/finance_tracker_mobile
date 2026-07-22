# Reporting Phase 1.1 Requirements

**Status:** ❄️ Frozen for Implementation

## Module Objective
To provide users with read-only financial insights to better understand their financial health and spending patterns.

## Functional Requirements
* **Dashboard Summary:** A high-level overview explicitly exposing the following metrics:
  * Total Income
  * Total Expenses
  * Net Cash Flow
  * Savings Rate
  * Transaction Count
* **Spending by Category:** Breakdown of expenses categorized by predefined or custom categories.
* **Monthly Trend:** Data exposing income, expenses, and net cash flow per period to keep the backend chart-library agnostic.
* **Budget Performance:** Comparison of actual spending against established budgets, specifying:
  * Budget Amount
  * Actual Spending
  * Remaining Amount
  * Utilization %
  * Derived Status (Safe / Near Limit / Over Budget)
* **Top Spending Categories:** Identification and ranking of categories where the most money is spent.
* **Largest Transactions:** A list of the most significant single transactions within the reporting period.
* **Reporting Period Filter:** The ability to filter all reports and insights by the following frozen date ranges:
  * Current Month
  * Previous Month
  * Last 3 Months
  * Last 6 Months
  * Last 12 Months
  * Custom Range

## Non-Functional Requirements
* **Read-only:** The reporting module must not alter any financial data. It strictly reads and displays data.
* **Infrastructure performs aggregation:** Data aggregation and calculations should be handled by the backend infrastructure/database to optimize performance on the client side.
* **Immutable DTOs:** Data Transfer Objects used for reporting must be immutable to ensure data integrity during processing and display.
* **Testable:** The reporting logic and components must be easily testable (unit and integration tests).
* **No N+1 queries:** Database queries must be optimized to avoid the N+1 query problem, ensuring efficient data retrieval.
* **Chart-library agnostic:** The architecture should allow for swapping out the underlying chart visualization library without major refactoring of the reporting logic.

## Out of Scope (Version 1)
* Custom report builder
* Exporting reports to PDF/CSV/Excel
* Advanced forecasting and predictive analytics
* Sharing reports with other users
* Complex drill-down interactions beyond basic category/transaction views
