# Finance Tracker — Component Registry

> [!IMPORTANT]
> **Status**: Living Document
> **Description**: The official index of all approved and governed UI components in the Finance Tracker project.

## Registry Statistics

```text
Total Components: 8

Approved: 8

Draft: 0

Deprecated: 0

L1: 0

L2: 8

L3: 0
```

## Registry Rules

- Every reusable component must have exactly one registry entry.
- Registry entries must reference an approved specification document.
- Component IDs must be globally unique.
- Status changes require review.
- Version updates must be reflected here.
- Deprecated components remain in the registry until removed in a major release.

## Registry

| ID | Component | Category | Version | Status | Maturity | Owner | Design | Engineering | Implementation | A11y | Tests | Used By |
|----|-----------|----------|---------|--------|----------|-------|--------|-------------|----------------|------|-------|---------|
| `navigation.app-bar` | [AppBar](components/navigation/app-bar.md) | Navigation | 1.0.0 | Approved | L2 | UI Architecture | ✅ | ✅ | ⏳ | ✅ | ✅ | Dashboard, Transactions, Budgets, Analytics, Accounts, Settings, Profile |
| `navigation.bottom-navigation` | [BottomNavigation](components/navigation/bottom-navigation.md) | Navigation | 1.0.0 | Approved | L2 | UI Architecture | ✅ | ✅ | ⏳ | ✅ | ⏳ | Main App Shell |
| `navigation.floating-action-button` | [FloatingActionButton](components/navigation/floating-action-button.md) | Navigation | 1.0.0 | Approved | L2 | UI Architecture | ✅ | ✅ | ⏳ | ✅ | ⏳ | Dashboard, Transactions, Budgets, Accounts, Goals |
| `data-display.statistic-card` | [StatisticCard](components/data-display/statistic-card.md) | Data Display | 1.0.0 | Approved | L2 | UI Architecture | ✅ | ✅ | ⏳ | ✅ | ⏳ | Dashboard, Analytics, Budget Overview, Net Worth Hero |
| `data-display.net-worth-hero` | [NetWorthHero](components/data-display/net-worth-hero.md) | Data Display | 1.0.0 | Approved | L2 | UI Architecture | ✅ | ✅ | ⏳ | ✅ | ⏳ | Dashboard, Home Widget |
| `data-display.budget-overview-card` | [BudgetOverviewCard](components/data-display/budget-overview-card.md) | Data Display | 1.0.0 | Approved | L2 | UI Architecture | ✅ | ✅ | ⏳ | ✅ | ⏳ | Dashboard, Budget Overview |
| `data-display.financial-insight-card` | [FinancialInsightCard](components/data-display/financial-insight-card.md) | Data Display | 1.0.0 | Approved | L2 | UI Architecture | ✅ | ✅ | ⏳ | ✅ | ⏳ | Dashboard, Insights Module |
| `data-display.upcoming-bills-card` | [UpcomingBillsCard](components/data-display/upcoming-bills-card.md) | Data Display | 1.0.0 | Approved | L2 | UI Architecture | ✅ | ✅ | ⏳ | ✅ | ⏳ | Dashboard, Bills Module |
