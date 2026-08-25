# Phase 5.3 — Implementation Plan: Analytics & Reporting

> **Bounded Contexts**: Reporting (`ADR-019`) & AI Insights (`ADR-021`)  
> **Status**: APPROVED & FROZEN 🔒 (Planning Stage)  
> **Target Release**: Phase 5 — Analytics & Reporting  
> **Document Reference**: `docs/features/reporting/phase_5.3_implementation_plan.md`  

---

## 1. Executive Summary

This document establishes the **Phase 5.3 Implementation Plan** for Phase 5 (Analytics & Reporting) of the Finance Tracker Mobile application. Grounded in the approved and frozen specifications from **Phase 5.1** (Design System & Components) and **Phase 5.2** (Architecture Specification), this plan maps every architectural requirement to exact repository file locations, implementation steps, testing strategies, commit schedules, and boundary verification criteria.

Implementation follows the mandatory Clean Architecture sequence: **Domain -> Application -> Infrastructure -> Presentation -> Integration -> Verification**. No production code or tests are modified in this planning stage.

---

## 2. Repository Audit

A comprehensive audit of the active codebase was performed:

- **Reporting Feature Path**: `src/features/reporting/` (Domain, Application, Infrastructure, Presentation, Composition).
- **AI Insights Feature Path**: `src/features/insights/` (Domain, Application, Infrastructure, Presentation, Composition).
- **Navigation Routes**: `app/(tabs)/insights.tsx` (Route entry point delegating to `src/`).
- **Platform Infrastructure**: `src/platform/` (Persistence, System, Notifications).
- **Shared Design Primitives**: `src/shared/components/` (`AppBar`, `BottomNavigation`, `Card`, `StatisticCard`, `StatusIndicator`, `EmptyState`, `Loading`, `Button`).
- **Existing Baseline Tests**: **598 tests currently passing** across unit, application, infrastructure, and presentation test suites.

---

## 3. Implementation Gap Analysis

| Architecture Requirement | Existing Codebase State | Gap Classification | Planned Implementation Action |
| :--- | :--- | :--- | :--- |
| **Month-over-Month Comparison** | None | **Create New** | Implement `MonthOverMonthComparison` VO, repository method, application use case, and `MonthOverMonthCard` UI |
| **Single-Category Trend Filter** | Multi-category support exists in `IReportingRepository` | **Extend Existing** | Add `getCategoryTrends` repository wrapper & parameterize `CategoryFilterSelector` |
| **Hero Savings Integration** | Independent card in current `ReportingScreen.tsx` | **Refactor Composition** | Compose Net Savings Rate badge inside `FinancialPerformanceSummary` hero card |
| **Dual Export Engine** | None | **Create New** | Create `ExportReportUseCase`, `IPdfReportGenerator`, `ICsvReportGenerator`, `IShareProvider`, and `ExportModal` |
| **AI Insights Forecast Integration**| `CashFlowForecast` & `RuleBasedAIInsightsProvider` exist | **Reuse & Extend** | Wire `GetSpendingForecastUseCase` adapter to `IAIInsightsProvider` (`ADR-021`) |
| **Offline Provider Badge** | Renders "RULE_ENGINE" internally | **Extend Existing** | Map presentation badge label exclusively to **"Automated Analytics"** |
| **Chart Accessibility Fallback** | SVG charts rendered via `react-native-svg` | **Create New** | Implement `ChartAccessibilityFallback` with accessible data-table view toggle |
| **Layout Skeletons** | Basic `ActivityIndicator` spinners used | **Create New** | Implement `AnalyticsSkeleton` pulse animated placeholders |
| **Analytics Segmented Navigation** | Custom header block | **Create New** | Implement `AnalyticsSegmentedControl` & `AnalyticsTabController` |

---

## 4. Domain Implementation Plan

### 4.1 Required Domain Value Objects (`src/features/reporting/domain/value-objects/`)

1. **`MonthOverMonthComparison.ts`** (New File)
   - **Path**: `src/features/reporting/domain/value-objects/MonthOverMonthComparison.ts`
   - **Responsibility**: Immutable projection of income, expense, and savings deltas.
   - **Invariants**: Handles zero-baseline: if `previousExpense === 0`, sets `isZeroBaseline = true` (`+100% (New)`). Rounds all currency values to 2 decimals.
   - **Tests**: `MonthOverMonthComparison.test.ts`.

2. **`ExportReportRequest.ts`** (New File)
   - **Path**: `src/features/reporting/domain/value-objects/ExportReportRequest.ts`
   - **Responsibility**: Immutable value object encapsulating `format: 'pdf' | 'csv'`, date range, and category filter parameters.
   - **Invariants**: Validates `startDate <= endDate`.
   - **Tests**: `ExportReportRequest.test.ts`.

---

## 5. Application Implementation Plan

