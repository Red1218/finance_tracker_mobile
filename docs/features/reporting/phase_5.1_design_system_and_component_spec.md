# Phase 5.1 — Design System, Component Library & Interaction Specification

> **Bounded Contexts**: Reporting (`ADR-019`) & AI Insights (`ADR-021`)  
> **Status**: APPROVED & FROZEN 🔒 (Design Specification Stage)  
> **Target Release**: Phase 5 — Analytics & Reporting  
> **Document Reference**: `docs/features/reporting/phase_5.1_design_system_and_component_spec.md`  

---

## 1. Design System Audit

A comprehensive audit of the authoritative Finance Tracker Design System ([`01-design-system.md`](file:///d:/Projects/finance_tracker_mobile/docs/ui/01-design-system.md)) and Component Registry ([`component-registry.md`](file:///d:/Projects/finance_tracker_mobile/docs/ui/component-registry.md)) was conducted prior to defining Phase 5 components.

### 1.1 Existing Token System Validation

All Phase 5 components inherit exclusively from centrally managed tokens in [`src/shared/theme/`](file:///d:/Projects/finance_tracker_mobile/src/shared/theme/):

- **Colors (`colors.ts`)**:
  - `backgroundPrimary`: `#0F172A` (Midnight Slate base screen background)
  - `surfacePrimary`: `#1E293B` (Standard card surface)
  - `surfaceElevated`: `#334155` (Elevated containers, active segmented control pill)
  - `surfaceSecondary`: `#18181B` (Segmented control container background, filter selector background)
  - `textPrimary`: `#F8FAFC` (Headings, primary amounts, active segment text)
  - `textSecondary`: `#94A3B8` (Subtitles, labels, inactive segment text)
  - `textMuted`: `#64748B` (Captions, empty state descriptors, rule-based provider badge)
  - `brandPrimary`: `#2563EB` (Active state, primary CTA buttons)
  - `brandSecondary`: `#6366F1` (Indigo accent for AI Insights badge)
  - `success`: `#10B981` (Emerald green for income, positive savings, on-track budget)
  - `warning`: `#F59E0B` (Amber for near-limit budget, moderate anomaly severity)
  - `error`: `#EF4444` (Rose red for expenses, negative savings rate, critical anomaly severity)
  - `borderSubtle`: `#27272A` (Card dividers, modal header borders)
  - `overlay`: `rgba(0, 0, 0, 0.75)` (Export modal backdrop)

- **Typography (`typography.ts`)**:
  - `display`: `32px / 40px / 700` (Hero net savings amount on large viewports)
  - `heading`: `24px / 32px / 700` (Screen titles)
  - `title`: `20px / 28px / 600` (Card section titles)
  - `body`: `16px / 24px / 400` (Modal descriptions, insight body text)
  - `label`: `14px / 20px / 500` (Pill text, form field labels)
  - `caption`: `12px / 16px / 400` (Badge text, metadata, timestamp labels)
  - `numeric`: `16px / 24px / 600` (`tabular-nums` for metric tiles, ledger rows)
  - `numericLarge`: `28px / 36px / 700` (`tabular-nums` for hero amounts, forecast totals)

- **Spacing (`spacing.ts`)**:
  - Based strictly on the **8-point grid** (with 4-point sub-grid): `space2` (2), `space4` (4), `space8` (8), `space12` (12), `space16` (16), `space20` (20), `space24` (24), `space32` (32).

---

## 2. Frozen Primitive Inventory

Phase 5 reuses existing, governed UI primitives **without modification** per project governance:

| Registry ID | Component Name | Source Path | Phase 5 Usage |
| :--- | :--- | :--- | :--- |
| `navigation.app-bar` | `AppBar` | [`src/shared/components/AppBar`](file:///d:/Projects/finance_tracker_mobile/src/shared/components/AppBar) | Primary screen header with Export action trigger |
| `navigation.bottom-navigation` | `BottomNavigation` | [`src/shared/components/BottomNavigation`](file:///d:/Projects/finance_tracker_mobile/src/shared/components/BottomNavigation) | Application tab navigation (Analytics = Slot #4) |
| `data-display.statistic-card` | `StatisticCard` | [`src/shared/components/StatisticCard`](file:///d:/Projects/finance_tracker_mobile/src/shared/components/Card) | Sub-tile metric rendering inside hero & MoM cards |
| `feedback.status-indicator` | `StatusIndicator` | [`src/shared/components/StatusIndicator`](file:///d:/Projects/finance_tracker_mobile/src/shared/components/StatusIndicator) | AI Severity badges & Budget status indicators |
| `feedback.empty-state` | `EmptyState` | [`src/shared/components/EmptyState`](file:///d:/Projects/finance_tracker_mobile/src/shared/components/EmptyState) | Zero-data states for reports & insights |
| `feedback.loading` | `Loading` | [`src/shared/components/Loading`](file:///d:/Projects/finance_tracker_mobile/src/shared/components/Loading) | Micro-loading indicators inside buttons/modals |
| `inputs.button` | `Button` | [`src/shared/components/Button`](file:///d:/Projects/finance_tracker_mobile/src/shared/components/Button) | Modal action buttons, dismiss undo actions |

---

## 3. Phase 5 Component Taxonomy

```
Phase 5 Component Architecture
├── Shared Primitives (Reused Unchanged)
│   ├── AppBar, BottomNavigation, Card, Button, StatusIndicator, EmptyState, Loading
├── New Phase 5 Components
│   ├── AnalyticsSegmentedControl
│   ├── CategoryFilterSelector
│   ├── FinancialPerformanceSummary (Hero Composition)
│   ├── MonthOverMonthCard
│   ├── SpendingAndCategoryTrendsCard
│   ├── NetSavingsRate (Integrated Hero Badge)
│   ├── CashFlowForecastCard
│   ├── SpendingAnomaliesSection
│   ├── AIInsightCard
│   ├── ExportModal
│   ├── ChartAccessibilityFallback
│   └── AnalyticsSkeleton
```

---

## 4. Component Specifications

### 4.1 AnalyticsSegmentedControl

- **Purpose**: Provides top-level view switching between "Reports & Trends" and "AI Insights & Forecasts".
- **Responsibility**: Render a 2-segment horizontal pill bar; emit active view change events.
- **Inputs / Props**:
  - `activeSegment: 'reports' | 'insights'`
  - `onSegmentChange: (segment: 'reports' | 'insights') => void`
  - `disabled?: boolean`
- **ViewModel Contract**: Controlled directly by `AnalyticsTabController`.
- **States**: `reports` active, `insights` active, disabled state (during export generation).
- **Layout Structure**: Horizontal `View` with 2 equal-width pressable flex segments inside a padded container.
- **Typography**: `typography.label` (14px, font weight 600 for active, 500 for inactive).
- **Spacing**: Container padding `space4`, inner gap `space4`, height `44px`.
- **Colors**: Container `surfaceSecondary` (`#18181B`), Active pill `surfaceElevated` (`#334155`), Active text `textPrimary` (`#F8FAFC`), Inactive text `textSecondary` (`#94A3B8`).
- **Icons**: None.
- **Touch Targets**: Minimum 44x44pt per segment (`flex: 1`, `height: 40px`, `paddingVertical: 10px`).
- **Accessibility**: `role="tablist"`, each segment `role="tab"`, `accessibilityState={{ selected: isActive }}`, `accessibilityLabel="Reports and Trends tab"` / `"AI Insights and Forecasts tab"`.
- **Responsive Behavior**: Equal 50/50 width flex distribution across 320pt to 428pt viewports.
- **Interaction Behavior**: Instant active pill animated sliding layout transition; emits `onSegmentChange`.
- **Error/Empty/Loading**: Disabled state dims opacity to 0.5 and prevents touch events.
- **Dependencies**: React Native `Pressable`, `View`, `Text`, `useTheme`.
- **MUST NOT Own**: View switching state persistence, API fetching, or screen routing.

---

### 4.2 CategoryFilterSelector

- **Purpose**: Enables single-category filtering for the historical category trend chart.
- **Responsibility**: Render a horizontal scrollable chip selector with an "All Categories" default option.
- **Inputs / Props**:
  - `categories: ReadonlyArray<{ id: string; name: string; color: string }>`
  - `selectedCategoryId: string | null` (null = All Categories)
  - `onSelectCategory: (categoryId: string | null) => void`
- **ViewModel Contract**: Accepts `CategoryBreakdownItem` list derived from `ReportingViewModel`.
- **States**: All Categories active, specific Category active, empty categories list.
- **Layout Structure**: Horizontal `ScrollView` with `showsHorizontalScrollIndicator={false}`.
- **Typography**: `typography.caption` (12px, font weight 600).
- **Spacing**: Padding horizontal `space16`, item gap `space8`, chip padding `space8` horizontal x `space4` vertical.
- **Colors**: Inactive chip `surfaceSecondary` (`#18181B`), Active chip `brandPrimary` (`#2563EB`), Active text `textPrimary`, Inactive text `textSecondary`.
- **Icons**: Category color dot (`width: 8px`, `height: 8px`, `borderRadius: 4px`).
- **Touch Targets**: Minimum height 44pt (chip container wrapped in 44pt pressable touch area).
- **Accessibility**: `role="radiogroup"`, chips `role="radio"`, `accessibilityState={{ checked: isSelected }}`, `accessibilityLabel="Filter by category: {categoryName}"`.
- **Responsive Behavior**: Smooth horizontal scrolling on narrow viewports (320pt).
- **Interaction Behavior**: Single tap selects category and triggers chart filter update; tapping selected category re-selects it without error.
- **Error/Empty/Loading**: Renders disabled chip skeleton when parent card is loading.
- **Dependencies**: React Native `ScrollView`, `Pressable`, `View`, `Text`, `useTheme`.
- **MUST NOT Own**: Multi-category selection state, SQL query generation, or reporting fetching.

---

### 4.3 FinancialPerformanceSummary (Hero Composition)

- **Purpose**: Executive hero card displaying total income, total expenses, net savings, and integrated savings rate.
- **Responsibility**: Compose high-level financial health metrics into a unified hero card.
- **Inputs / Props**:
  - `summary: FinancialSummaryViewModel`
  - `isLoading?: boolean`
- **ViewModel Contract**:
  - `formattedIncome: string`
  - `formattedExpense: string`
  - `formattedNetSavings: string`
  - `savingsRatePercentage: number`
  - `isPositiveSavings: boolean`
- **States**: Standard loaded, zero-income state (`savingsRatePercentage = 0%`), negative savings state.
- **Layout Structure**: `Card` (`variant="elevated"`) -> Hero Savings Box (Net Savings + Savings Rate Badge) -> 2-Column Sub-Tile Row (Income Tile + Expense Tile).
- **Typography**: Net Savings: `typography.numericLarge` (28px) / `display` (32px on 428pt+); Labels: `typography.caption`; Sub-tiles: `typography.numeric` (16px).
- **Spacing**: Card padding `space16`, inner gap `space12`, sub-tile gap `space12`.
- **Colors**: Hero container `surfacePrimary` (`#1E293B`), Net Savings positive `success` (`#10B981`), Net Savings negative `error` (`#EF4444`), Sub-tile income `success`, Sub-tile expense `error`.
- **Icons**: Net Savings trend arrow icon (`ArrowUpRight` for positive, `ArrowDownRight` for negative).
- **Touch Targets**: Non-interactive container; tooltips have 44x44pt touch triggers.
- **Accessibility**: `role="summary"`, `accessibilityLabel="Financial Performance Summary. Net savings {formattedNetSavings}, savings rate {savingsRatePercentage} percent. Total income {formattedIncome}, total expenses {formattedExpense}."`.
- **Responsive Behavior**: Sub-tiles wrap to 1-column layout on viewports < 340pt if monetary values exceed 8 digits.
- **Interaction Behavior**: Static summary container; long press on amounts allows copy-to-clipboard if enabled.
- **Error/Empty/Loading**: Replaced by `AnalyticsSkeleton.Hero` during fetch operations.
- **Dependencies**: `Card`, `StatisticCard`, `NetSavingsRate` badge, `useTheme`.
- **MUST NOT Own**: Financial formula calculation (encapsulated in `FinancialSummary` domain entity).

---

### 4.4 MonthOverMonthCard

- **Purpose**: Displays comparative financial performance between current period and prior period.
- **Responsibility**: Render delta amounts, percentage changes, and comparative indicator badges.
- **Inputs / Props**:
  - `comparison: MonthOverMonthComparisonViewModel`
- **ViewModel Contract**:
  - `currentPeriodLabel: string`
  - `previousPeriodLabel: string`
  - `incomeDeltaFormatted: string`
  - `incomePercentageChange: number`
  - `expenseDeltaFormatted: string`
  - `expensePercentageChange: number`
  - `netSavingsDeltaFormatted: string`
  - `isZeroBaseline: boolean`
- **States**: Normal comparative state, Zero-baseline previous period (`isZeroBaseline = true` -> renders `+100% (New)` badge), Negative variance state.
- **Layout Structure**: `Card` -> Header -> 3 comparative rows (Income MoM, Expense MoM, Net Savings MoM).
- **Typography**: Header `typography.title` (20px), Period labels `typography.caption` (12px), Delta values `typography.numeric` (16px).
- **Spacing**: Card padding `space16`, row margin bottom `space12`, badge padding `space4` x `space8`.
- **Colors**: Background `surfacePrimary`, Positive income delta `success`, Positive expense delta `error` (higher expense is negative variance), Negative expense delta `success` (lower expense is positive variance).
- **Icons**: `TrendingUp`, `TrendingDown`, `Minus` (for 0% change).
- **Touch Targets**: Container is non-interactive; info icon has 44x44pt target.
- **Accessibility**: `accessibilityLabel="Month over month comparison. Income change {incomePercentageChange} percent, Expense change {expensePercentageChange} percent."`.
- **Responsive Behavior**: Responsive text layout; percentage badges wrap below labels on 320pt screens.
- **Interaction Behavior**: Passive informational display.
- **Error/Empty/Loading**: Shows partial-data warning badge when historical periods < 2.
- **Dependencies**: `Card`, `StatusIndicator`, `useTheme`.
- **MUST NOT Own**: Period comparison delta math (computed in domain/application layer).

---

### 4.5 SpendingAndCategoryTrendsCard

- **Purpose**: Displays historical monthly spending line/bar chart and category expenditure breakdown.
- **Responsibility**: Render trend chart, category filter chips, legend table, and chart accessibility controls.
- **Inputs / Props**:
  - `monthlyTrend: MonthlyTrendViewModel`
  - `categoryBreakdown: CategoryBreakdownViewModel`
  - `selectedCategoryId: string | null`
  - `onSelectCategory: (id: string | null) => void`
- **ViewModel Contract**: Accepts mapped trend points and category breakdown items.
- **States**: Default multi-month view, category-filtered trend view, empty data state.
- **Layout Structure**: `Card` -> Header -> `CategoryFilterSelector` -> SVG Line/Bar Chart Container -> `ChartAccessibilityFallback` -> Category Legend List.
- **Typography**: Card Title `typography.title`, Legend items `typography.body` (14px), Legend amounts `typography.numeric` (16px).
- **Spacing**: Card padding `space16`, section gap `space12`, chart height `220px`.
- **Colors**: Card background `surfacePrimary`, Chart income line `success`, Chart expense line `error`, Selected category accent `brandPrimary`.
- **Icons**: `BarChart2`, `PieChart`, `Table`.
- **Touch Targets**: Chart scrubbing data points have 44x44pt touch interaction bounds.
- **Accessibility**: Includes mandatory screen-reader text summary and "View Data Table" fallback button.
- **Responsive Behavior**: Chart labels sample every 2nd month on 320pt screens to prevent label collision.
- **Interaction Behavior**: Touch press/scrub displays tooltips; Category filter selection updates chart series dynamically.
- **Error/Empty/Loading**: Displays `EmptyState` inside card if transaction count = 0.
- **Dependencies**: `Card`, `CategoryFilterSelector`, `ChartAccessibilityFallback`, `useTheme`.
- **MUST NOT Own**: Raw SQL aggregation or multi-category overlay rendering.

---

### 4.6 NetSavingsRate (Hero Integration Presentation)

- **Purpose**: Displays net savings rate percentage as an integrated badge within the hero card.
- **Responsibility**: Format and render savings rate badge with semantic color coding.
- **Inputs / Props**:
  - `savingsRatePercentage: number`
  - `isPositive: boolean`
- **ViewModel Contract**: Mapped directly from `FinancialSummaryViewModel`.
- **States**: Positive savings rate (emerald green), Zero savings rate (slate gray), Negative savings rate (rose red).
- **Layout Structure**: Compact pill container with text label and percentage value.
- **Typography**: `typography.caption` (12px, font weight 700).
- **Spacing**: Padding horizontal `space10`, padding vertical `space4`, border radius `12px`.
- **Colors**: Background `surfaceElevated`, Border `borderSubtle`, Text positive `success`, Text negative `error`, Text zero `textMuted`.
- **Icons**: `Percent` or `TrendingUp`/`TrendingDown` mini icon.
- **Touch Targets**: Non-interactive badge.
- **Accessibility**: `accessibilityLabel="{savingsRatePercentage} percent savings rate"`.
- **Responsive Behavior**: Dynamic badge width based on percentage string length.
- **Interaction Behavior**: Passive display element.
- **Error/Empty/Loading**: Shows `--%` placeholder when loading.
- **Dependencies**: `useTheme`.
- **MUST NOT Own**: Savings rate formula calculation (`(netSavings / totalIncome) * 100`).

---

### 4.7 CashFlowForecastCard

- **Purpose**: Renders 30-day forward cash flow forecast derived from AI Insights bounded context (`ADR-021`).
- **Responsibility**: Display projected income, projected expense, projected net savings, and confidence score.
- **Inputs / Props**:
  - `forecast: CashFlowForecastViewModel`
- **ViewModel Contract**:
  - `projectedIncomeFormatted: string`
  - `projectedExpenseFormatted: string`
  - `projectedSavingsFormatted: string`
  - `confidenceScorePercentage: number`
  - `forecastPeriodLabel: string`
- **States**: Standard forecast state, Low confidence forecast (<60%), Insufficient data forecast fallback.
- **Layout Structure**: `Card` -> Header with Confidence Badge -> 3 Forecast Metric Tiles -> Explanatory Caption.
- **Typography**: Header `typography.title`, Metrics `typography.numericLarge`, Caption `typography.caption`.
- **Spacing**: Card padding `space16`, tile gap `space12`, caption margin top `space8`.
- **Colors**: Card background `surfacePrimary`, Confidence badge `brandSecondary` (`#6366F1`), Projected savings `success` / `error`.
- **Icons**: `Sparkles`, `ShieldCheck`, `TrendingUp`.
- **Touch Targets**: Confidence badge press target 44x44pt to show calculation method tooltip.
- **Accessibility**: `accessibilityLabel="30 day cash flow forecast. Projected savings {projectedSavingsFormatted} with {confidenceScorePercentage} percent confidence score."`.
- **Responsive Behavior**: Metric tiles stack vertically on viewports < 360pt.
- **Interaction Behavior**: Tap confidence badge opens explanatory tooltip sheet.
- **Error/Empty/Loading**: Displays `AnalyticsSkeleton.Card` during AI generation.
- **Dependencies**: `Card`, `StatusIndicator`, `useTheme`.
- **MUST NOT Own**: Forecast prediction algorithms or financial ledger mutation.

---

### 4.8 SpendingAnomaliesSection

- **Purpose**: Displays detected spending anomalies and unusual transaction pattern alerts.
- **Responsibility**: Render anomaly list items with baseline comparison metadata.
- **Inputs / Props**:
  - `anomalies: ReadonlyArray<SpendingAnomalyViewModel>`
- **ViewModel Contract**:
  - `id: string`
  - `categoryName: string`
  - `amountFormatted: string`
  - `baselineAmountFormatted: string`
  - `deviationPercentage: number`
  - `detectedAtFormatted: string`
- **States**: Anomalies detected, No anomalies detected (renders positive confirmation card).
- **Layout Structure**: `View` section container -> Section Header -> List of Anomaly Cards.
- **Typography**: Section Title `typography.title`, Anomaly title `typography.label` (14px, weight 600), Baseline caption `typography.caption`.
- **Spacing**: Section margin bottom `space16`, item gap `space8`, card padding `space12`.
- **Colors**: Anomaly card background `surfacePrimary`, Deviation badge `warning` (`#F59E0B`) / `error` (`#EF4444`).
- **Icons**: `AlertTriangle`, `Zap`.
- **Touch Targets**: Anomaly item touch area 44pt height for navigating to filtered transaction list.
- **Accessibility**: `role="list"`, items `role="listitem"`, `accessibilityLabel="Spending anomaly in {categoryName}. Spent {amountFormatted}, {deviationPercentage} percent above baseline of {baselineAmountFormatted}."`.
- **Responsive Behavior**: Full-width cards adapting to screen width.
- **Interaction Behavior**: Tapping anomaly item opens transaction drilldown for that category.
- **Error/Empty/Loading**: Empty state renders "No spending anomalies detected this period."
- **Dependencies**: `Card`, `StatusIndicator`, `useTheme`.
- **MUST NOT Own**: Anomaly detection statistical logic (owned by `AIInsights` domain).

---

### 4.9 AIInsightCard

- **Purpose**: Renders individual AI recommendation and variance explanation cards.
- **Responsibility**: Display insight title, severity badge, provider attribution badge, recommendation text, and permanent dismiss action.
- **Inputs / Props**:
  - `insight: AIInsightViewModel`
  - `onDismiss: (insightId: string) => void`
- **ViewModel Contract**:
  - `id: string`
  - `title: string`
  - `description: string`
  - `recommendationText: string | null`
  - `severity: 'critical' | 'warning' | 'info' | 'positive'`
  - `providerLabel: 'AI Generated' | 'Automated Analytics'`
  - `confidenceScorePercentage: number`
- **States**: Active insight card, dismissing animation state, dismissed state.
- **Layout Structure**: `Card` -> Header (Title + Badges + Dismiss Button) -> Body Description -> Recommendation Box.
- **Typography**: Title `typography.label` (14px, weight 700), Body `typography.body` (14px), Badges `typography.caption` (10px).
- **Spacing**: Card padding `space16`, section gap `space8`, badge gap `space4`.
- **Colors**: Card background `surfacePrimary`, Provider badge `brandSecondary` (AI) or `textMuted` (Automated Analytics), Critical severity `error`, Warning severity `warning`.
- **Icons**: `Sparkles` (AI), `Cpu` (Automated Analytics), `X` (Dismiss button).
- **Touch Targets**: Dismiss button `X` minimum 44x44pt touch area.
- **Accessibility**: `role="article"`, `accessibilityLabel="{title}. Severity {severity}. Source {providerLabel}. {description}. Recommendation: {recommendationText}."`. Dismiss button `accessibilityLabel="Dismiss insight"`.
- **Responsive Behavior**: Badges wrap smoothly under title on 320pt screens.
- **Interaction Behavior**: Tap `X` triggers permanent dismissal (`isDismissed = true`), animates card exit, and emits `onDismiss`.
- **Error/Empty/Loading**: Non-renderable if dismissed.
- **Dependencies**: `Card`, `StatusIndicator`, `Button`, `useTheme`.
- **MUST NOT Own**: Exposure of internal "Fallback Baseline" technical terms to end users.

---

### 4.10 ExportModal

- **Purpose**: Configuration dialog for exporting reports and filtered transaction ledgers.
- **Responsibility**: Render format selector (PDF/CSV), date range options, generate CTA, loading state, and error handling.
- **Inputs / Props**:
  - `visible: boolean`
  - `selectedPeriodLabel: string`
  - `isGenerating: boolean`
  - `exportError: string | null`
  - `onClose: () => void`
  - `onGenerateExport: (config: ExportConfig) => void`
- **ViewModel Contract**:
  - `ExportConfig`: `{ format: 'pdf' | 'csv', dateRangeMode: 'current_period' | 'custom', customStartDate?: string, customEndDate?: string }`
- **States**: Initial open state, custom date mode active, generating export state, error state, success state.
- **Layout Structure**: `Modal` backdrop -> Bottom Sheet Surface -> Header with Close `X` -> Format Segmented Picker -> Date Range Radio Group -> Error Banner -> Primary CTA Button ("Generate & Share").
- **Typography**: Modal Title `typography.title` (20px), Section Labels `typography.label` (14px), Helper text `typography.caption` (12px).
- **Spacing**: Sheet padding `space24`, section margin bottom `space16`, button height `48px`.
- **Colors**: Backdrop `overlay` (`rgba(0,0,0,0.75)`), Surface `surfacePrimary` (`#1E293B`), Segment active `brandPrimary` (`#2563EB`), Error banner `error`.
- **Icons**: `FileText` (PDF), `FileSpreadsheet` (CSV), `Share2`, `X`.
- **Touch Targets**: All radio buttons, segment pills, and CTA buttons enforce minimum **44x44pt** touch targets.
- **Accessibility**: `role="dialog"`, `aria-modal={true}`, `accessibilityLabel="Export financial report dialog"`. First focusable element: Format Segmented Control.
- **Responsive Behavior**: Bottom sheet max-width 480pt centered on tablets; full-width bottom sheet on mobile.
- **Interaction Behavior**: Selecting format updates state; tapping CTA invokes native export generator and triggers system share sheet.
- **Error/Empty/Loading**: Disables form fields and displays `Loading` spinner inside CTA during generation.
- **Dependencies**: React Native `Modal`, `Card`, `Button`, `Loading`, `useTheme`.
- **MUST NOT Own**: PDF document binary synthesis or CSV file writing (handled by Infrastructure layer).

---

### 4.11 ChartAccessibilityFallback

- **Purpose**: Provides an accessible, non-visual data-table alternative for complex SVG charts.
- **Responsibility**: Render screen-reader summary text and toggle an accessible data-table view.
- **Inputs / Props**:
  - `summaryText: string`
  - `tableData: ReadonlyArray<{ label: string; values: ReadonlyArray<{ key: string; value: string }> }>`
- **ViewModel Contract**: Derived directly from chart ViewModels.
- **States**: Table view hidden (default), Table view expanded.
- **Layout Structure**: Hidden screen-reader container + Visible "View Data Table" toggle button + Expandable accessible `View` data table.
- **Typography**: Button `typography.label` (14px), Table headers `typography.caption` (12px, bold), Table cells `typography.numeric` (14px).
- **Spacing**: Margin top `space8`, padding `space12`, cell padding `space8`.
- **Colors**: Toggle button text `brandPrimary`, Table background `surfaceSecondary`, Table border `borderSubtle`.
- **Icons**: `Table`, `ChevronDown`, `ChevronUp`.
- **Touch Targets**: Toggle button minimum 44x44pt touch area.
- **Accessibility**: Screen reader reads `summaryText` automatically; Data table uses semantic `role="table"`, rows `role="row"`, cells `role="cell"`.
- **Responsive Behavior**: Horizontal scroll enabled for table if columns > 3 on 320pt screens.
- **Interaction Behavior**: Tap toggle expands/collapses data table smoothly.
- **Error/Empty/Loading**: Renders empty message if table data is empty.
- **Dependencies**: `Pressable`, `View`, `Text`, `useTheme`.
- **MUST NOT Own**: SVG rendering or touch scrubbing canvas events.

---

### 4.12 AnalyticsSkeleton

- **Purpose**: Provides animated, layout-stable skeleton placeholders during data fetching.
- **Responsibility**: Render dimensional matching skeletons for Hero card, Trend card, and Insight cards.
- **Inputs / Props**:
  - `variant: 'hero' | 'card' | 'chart' | 'insight'`
- **ViewModel Contract**: Standalone presentation component.
- **States**: Pulsing pulse animation state (`opacity: 0.4` to `0.8`).
- **Layout Structure**: Matches exact height and border-radius dimensions of target components.
- **Typography**: N/A.
- **Spacing**: Matches target component margins (`space16`).
- **Colors**: Base skeleton color `surfaceElevated` (`#334155`), Highlight color `surfaceSecondary` (`#18181B`).
- **Icons**: None.
- **Touch Targets**: Non-interactive.
- **Accessibility**: `accessibilityLabel="Loading content"`, `accessibilityLiveRegion="polite"`.
- **Responsive Behavior**: Adapts fluidly to parent container width.
- **Interaction Behavior**: Passive loading indicator.
- **Error/Empty/Loading**: Automatically replaced when data loads.
- **Dependencies**: React Native `Animated`, `View`, `useTheme`.
- **MUST NOT Own**: Data fetching logic or timeout counters.

---

## 5. ViewModel-to-UI Responsibilities

To maintain strict Clean Architecture boundaries, UI components must be purely declarative views governed by ViewModels:

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation UI                      │
│ (AnalyticsSegmentedControl, FinancialPerformanceSummary)│
└────────────────────────────┬────────────────────────────┘
                             │ Reads Formatted Properties
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    ViewModel Layer                      │
│    (ReportingViewModel, InsightsViewModel, Mappers)     │
└────────────────────────────┬────────────────────────────┘
                             │ Maps Projections
                             ▼
┌─────────────────────────────────────────────────────────┐
│                  Domain Projection Layer                │
│    (FinancialSummary, CategoryBreakdown, CashFlow)      │
└────────────────────────────┬────────────────────────────┘
```

### Responsibility Separation Matrix

| System Task | Component Layer | ViewModel / Controller Layer | Domain / Infrastructure Layer |
| :--- | :---: | :---: | :---: |
| Render currency string (`₹1,25,000.00`) | ✅ `Text` Component | ✅ Mapped in `ReportingViewModel` | ❌ Raw numbers in Domain |
| Calculate Savings Rate % | ❌ Never | ❌ Never | ✅ Domain Entity (`FinancialSummary`) |
| Filter voided transactions | ❌ Never | ❌ Never | ✅ SQL Query (`.is('voided_at', null)`) |
| Toggle Segmented View | ✅ UI Event | ✅ `AnalyticsTabController` | ❌ N/A |
| Format PDF Export binary | ❌ Never | ❌ Application UseCase | ✅ `IPdfReportGenerator` |
| Expose AI Provider label | ✅ `AIInsightCard` | ✅ Mapped to "Automated Analytics" | ❌ Domain Source Enum |

---

## 6. Interaction Design

### 6.1 Analytics Segment Switching
1. User taps "AI Insights & Forecasts" segment in `AnalyticsSegmentedControl`.
2. Component emits `onSegmentChange('insights')`.
3. `AnalyticsTabController` updates active tab state.
4. Screen renders `InsightsScreen` view with smooth fade transition; previous scroll position of Reports view is preserved in memory.

### 6.2 Category Filter Interaction
1. User taps "Food & Dining" chip in `CategoryFilterSelector`.
2. Selector emits `onSelectCategory('cat_food_123')`.
3. `SpendingAndCategoryTrendsCard` updates chart series to filter spending line exclusively for "Food & Dining".
4. Category legend table highlights "Food & Dining" row; tapping chip again clears filter back to "All Categories".

### 6.3 Gesture Conflict Protection for Charts
- **Problem**: Horizontal chart scrubbing press gestures can conflict with parent vertical `ScrollView` scrolling on mobile.
- **Interaction Rule**: When user initiates a press-and-hold gesture on the SVG chart area (`onResponderGrant`), the parent `ScrollView` scroll capability is explicitly locked (`scrollEnabled={false}`). Upon gesture release (`onResponderRelease`), parent scrolling is instantly re-enabled (`scrollEnabled={true}`).

### 6.4 AI Insight Dismissal & Undo Snackbar
1. User taps `X` dismiss button on an `AIInsightCard`.
2. Card animates exit (fade out + height collapse over 250ms).
3. Controller executes `insight.dismiss()`, setting `isDismissed = true`.
4. Screen renders a bottom 4-second Undo Snackbar ("Insight dismissed. [Undo]").
5. Tapping "Undo" within 4 seconds restores the insight card to its original position.

---

## 7. Accessibility Specification

Phase 5 strictly enforces **WCAG 2.1 AA** compliance across VoiceOver (iOS) and TalkBack (Android):

### 7.1 Minimum Touch Targets
- All interactive controls (`Pressable`, `TouchableOpacity`, `Button`, Segmented Control pills, Filter chips, Modal close buttons) MUST enforce a minimum touch target area of **44x44 pt**.

### 7.2 Non-Color Status Communication
- Financial status (Income, Expense, Over-budget, Savings Rate) MUST NEVER rely solely on color. Every status indicator must pair color with:
  1. Semantic Icon (`ArrowUpRight`, `ArrowDownRight`, `AlertTriangle`, `CheckCircle`).
  2. Explicit Text Label (`"On Track"`, `"Over Budget"`, `"+12.5% Savings Rate"`).

### 7.3 Focus Order & Screen Reader Semantics
1. `AppBar` (Title -> Export Action Button)
2. `AnalyticsSegmentedControl` (`tablist` -> `tab` 1 -> `tab` 2)
3. Period Selector / Filters
4. Summary Cards in visual order
5. Chart accessibility summary -> "View Data Table" toggle

---

## 8. Responsive Specification

Phase 5 layouts fluidly adapt across all supported physical viewports without broken text wrapping or horizontal overflow:

```
Viewport Adaptation Rules
├── 320–360pt (Small Mobile - iPhone SE)
│   ├── Sub-tile metrics stack vertically if values > 8 digits
│   ├── Chart X-axis labels sample every 2nd month
│   └── Category filter chips scroll horizontally
├── 375–414pt (Standard Mobile - iPhone 14/15)
│   ├── Sub-tile metrics render in 2-column horizontal flex row
│   └── Standard font sizes (numericLarge = 28px)
└── 428pt+ / Tablets (Pro Max / iPad)
    ├── Hero card displays side-by-side net savings + savings rate hero
    └── Export modal renders as centered floating dialog (max-width: 480pt)
```

---

## 9. Loading / Empty / Error / Partial States

### 9.1 Skeletons vs ActivityIndicators
- **Rule**: Skeletons MUST be used for primary screen loading (`AnalyticsSkeleton`). `ActivityIndicator` spinners are restricted to localized inline button actions (e.g. inside "Generate & Share" export button).

### 9.2 Zero-Baseline Month-over-Month Handling
- When previous period expense = ₹0 and current period expense > ₹0:
  - Percentage change MUST NOT evaluate to `Infinity` or `NaN`.
  - UI renders explicit badge: **`+100% (New Expense)`** with slate background.

### 9.3 Partial Historical Data State (< 2 Months)
- When user transaction history < 2 months:
  - Month-over-Month comparison card renders an informational notice: *"At least 2 months of transaction history are required to calculate comparative trends."*
  - Historical Trend chart renders available months without crashing.

---

## 10. Export Interaction Specification

```
Export Workflow Architecture
┌──────────────┐     Tap Export Icon     ┌──────────────────┐
│  AppBar Action│ ──────────────────────► │   ExportModal    │
└──────────────┘                         └────────┬─────────┘
                                                  │ Select Format (PDF / CSV)
                                                  │ Select Date Range
                                                  ▼ Tap "Generate & Share"
                                         ┌──────────────────┐
                                         │ Infrastructure   │
                                         │  (Pdf / Csv Gen) │
                                         └────────┬─────────┘
                                                  │ Emits File URI
                                                  ▼
                                         ┌──────────────────┐
                                         │ Native Share     │
                                         │  (Share.share)   │
                                         └──────────────────┘
```

### Export Modal Form Controls
1. **Format Picker**: `AnalyticsSegmentedControl` -> `[ PDF Report | CSV Raw Data ]`. Default: `PDF Report`.
2. **Data Scope**:
   - PDF: Aggregated report summary, category breakdown, budget overview, monthly trends.
   - CSV: Filtered raw transaction ledger (`date`, `category`, `amount`, `type`, `description`, `account_name`).
3. **Data Privacy Protection**:
   - CSV export MUST strictly strip internal database UUIDs (`id`, `user_id`, `account_id`, `category_id`).

---

## 11. Chart Accessibility Specification

Every chart component MUST include an accessible fallback mechanism:

```html
<!-- Accessibility Tree Representation -->
<View accessibilityRole="summary" accessibilityLabel="Monthly Spending Trend. Highest spending in March at ₹45,000, lowest in January at ₹28,000.">
  <SvgChart aria-hidden="true" />
  <Pressable accessibilityRole="button" accessibilityLabel="Toggle accessible data table">
    <Text>View Data Table</Text>
  </Pressable>
</View>
```

---

## 12. AI Insights Interaction Specification

1. **Provider Label Governance**:
   - External LLM: Badged as **`AI Generated`** (Indigo accent `#6366F1`).
   - Rule Engine: Badged as **`Automated Analytics`** (Slate accent `#64748B`).
   - Internal technical terms such as `"Fallback Baseline"` MUST NEVER be rendered in presentation text.

2. **Permanent Dismissal**:
   - Tapping `X` executes `insight.dismiss()`. Dismissed state is persisted in local preference storage via `InsightsController`.

---

## 13. Design Risks

| Risk ID | Severity | Risk Description | Mitigation Strategy |
| :--- | :---: | :--- | :--- |
| **RISK-01** | High | Vertical scroll height on 320pt screens causing scroll fatigue | Consolidated 4-card hierarchy & progressive disclosure |
| **RISK-02** | Medium | Chart press gestures interfering with vertical parent scroll | Parent `ScrollView` `scrollEnabled` locking during active scrub |
| **RISK-03** | Medium | Screen readers unable to interpret raw SVG chart paths | Mandatory screen-reader summary strings & Data Table toggle |
| **RISK-04** | Low | Exposure of technical fallback terms to end users | Strictly enforced "Automated Analytics" label spec |

---

## 14. Implementation Constraints

1. **No Code Implementation**: This document is a specification artifact. Code implementation begins only after Architecture Review approval.
2. **Clean Architecture Boundary**: UI components MUST NOT import domain repositories or execute SQL directly.
3. **Zero Modification to Primitives**: Governed primitives (`AppBar`, `Card`, `Button`, `StatusIndicator`) MUST be reused without altering their core source files.
4. **Tabular Numerals**: All components rendering monetary values MUST set `fontVariant: ['tabular-nums']`.

---

## 15. Traceability to Frozen Requirements

| Requirement ID | Specification Section | Implementation Component |
| :--- | :--- | :--- |
| **REQ-5.1** (Two Views) | §4.1, §6.1 | `AnalyticsSegmentedControl` |
| **REQ-5.2** (Single Category) | §4.2, §4.5 | `CategoryFilterSelector`, `SpendingAndCategoryTrendsCard` |
| **REQ-5.3** (Dual Export) | §4.10, §10 | `ExportModal` (PDF / CSV) |
| **REQ-5.4** (AI Insights Ownership) | §4.7, §4.9, §12 | `CashFlowForecastCard`, `AIInsightCard` (`ADR-021`) |
| **REQ-5.5** (Chart Accessibility) | §4.11, §11 | `ChartAccessibilityFallback` |
| **REQ-5.6** (Hero Savings Integration)| §4.3, §4.6 | `FinancialPerformanceSummary`, `NetSavingsRate` |
| **REQ-5.7** (Layout Skeletons) | §4.12, §9.1 | `AnalyticsSkeleton` |

---

## 16. Design Review Checklist

- [x] Design system tokens thoroughly audited against [`01-design-system.md`](file:///d:/Projects/finance_tracker_mobile/docs/ui/01-design-system.md).
- [x] All 12 required Phase 5 components fully specified across all 17 required properties.
- [x] ViewModel-to-UI responsibilities cleanly separated (Clean Architecture).
- [x] Interaction design covers segment switching, category filtering, gesture protection, and dismissal undo.
- [x] Accessibility (WCAG 2.1 AA) specifies 44x44pt targets, non-color status, and chart summaries.
- [x] Responsive layout rules defined across 320pt, 375pt, 428pt, and tablet viewports.
- [x] Export modal specifies PDF and CSV configuration flows without exposing internal database UUIDs.
- [x] Offline AI provider label strictly defined as "Automated Analytics".
- [x] Frozen primitives inventoried and reused without modification.

---

## 17. Approval Gate

```
================================================================================
  PHASE 5.1 DESIGN SYSTEM & COMPONENT SPECIFICATION: APPROVED & FROZEN 🔒
  STATUS: READY FOR ARCHITECTURE REVIEW
================================================================================
```

The **Phase 5.1 Design System, Component Library & Interaction Specification** is officially complete, verified, and frozen. The project is ready to proceed to **Phase 5.2 — Architecture Review**.
