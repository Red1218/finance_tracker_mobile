# Reporting Feature Documentation

**Feature Status**: Approved & Frozen ✅

The Reporting feature delivers end-to-end time-based analytics, category filtering, trend comparisons, and accessible visual charts across mobile viewports following Clean Architecture and DDD principles.

---

## 1. Architecture

The feature strictly adheres to Clean Architecture across 5 layers, with clear presentation abstractions for visualization decoupling:

```
Presentation Layer (ReportingScreen)
  ├── Presentation Hooks (useReportingPeriod, useReportingFilters, useDashboardSummary, etc.)
  ├── Presentation Chart Mappers (MonthlyTrendChartMapper, CategoryChartMapper, BudgetChartMapper)
  └── Presentation Chart Adapters (TrendLineChart, CategoryDonutChart, BudgetBarChart)
        │
        ▼
Application Use Cases (GetDashboardSummaryUseCase, GetMonthlyTrendUseCase, GetCategoryBreakdownUseCase, etc.)
        │
        ▼
Domain Layer (IReportingRepository, ReportingPeriod, TrendComparison, projections)
        │
        ▼
Infrastructure Layer (ReportingRepositoryImpl -> SupabaseReportingDataSource & dateRangeUtils)
```

### Decoupled Presentation Architecture
- **Chart Adapter Components** (`src/features/reporting/presentation/components/charts/`):
  - `TrendLineChart.tsx`: Wraps `react-native-gifted-charts` `<LineChart>` inside an accessible wrapper.
  - `CategoryDonutChart.tsx`: Wraps `<PieChart donut>` with total spend center label.
  - `BudgetBarChart.tsx`: Wraps paired `<BarChart>` (budget vs actual spend).
  - *Decoupling Guarantee*: Reporting cards (`MonthlyTrendCard`, `CategoryBreakdownCard`, `BudgetPerformanceCard`) depend exclusively on view-models, allowing underlying chart libraries to be replaced without modifying card components.
- **Presentation Chart Mappers** (`src/features/reporting/presentation/mappers/`):
  - `MonthlyTrendChartMapper.ts`: Converts `MonthlyTrendResponse` DTO to `LineChartPoint` data arrays and generates rich accessibility summaries.
  - `CategoryChartMapper.ts`: Converts `CategoryBreakdownResponse` DTO to donut slices with themed colors.
  - `BudgetChartMapper.ts`: Converts `BudgetPerformanceResponse` DTO to bar data stacks.

---

## 2. Core Reporting Capabilities

- **Canonical Reporting Periods**:
  - `TODAY`: Current calendar day.
  - `WEEK`: Current week (Monday to Sunday).
  - `MONTH`: Current calendar month.
  - `QUARTER`: Current calendar quarter.
  - `YEAR`: Current calendar year.
  - `CUSTOM`: User-selected custom start and end date range.
- **Category Filtering**: Supports filtering all 5 reporting cards by "All Categories" or specific category IDs via `useReportingFilters()` and `CategoryFilterSelector`.
- **Custom Date Ranges**: Native start/end date pickers (`@react-native-community/datetimepicker`) in `ReportingPeriodSelector`. Enforces `customStartDate <= customEndDate` and disables query execution if range is invalid (`isValidDateRange`). Resets custom dates when switching to predefined periods.
- **Trend Comparison**: `TrendComparison` model (`currentTotal`, `previousPeriodTotal`, `absoluteChange`, `percentageChange`). Computed safely in the Application layer (`MonthlyTrendMapper.ts`), handling `previousPeriodTotal == 0` division-by-zero safely without `NaN` or `Infinity`.
- **Daily / Monthly Aggregation**: `resolveAggregationGranularity(period, startDate, endDate)` automatically resolves aggregation granularity:
  - Daily (`YYYY-MM-DD`) for `TODAY`, `WEEK`, `MONTH`, or short `CUSTOM` ranges (<= 31 days).
  - Monthly (`YYYY-MM`) for `QUARTER`, `YEAR`, or long `CUSTOM` ranges (> 31 days).