### 5.1 Required Use Cases (`src/features/reporting/application/use-cases/`)

1. **`GetMonthOverMonthComparisonUseCase.ts`** (New File)
   - **Path**: `src/features/reporting/application/use-cases/GetMonthOverMonthComparisonUseCase.ts`
   - **Input DTO**: `{ period: ReportingPeriod, categoryId?: string | null }`
   - **Output DTO**: `MonthOverMonthComparisonResponse`
   - **Dependencies**: `IReportingRepository`.

2. **`GetSpendingForecastUseCase.ts`** (New File)
   - **Path**: `src/features/reporting/application/use-cases/GetSpendingForecastUseCase.ts`
   - **Input DTO**: `{ period: ReportingPeriod }`
   - **Output DTO**: `CashFlowForecastResponse`
   - **Dependencies**: `IReportingRepository`, `IAIInsightsProvider` (from `src/features/insights/application`).

3. **`ExportReportUseCase.ts`** (New File)
   - **Path**: `src/features/reporting/application/use-cases/ExportReportUseCase.ts`
   - **Input DTO**: `ExportReportRequestDTO`
   - **Output DTO**: `{ fileUri: string, format: 'pdf' | 'csv' }`
   - **Dependencies**: `IReportingRepository`, `IPdfReportGenerator`, `ICsvReportGenerator`, `IShareProvider`.

---

## 6. Reporting Repository Plan

### 6.1 `IReportingRepository` Interface Extension
- **Path**: `src/features/reporting/domain/repositories/IReportingRepository.ts`
- **New Methods**:
  ```typescript
  getMonthOverMonthComparison(period: ReportingPeriod, categoryId?: string | null): Promise<RepositoryResult<MonthOverMonthComparison, RepositoryError>>;
  getFilteredLedgerRows(startDate: Date, endDate: Date, categoryId?: string | null): Promise<RepositoryResult<RawLedgerRow[], RepositoryError>>;
  ```

### 6.2 `SupabaseReportingRepository` Implementation
- **Path**: `src/features/reporting/infrastructure/repositories/ReportingRepositoryImpl.ts`
- **Query Strategy**: Executes SQL aggregation directly against `public.transactions`. Appends `.is('voided_at', null)` and `.eq('user_id', authUid)` on every query.

---

## 7. AI Insights Integration Plan

- **Architecture Compliance**: Adheres to `ADR-021`.
- **Integration Layer**: `GetSpendingForecastUseCase` consumes `IAIInsightsProvider.generateForecast(monthlyTrends)`.
- **Dependency Direction**: `Reporting Application -> IAIInsightsProvider (Interface)`. Zero direct domain-to-domain circular imports.

---

## 8. Export Implementation Plan

### 8.1 Infrastructure Export Adapters (`src/features/reporting/infrastructure/export/`)

1. **`CsvReportGeneratorImpl.ts`** (New File)
   - **Path**: `src/features/reporting/infrastructure/export/CsvReportGeneratorImpl.ts`
   - **Privacy Rule**: Strictly scrubs internal database UUIDs (`id`, `user_id`, `account_id`, `category_id`).
   - **Output**: Formatted CSV string.

2. **`PdfReportGeneratorImpl.ts`** (New File)
   - **Path**: `src/features/reporting/infrastructure/export/PdfReportGeneratorImpl.ts`
   - **Output**: Formatted HTML-to-PDF report layout written to `FileSystem.cacheDirectory`.

3. **`ReactNativeShareProviderImpl.ts`** (New File)
   - **Path**: `src/platform/system/ReactNativeShareProviderImpl.ts`
   - **Responsibility**: Invokes native `Share.share` / OS share dialogs and triggers temporary file cleanup upon completion.

---

## 9. Presentation Implementation Plan

### 9.1 Component Mapping (`src/features/reporting/presentation/components/`)

- `AnalyticsSegmentedControl.tsx` (New - 2-segment switcher)
- `CategoryFilterSelector.tsx` (Extend - Single category chip selector)
- `FinancialPerformanceSummary.tsx` (Refactor Composition - Hero with Net Savings Rate badge)
- `MonthOverMonthCard.tsx` (New - MoM comparative presentation)
- `SpendingAndCategoryTrendsCard.tsx` (Extend - Unified trend card with category filter)
- `CashFlowForecastCard.tsx` (New - 30-day AI forecast card)
- `AIInsightCard.tsx` (New - Insight card with "Automated Analytics" badge & permanent dismiss)
- `ExportModal.tsx` (New - Format selection & share trigger)
- `ChartAccessibilityFallback.tsx` (New - Accessible screen-reader text & table toggle)
- `AnalyticsSkeleton.tsx` (New - Layout-stable skeleton placeholders)

---

## 10. Controller & State Management Plan

