# ADR-021: AI Insights Bounded Context Architecture

## Status
**✅ Approved**

## Context
The Finance Tracker platform requires intelligent financial analysis, budget variance explanations, cash flow forecasting, spending anomaly detection, and savings opportunity recommendations. Because financial data must never be directly mutated by external AI systems or unvalidated predictions, AI Insights must operate as a strictly read-only analytical bounded context.

## Decision
1. **Analytical Consumer Principle**:
   - AI Insights is a **read-only** context that consumes Reporting read projections (`DashboardSummary`, `CategoryBreakdown`, `MonthlyTrendPoint`).
   - AI Insights never owns or mutates canonical financial state (Accounts, Transactions, Categories, Budgets, Preferences).

2. **Aggregate Root & Immutability (`Insight`)**:
   - `Insight` is the aggregate root owning `id`, `type: InsightType`, `severity: InsightSeverity`, `source: InsightSource`, `title`, `description`, `recommendation: InsightRecommendation | null`, `confidenceScore: ConfidenceScore`, `generatedAt`, and `isDismissed`.
   - Content, confidence, and generated timestamps are strictly immutable after instantiation.
   - Dismissal is permanent (`dismiss()`). Dismissed insights cannot be re-activated.

3. **Domain Value Objects**:
   - `ConfidenceScore`: Validates $0.0 \le score \le 1.0$.
   - `SpendingAnomaly`: Encapsulates transaction anomaly details including `baselinePeriod` for analytical transparency.
   - `CashFlowForecast`: Encapsulates 30-day forecast and derives `projectedSavings` (`predictedIncome - predictedExpense`).
   - `InsightRecommendation`: Encapsulates recommendation text and action links.

4. **Provider Abstraction & Fallback Strategy (`IAIInsightsProvider`)**:
   - `IAIInsightsProvider` abstracts AI generation away from Application use cases.
   - `GeminiAIInsightsProvider` wraps Google Gemini LLM SDK with automatic fallback to `RuleBasedAIInsightsProvider`.
   - `RuleBasedAIInsightsProvider` provides 100% offline, deterministic analytical evaluation.

5. **Presentation Layer Architecture**:
   - `InsightsViewModel`: Exposes presentation-formatted cards and cash flow forecast metrics.
   - `InsightsController`: Reactive state facade coordinating insight loading and dismissal workflows.
   - `InsightsScreen` & `InsightCard`: UI components rendering severity badges, confidence scores, and recommendations.

## Consequences
- **Positive**: Complete provider independence—external AI models can be upgraded, swapped, or operated offline without changing domain code.
- **Positive**: Absolute financial safety—AI outputs are recommendations only and cannot pollute transactional ledgers.
- **Negative**: Requires mapper translation between LLM/rule responses and domain aggregate structures.