---

## 3. Visual Analytics

- **Spending Trend (Line Chart)**: Dual-line visual trend comparing expense vs income progression across time buckets, with curved line paths and data points.
- **Category Breakdown (Donut Chart)**: Donut pie chart with a center total spend badge and distinct slice coloring per category.
- **Budget Performance (Bar Chart)**: Grouped bar chart comparing budget limit vs actual spend per budget, with status-driven bar colors (`Safe`: blue/green, `Near Limit`: amber, `Over Budget`: red).

---

## 4. Reporting Chart Theme

Centralized in `src/features/reporting/presentation/theme/reportingChartTheme.ts`:

- **Semantic Colors**:
  - `income`: `#16A34A` (Green)
  - `expense`: `#DC2626` (Red)
  - `budgetAmount`: `#94A3B8` (Slate)
  - `budgetSpent`: `#2563EB` (Blue)
  - `safe`: `#16A34A`, `nearLimit`: `#D97706`, `overBudget`: `#DC2626`
- **Category Palette**: 10-color accessible palette (`#2563EB`, `#7C3AED`, `#DB2777`, `#EA580C`, `#059669`, `#0891B2`, `#4F46E5`, `#9333EA`, `#D97706`, `#65A30D`) auto-assigned by slice index.

---

## 5. Accessibility Strategy

Every chart component incorporates accessibility metadata to ensure complete screen-reader usability (VoiceOver / TalkBack):

- **`accessible={true}`**: Declares the chart container as a single accessible element.
- **`accessibilityRole="image"`**: Identifies chart container as an image graphic to screen readers.
- **Dynamic `accessibilityLabel` Summaries**: Rather than announcing generic "Chart" labels, mappers construct rich financial text summaries:
  - *Spending Trend*: `"Spending trend chart. Total period spend: ₹24,500. Highest spend: ₹8,000 in 2026-06-15. Compared to previous period spend of ₹20,000, change is +₹4,500 (+22.5%)."`
  - *Category Breakdown*: `"Category spending breakdown chart. Total spend ₹30,000 across 4 categories. Top categories: Rent: ₹15,000 (50.0%), Food: ₹9,000 (30.0%)."`
  - *Budget Performance*: `"Budget performance chart tracking 3 budgets. 1 over budget, 0 near limit."`

---

## 6. Performance Expectations & Large Datasets

- **Mapper Expectations**: Presentation mappers map DTO responses into chart view-models in under **50ms**.
- **Large Dataset Behavior**:
  - **365 Daily Trend Points**: Automatically hides data point circles and samples x-axis labels to prevent label overlap while rendering smooth SVG lines.
  - **100+ Categories**: Donut chart slice colors cycle seamlessly through `categoryPalette`, and list legends render cleanly.

---

## 7. Testing & Verification

- **Date Range Utilities** (`dateRangeUtils.test.ts`): Tests `resolveDateRange`, `resolvePreviousDateRange`, and `resolveAggregationGranularity` across all periods.
- **Trend Comparison & Zero Division** (`MonthlyTrendMapper.test.ts`): Tests `calculateTrendComparison` including division-by-zero edge cases (`previousPeriodTotal == 0`).
- **Domain Enum Model** (`ReportingPeriod.test.ts`): Tests canonical `ReportingPeriod` values (`TODAY`, `WEEK`, `MONTH`, `QUARTER`, `YEAR`, `CUSTOM`).
- **Chart Mappers & Accessibility** (`ChartMappers.test.ts`): Tests DTO mapping, dynamic screen-reader summary generation, and 365-day / 100-category performance regression benchmarks.
- **Verification Results**:
  - TypeScript: `npx tsc --noEmit` (**0 errors**)
  - Unit Tests: `npm test` (**279 tests passing across 79 test suites**)
  - Expo Doctor: `npx expo-doctor` (**19/19 checks passed**)
