# Reporting & Analytics Feature Documentation

**Feature Status**: Implemented, Verified & Synchronized ✅ (Phases 5.1–5.4 Approved & Frozen 🔒)

The Reporting & Analytics feature delivers comprehensive time-based financial analytics, comparative performance tracking, category filtering, AI-driven cash flow forecasting, and accessible PDF/CSV report exports across mobile viewports, adhering strictly to Clean Architecture, Domain-Driven Design, `ADR-019` (Reporting Read Model), and `ADR-021` (AI Insights).

---

## 1. Feature Architecture & System Layout

The feature is structured into two primary analytical views via a top-level segmented control (`AnalyticsSegmentedControl`):
1. **Reports & Trends**: Time-series spending visual charts, financial performance summary, and comparative month-over-month analytics.
2. **AI Insights & Forecasts**: 30-day cash flow projection hero card and actionable financial recommendations derived from rule engine / AI model inference.

```
App Routing Layer (app/(tabs)/insights.tsx - ADR-011 Route Delegate)
        │
        ▼
Presentation Layer (ReportingScreen & AnalyticsTabController)
  ├── AnalyticsSegmentedControl ('reports' | 'insights')
  ├── ReportingPeriodSelector ('TODAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR' | 'CUSTOM')
  ├── MonthOverMonthCard (Zero-Baseline Spending Correction)
  ├── CashFlowForecastCard (30-Day Predictive Cash Flow)
  ├── AIInsightCard ("Automated Analytics" vs "AI Generated")
  ├── ChartAccessibilityFallback (Expandable Accessible Data Table)
  ├── AnalyticsSkeleton (Layout-Stable Pulse Placeholder)
  └── ExportModal (PDF Report vs CSV Raw Data Export Dialog)
        │
        ▼
Application Orchestration Layer (Reporting Application Use Cases & Ports)
  ├── GetFinancialSummaryUseCase / GetDashboardSummaryUseCase
  ├── GetCategoryBreakdownUseCase / GetMonthlyTrendUseCase
  ├── GetMonthOverMonthComparisonUseCase
  ├── GetSpendingForecastUseCase (Orchestrates trend points with IAIInsightsProvider)
  └── ExportReportUseCase (Orchestrates report generation & share provider)
        │
        ▼
Domain Projections Layer (IReportingRepository - ADR-019 Read-Only)
  ├── Value Objects: ReportingPeriod, MonthOverMonthComparison, ExportReportRequest
  └── Projections: DashboardSummary, CategoryBreakdown, MonthlyTrendPoint, BudgetPerformance
        │
        ▼
Infrastructure Layer (SupabaseReportingRepository & Export Services)
  ├── SupabaseReportingDataSource (SQL Read Queries & Date Utilities)
  ├── CsvReportGeneratorImpl (UUID Privacy Scrubbing & 10k Safety Threshold)
  ├── PdfReportGeneratorImpl (Analytical Document Layout Generator)
  └── ReactNativeShareProviderImpl (Native OS Share Sheet Integration)
```

---

## 2. Segment Navigation & View Hierarchy

### A. Reports & Trends View
- **Financial Performance Summary**: Displays net savings amount, savings rate percentage badge, total income tile, and total expenses tile with tabular numeral formatting.
- **Month-over-Month Comparison (`MonthOverMonthCard`)**:
  - Compares income, expense, and net savings deltas against the prior period.
  - **MoM Zero-Baseline Correction**: When `previousExpense === 0` and `currentExpense > 0`, `isZeroBaseline` is set to `true`, `expensePercentageChange` is set to `null`, and the card renders **"New Expense"** with the absolute currency amount, eliminating mathematically misleading `+100%` badges.
- **Spending Trends & Category Breakdown**:
  - Reuses `CategoryBreakdownCard` (donut chart + category spend breakdown list) and `MonthlyTrendCard` (line chart comparing income vs expense progression across time buckets).
  - Integrates `ChartAccessibilityFallback` allowing screen-reader users to expand an accessible text table view.

