# Dashboard: Stage 0.2 Information Architecture

**Status**: Approved and Frozen
**Stage**: 0.2

---

## 1. Objectives

This document defines the structure, priority, grouping, and navigation flow of information presented on the Dashboard. Its primary purpose is to ensure that the user's cognitive load is minimized and that they can immediately access the data that drives financial decisions.

This Information Architecture builds directly upon the principles established in the **Stage 0.1 Product Vision**, specifically aligning with the "5-Second Rule" and the goal of providing absolute clarity on current financial health.

## 2. Information Hierarchy

The Dashboard strictly prioritizes information into three tiers based on user value and urgency:

1. **Primary Information (Critical & Immediate)**
   - High-level metric summaries (Total Income, Total Expenses, Net Cash Flow).
   - Overall budget health (remaining safe-to-spend balance).
   - Current time period context (e.g., "This Month").

2. **Secondary Information (Context & Trends)**
   - Category-level spending breakdowns.
   - Period-over-period or month-to-date trend summaries.
   - Budget performance by individual categories.

3. **Supporting Information (Details & Investigation)**
   - Highlights of significant recent transactions.
   - Granular transaction details (accessible via drill-down).

## 3. Dashboard Sections

### 3.1. Header & Period Context
- **Purpose**: Establishes the temporal context for the entire screen.
- **Information Displayed**: Current reporting period (e.g., "July 2026").
- **User Value**: Prevents confusion by anchoring all displayed metrics to a specific timeframe.
- **Priority**: Primary.
- **Relationship**: Contextualizes all subsequent sections.
- **Information Priority**:
  - **Primary**: The currently selected time period.
  - **Supporting**: Indicators showing if the period is complete or ongoing.
  - **Contextual**: Options to select adjacent periods (e.g., previous month).

### 3.2. Financial Summary (The "Big Picture")
- **Purpose**: Answers "How am I doing overall?"
- **Information Displayed**: Income, Expenses, and Net Cash Flow for the period.
- **User Value**: Provides an instant snapshot of financial momentum.
- **Priority**: Primary.
- **Relationship**: Serves as the anchor metric for the dashboard.
- **Information Priority**:
  - **Primary**: Net Cash Flow (or remaining aggregate balance).
  - **Supporting**: Total Income and Total Expenses.
  - **Contextual**: Currency symbols and labels explaining the numbers.

### 3.3. Budget Health
- **Purpose**: Answers "Am I safe to spend?"
- **Information Displayed**: Overall budget consumption vs. limits, available balance.
- **User Value**: Direct decision support for immediate purchasing decisions.
- **Priority**: Primary.
- **Relationship**: Provides the operational boundary for the Financial Summary.
- **Information Priority**:
  - **Primary**: Remaining safe-to-spend balance.
  - **Supporting**: Total budgeted amount and total spent.
  - **Contextual**: Visual health indicators (e.g., percentage consumed).

### 3.4. Quick Actions
- **Purpose**: Provides immediate access to the most frequent user tasks without navigating through menus.
- **Information Displayed**: Action triggers for common flows.
- **User Value**: Reduces friction for routine operations like logging spending or checking reports.
- **Priority**: Primary (Action-oriented).
- **Relationship**: Serves as a bridge from Dashboard insight to application action.
- **Information Priority**:
  - **Primary**: Add transaction action.
  - **Supporting**: View budgets and view reports actions.
  - **Contextual**: Descriptive labels for each action.

### 3.5. Category Breakdown
- **Purpose**: Answers "Where is my money going?"
- **Information Displayed**: Spending grouped by category, ranked by amount.
- **User Value**: Identifies specific areas of high expenditure.
- **Priority**: Secondary.
- **Relationship**: Breaks down the "Expenses" metric from the Financial Summary into actionable segments.
- **Information Priority**:
  - **Primary**: Top 3 to 5 spending categories and their amounts.
  - **Supporting**: Percentage of total expenses per category.
  - **Contextual**: Category icons or names.

### 3.6. Trend & Momentum
- **Purpose**: Answers "Is my situation improving?"
- **Information Displayed**: Period-over-period comparison or spending trajectory.
- **User Value**: Contextualizes current behavior against historical norms.
- **Priority**: Secondary.
- **Relationship**: Provides historical context to the current Financial Summary.
- **Information Priority**:
  - **Primary**: Directional trend (up or down) compared to the previous period.
  - **Supporting**: The specific delta amount or percentage change.
  - **Contextual**: The baseline period being compared against.

### 3.7. Recent Activity Highlights
- **Purpose**: Answers "What just happened?"
- **Information Displayed**: Only the most significant or recent transactions.
- **User Value**: Quickly spots anomalies or confirms recent large purchases.
- **Priority**: Supporting.
- **Relationship**: Provides granular proof for the Category Breakdown and Financial Summary.
- **Information Priority**:
  - **Primary**: Transaction amount and merchant/payee name.
  - **Supporting**: Transaction date and assigned category.
  - **Contextual**: Transaction type (income vs expense).