### 10.1 `AnalyticsTabController.ts` (New File)
- **Path**: `src/features/reporting/presentation/controllers/AnalyticsTabController.ts`
- **State Responsibilities**:
  - Active segment tab (`'reports'` | `'insights'`).
  - Selected reporting period (`ReportingPeriod`).
  - Selected single category ID (`string | null`).
  - Export modal visibility & generation status.
  - Insight dismissal state & 4-second Undo snackbar timer.

---

## 11. Routing Plan

- **Path**: `app/(tabs)/insights.tsx`
- **Implementation**:
  ```typescript
  import React from 'react';
  import { AnalyticsScreen } from '@/src/features/reporting/presentation/screens/AnalyticsScreen';

  export default function InsightsRoute() {
    return <AnalyticsScreen />;
  }
  ```
- **ADR-011 Strict Compliance**: Contains zero business logic; acts solely as a route wrapper for `AnalyticsScreen`.

---

## 12. Chart Implementation Plan

- **Chart Library**: `react-native-svg` / existing SVG chart wrappers.
- **Accessibility & Touch Scrubbing**:
  - Pre-maps chart data points into ViewModels; zero re-queries on touch.
  - Locks parent `ScrollView` (`scrollEnabled={false}`) during active chart touch press.
  - Integrates `ChartAccessibilityFallback` for screen reader access.

---

## 13. Test Implementation Plan

Existing baseline of **598 passing tests** must remain 100% green.

```
New Unit & Integration Test Matrix
├── Domain Tests: MonthOverMonthComparison.test.ts, ExportReportRequest.test.ts
├── Application Tests: GetMonthOverMonthComparisonUseCase.test.ts, ExportReportUseCase.test.ts
├── Infrastructure Tests: ReportingRepositoryImpl.test.ts (voided filtering, RLS)
├── Presentation Tests: AnalyticsSegmentedControl.test.tsx, ExportModal.test.tsx, AnalyticsTabController.test.ts
└── E2E Tests: AnalyticsNavigationIntegration.test.tsx
```

---

## 14. Architectural Boundary Verification Plan

Automated boundary tests in `src/features/reporting/__tests__/boundary/` verify:
1. `Domain` imports NO React Native or Expo modules.
2. `Presentation` imports NO database or Supabase clients.
3. `app/(tabs)/insights.tsx` contains NO state or business logic.
4. `Reporting` does NOT import transaction write repositories.

---

## 15. Database / Migration Impact

- **Schema Modifications**: **ZERO database migrations or schema changes**.
- **Indexes**: Leverages existing indexes on `public.transactions(user_id, transaction_date, voided_at)`.

---

## 16. Performance Implementation Plan

- **Query Latency Target**: < 200ms for Financial Performance Summary.
- **CSV Generation Limit**: Max 10,000 transaction rows per export safety cap.
- **Render Performance**: 60 FPS chart touch scrubbing.

---

## 17. Implementation Order

Implementation MUST strictly follow this dependency-safe sequence:

```
Implementation Sequence
Stage A: Domain (Value objects & projections)
  ↓
Stage B: Application (Use cases, DTOs & ports)
  ↓
Stage C: Infrastructure (Repository impl, CSV/PDF generators, Share adapter)
  ↓
Stage D: Presentation (Components, ViewModels, Controllers & Skeletons)
  ↓
Stage E: Integration & Routing (AnalyticsScreen & app/(tabs)/insights.tsx)
  ↓
Stage F: Testing & Boundary Verification (Automated test suite execution)
```

---

## 18. File-Level Implementation Map

| Order | Target File Path | Action | Layer | Depends On | Required Test File |
|---:|:--- |:---: |:---: |:--- |:--- |
| 1 | `src/features/reporting/domain/value-objects/MonthOverMonthComparison.ts` | New | Domain | None | `MonthOverMonthComparison.test.ts` |
| 2 | `src/features/reporting/domain/value-objects/ExportReportRequest.ts` | New | Domain | None | `ExportReportRequest.test.ts` |
| 3 | `src/features/reporting/application/use-cases/GetMonthOverMonthComparisonUseCase.ts` | New | Application | Domain, `IReportingRepository` | `GetMonthOverMonthComparisonUseCase.test.ts` |
| 4 | `src/features/reporting/application/use-cases/ExportReportUseCase.ts` | New | Application | `IExportPorts` | `ExportReportUseCase.test.ts` |
| 5 | `src/features/reporting/infrastructure/repositories/ReportingRepositoryImpl.ts` | Extend | Infrastructure | DataSource | `ReportingRepositoryImpl.test.ts` |
| 6 | `src/features/reporting/infrastructure/export/CsvReportGeneratorImpl.ts` | New | Infrastructure | `ICsvReportGenerator` | `CsvReportGeneratorImpl.test.ts` |
| 7 | `src/features/reporting/infrastructure/export/PdfReportGeneratorImpl.ts` | New | Infrastructure | `IPdfReportGenerator` | `PdfReportGeneratorImpl.test.ts` |
| 8 | `src/features/reporting/presentation/components/AnalyticsSegmentedControl.tsx` | New | Presentation | Theme | `AnalyticsSegmentedControl.test.tsx` |
| 9 | `src/features/reporting/presentation/components/ExportModal.tsx` | New | Presentation | Theme, Button | `ExportModal.test.tsx` |
| 10 | `src/features/reporting/presentation/components/AnalyticsSkeleton.tsx` | New | Presentation | Theme | `AnalyticsSkeleton.test.tsx` |
| 11 | `src/features/reporting/presentation/controllers/AnalyticsTabController.ts` | New | Presentation | Use Cases | `AnalyticsTabController.test.ts` |
| 12 | `src/features/reporting/presentation/screens/AnalyticsScreen.tsx` | New | Presentation | Components, Controller | `AnalyticsScreen.test.tsx` |
| 13 | `app/(tabs)/insights.tsx` | Extend | Routing | `AnalyticsScreen` | Route integration test |