### B. AI Insights & Forecasts View (`ADR-021`)
- **30-Day Cash Flow Forecast (`CashFlowForecastCard`)**:
  - Displays predicted net savings hero metric, predicted income tile, predicted expense tile, and confidence score badge (e.g. `85% Confidence`).
- **AI Recommendation Stream (`AIInsightCard`)**:
  - Renders severity-coded cards (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `INFO`).
  - **User-Facing Provider Badges**:
    - `InsightSource.RULE_ENGINE` / Offline rule provider is badged as **`Automated Analytics`** (never exposing internal engine names).
    - `InsightSource.AI_MODEL` / LLM provider is badged as **`AI Generated`**.
  - **4-Second Undo Dismissal**: Tapping the close button (`X`) hides the card, shows an Undo snackbar, and maintains an undo timer prior to final state commitment.

---

## 3. Report & Data Export System

- **Export Trigger**: Activated via the "Export" button in the screen top bar header, opening the `ExportModal`.
- **Formats Supported**:
  - **PDF Analytical Report**: Comprehensive visual & summary performance document generated via `IPdfReportGenerator`.
  - **CSV Raw Data Ledger**: Filtered transaction ledger generated via `ICsvReportGenerator`.
- **CSV Privacy & Security Scrubbing**:
  - `RawLedgerRow` strictly omits `id`, `user_id`, `account_id`, `category_id`, or any internal database UUIDs.
  - CSV Headers: `Transaction Date,Type,Category Name,Amount,Account Name,Description,Status`.
- **10,000-Row Safety Limit**: `ExportReportUseCase` checks ledger row count prior to generation and returns a user-friendly error if rows exceed 10,000.
- **Native File Sharing**: Passes local file URI to `IShareProvider` (`ReactNativeShareProviderImpl`) to invoke the native OS share sheet.

---

## 4. Accessibility & Touch Target Engineering

- **Touch Targets**: All interactive elements (tab segments, action buttons, modal options, dismiss icons) enforce a minimum 44x44pt target area (`minHeight: 44`, `minWidth: 44`, or `hitSlop`).
- **Screen Reader Attributes**: Standard React Native `accessibilityRole` (`tablist`, `tab`, `radio`, `summary`, `button`), `accessibilityState`, and descriptive `accessibilityLabel` attributes applied to all interactive controls and card summary containers.
- **Accessible Chart Fallback**: `ChartAccessibilityFallback` allows users to toggle an accessible data table (`View Data Table (Accessible)`), providing complete keyboard and screen-reader accessibility for visual charts.

---

## 5. Architectural & Boundary Constraints

1. **`ADR-011` Expo Router Boundary**: `app/(tabs)/insights.tsx` is a pure route delegate. All UI, hooks, and logic live under `src/features/reporting/`.
2. **`ADR-019` CQRS Read-Only Read Model**: `IReportingRepository` contains zero mutation methods (`createTransaction`, `updateTransaction`, `deleteTransaction` are strictly prohibited).
3. **`ADR-021` AI Insights Ownership**: Predictive forecasting and recommendations are owned by the `insights` bounded context, invoked by reporting application use cases without architectural leakage.
4. **Zero Production Source Code Modifications**: Shared primitives in `src/shared/` (`AppBar`, `Card`, `Button`, tokens) remain 100% frozen.

---

## 6. Verification Status

- **TypeScript Compilation**: `npx tsc --noEmit` (**0 errors**)
- **Automated Vitest Suite**: `npx vitest run` (**607 / 607 tests passed** across 196 test files)
- **Baseline Maintenance**: Preserved and expanded 598-test baseline (+9 new tests added for Phase 5 domain, application, and infrastructure)
- **Expo Doctor Check**: `npx expo-doctor` (**19/20 checks passed**; 1 pre-existing package patch version alignment suggestion analyzed and classified)