## 4. High-Priority Messages

A dedicated, highly visible location must be reserved for critical system or financial messages. This section sits conceptually at the very top of the information hierarchy, appearing only when necessary.
- **Purpose**: To alert the user to urgent financial conditions or missing setup steps.
- **Information Displayed**: Budget overspending warnings, unusual transaction alerts, or onboarding prompts.
- **Priority**: Absolute Primary (when active).

## 5. Above-the-Fold Content

When the Dashboard opens, the user must immediately see the following without scrolling:
- **Header & Period Context**
- **High-Priority Messages** (if any)
- **Financial Summary**
- **Budget Health**
- **Quick Actions**

**Justification**: According to the Product Vision's 5-Second Rule, the user's most critical questions ("How much do I have?", "How much have I spent?", "Am I safe to spend?") must be answered instantly. These sections deliver immediate peace of mind, decision-support value, and frictionless action.

## 6. Below-the-Fold Content

The following sections are accessed by scrolling:
- **Category Breakdown**
- **Trend & Momentum**
- **Recent Activity Highlights**

**Justification**: While highly valuable for understanding the *why* behind the numbers, these sections represent secondary and supporting information. They require slightly deeper cognitive engagement and are used for investigation rather than immediate, split-second decision making.

## 7. Navigation Flow

The Dashboard acts as a central hub. From the Dashboard, users can seamlessly navigate to deeper areas of the application:
- **From Header & Period Context**: Navigate to select different timeframes or historical periods.
- **From Financial Summary / Budget Health**: Navigate to detailed Budget Management or full Reporting views.
- **From Quick Actions**: Instantly open forms to add transactions or deep-link to major feature hubs.
- **From Category Breakdown**: Navigate to detailed, category-specific reports or transaction lists filtered by that category.
- **From Trend & Momentum**: Navigate to long-term analytics and reporting views.
- **From Recent Activity Highlights**: Navigate to the full Transaction Ledger or specific transaction detail views.

## 8. Cross-Section Information Flow

Information flows chronologically and logically down the Dashboard:
1. **Context**: Establishes *when* we are looking (Header).
2. **Status**: Establishes *what* the current reality is (Financial Summary, Budget Health).
3. **Action**: Allows immediate intervention based on status (Quick Actions).
4. **Analysis**: Explains *why* the status is what it is (Category Breakdown, Trend).
5. **Evidence**: Provides the *proof* of the analysis (Recent Activity).

This funnel guides the user naturally from high-level awareness down to detailed investigation.

## 9. Empty State Information

When a user has no financial data (e.g., a brand new account), the information architecture must gracefully adapt:
- **Primary Information**: A clear, welcoming explanation that no data is present yet.
- **Supporting Information**: A summary of the value the user will receive once data is added (e.g., "See your spending habits here").
- **Actionable Information**: Direct, high-prominence pathways to add the first transaction, link an account, or configure a budget.
- **Hidden Sections**: Analytical sections (Categories, Trends, Recent Activity) should be suppressed to avoid showing zero-states that offer no value.

## 10. Information Grouping

Information is grouped by cognitive domain rather than strict data source:
- **The "State" Group**: (Summary + Budget) groups the high-level operational status together to minimize eye travel when making a quick spending decision.
- **The "Action" Group**: (Quick Actions) sits near the state group so users can immediately act on the status they just read.
- **The "Analysis" Group**: (Categories + Trends) groups the breakdown data together for when the user shifts from "status check" to "investigation" mode.
- **The "Evidence" Group**: (Recent Activity) sits at the bottom as the raw data supporting the analysis above it.

This grouping prevents duplicate information and keeps cognitive load low.

## 11. Progressive Disclosure

To maintain the principle of Simplicity:
- **Immediately Visible**: Aggregate totals, high-level health indicators, top 3-5 categories, and only a handful of recent significant transactions.
- **Accessed via Drill-down**: The "long tail" of smaller categories, complete historical trend charts, and the full paginated list of all transactions.

## 12. Mobile Information Priority

On smaller mobile screens, the vertical stacking must strictly adhere to the Information Hierarchy:
- The **Financial Summary**, **Budget Health**, and **Quick Actions** must dominate the initial viewport.
- If vertical space is extremely limited, visual elements (like charts in the Category Breakdown) may need to be simplified into dense lists to preserve access to the numbers.
- Supporting information (Recent Activity) remains at the bottom of the scroll view, ensuring that primary and secondary analysis is never pushed entirely off-screen.

## 13. Future Expansion

To accommodate the Future Vision (Stage 0.1), logical locations in the Information Architecture are reserved:
- **AI Insights & Alerts**: Would utilize the High-Priority Messages slot or introduce a dedicated section above the Financial Summary.
- **Savings & Investment Summaries**: Would logically group as a new primary tab or a distinct section immediately following the Financial Summary, expanding the "State" group.
- **Customizable Widgets**: The Below-the-Fold sections (Analysis and Evidence groups) would become the foundation for a modular, customizable layout grid.