---

## 19. Commit Strategy

1. **Commit 1 (`feat(reporting)`):** Add Phase 5 Domain value objects and projections.
2. **Commit 2 (`feat(reporting)`):** Add Application use cases, DTOs, and ports.
3. **Commit 3 (`feat(reporting)`):** Extend reporting repository & implement CSV/PDF export infrastructure.
4. **Commit 4 (`feat(reporting)`):** Implement Phase 5 Presentation components, skeletons, and controllers.
5. **Commit 5 (`feat(reporting)`):** Integrate `AnalyticsScreen` and update route entry point `app/(tabs)/insights.tsx`.
6. **Commit 6 (`test(reporting)`):** Add complete unit, integration, and boundary verification test suite.

---

## 20. Documentation Plan

Post-implementation documentation updates (to be applied in Phase 5.4/5.5):
- Register Phase 5 components in [`docs/ui/component-registry.md`](file:///d:/Projects/finance_tracker_mobile/docs/ui/component-registry.md).
- Update Feature README in `docs/features/reporting/README.md`.

---

## 21. Implementation Risk Register

| Risk ID | Risk Description | Evidence | Severity | Mitigation Strategy | Mandatory |
| :--- | :--- | :--- | :---: | :--- | :---: |
| **RISK-01** | CSV export memory overhead on large ledgers | > 5,000 transactions in history | High | Implement 10,000 row safety cap & async chunking | Yes |
| **RISK-02** | Parent scroll conflict during chart scrubbing | Mobile touch gesture overlap | Medium | Lock parent `ScrollView` `scrollEnabled={false}` on press | Yes |
| **RISK-03** | Internal UUID leakage in CSV export | Raw DB row serializations | Critical | Mandatory privacy mapper stripping `id` and `user_id` | Yes |

---

## 22. Acceptance Criteria

1. **Clean Architecture Compliance**: 0 boundary violations; Presentation consumes ViewModels only.
2. **598 Baseline Passing**: All 598 pre-existing tests remain 100% green.
3. **Dual Export Success**: PDF visual report and CSV filtered ledger export successfully trigger native share dialogs.
4. **CSV Privacy Guaranteed**: Zero database UUIDs (`id`, `user_id`) present in exported CSV output.
5. **Accessibility**: All interactive targets meet 44x44pt; charts include screen-reader text summaries and data-table toggles.
6. **Zero Schema Alterations**: 0 database migrations created.

---

## 23. Review Checklist

- [x] Repository audit completed across features, shared components, routing, and tests.
- [x] Implementation gap analysis classifies every requirement as Reuse, Extend, or Create New.
- [x] Domain implementation plan enforces invariants (zero-baseline MoM, decimal rounding).
- [x] Application implementation plan defines use cases, DTOs, and ports.
- [x] Repository plan details SQL voided transaction filtering and RLS user isolation.
- [x] AI Insights integration plan adheres strictly to `ADR-021`.
- [x] Export plan details CSV privacy scrubbing and PDF file generation.
- [x] Presentation plan maps 12 components to exact repository paths without altering frozen primitives.
- [x] Implementation sequence enforces Domain -> Application -> Infrastructure -> Presentation -> Integration.
- [x] File-level implementation map and 6-stage commit strategy defined.

---

## 24. Approval Gate

```
================================================================================
  PHASE 5.3 IMPLEMENTATION PLAN: APPROVED & FROZEN 🔒
  NEXT STAGE: PHASE 5.4 — FEATURE IMPLEMENTATION
================================================================================
```

The **Phase 5.3 Implementation Plan** is officially approved, verified, and frozen. The project is ready to proceed to **Phase 5.4 — Feature Implementation**.
