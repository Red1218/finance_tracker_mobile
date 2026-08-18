# Budget Overview Card Specification

> [!IMPORTANT]
> **Status**: Approved & Frozen
> **Version**: 1.0.0
> **Maturity Level**: L2 Stable

## 1. Component Contract Summary
- **Purpose**: Provides a concise summary of the user's current budgeting status, enabling users to quickly understand overall budget health without leaving the Dashboard.
- **Inputs**: Budget Name, Budget Amount, Amount Spent, Remaining Amount, Percentage Used, Budget Status, Progress Value, Category Count, Last Updated, Loading, Empty.
- **Outputs**: Budget Pressed, Budget Viewed.
- **Dependencies**: Statistic Card, Progress Indicator, Status Badge, Surface, Typography, Icon.

## 2. Metadata
- **Component ID**: `data-display.budget-overview-card`
- **Owner**: UI Architecture
- **Reviewer**: UI Architecture
- **Last Audit Date**: 2026-08-04
- **Category**: Composite
- **Classification**: Data Display

## 3. Related Documents
- [Design System](../../01-design-system.md)
- [Component System](../../02-component-system.md)
- [Navigation Architecture](../../03-navigation.md)
- [Motion Architecture](../../04-motion.md)
- [Accessibility Architecture](../../05-accessibility.md)

## 4. Responsibility
The Budget Overview Card is presentation-only. It never calculates budgets or spending.

The Budget Overview Card:
- Displays budget summary.
- Displays spending progress.
- Displays remaining budget.
- Displays budget status.
- Displays optional progress visualization.
- Supports navigation into the Budget module.

The Budget Overview Card does NOT:
- Calculate budgets.
- Aggregate transactions.
- Fetch financial information.
- Perform currency formatting.
- Replace the Budget Details screen.

## 5. Component Hierarchy
The Budget Overview Card is a Composite Component. It composes approved reusable components and must never directly depend on domain models. Note that the Progress Indicator is a distinct, reusable sub-component to ensure consistency across all progress displays.

```text
Dashboard / Financial Summary
        │
        ▼
Budget Overview Card
        │
        ├── Statistic Card
        ├── ProgressIndicator
        ├── Status Badge
        ├── Budget Category Summary
        └── Optional Action Indicator

-----------------------------------------
Progress Indicator Reusability Path:

ProgressIndicator
        │
        ├── BudgetOverviewCard
        ├── SavingsGoalCard
        ├── InvestmentProgress
        └── SubscriptionUsage
```

## 6. Usage Examples
### Correct
```text
Budget Overview Card
  ↓
Monthly Budget
  ↓
Displaying pre-calculated $800 of $1,000 spent with a progress bar.
```

### Incorrect
```text
Budget Overview Card
  ↓
Fetching transactions and aggregating the 'spent' amount internally.
  ↓
Violates responsibility by attempting to calculate domain logic instead of accepting pre-computed values.
```

## 7. Dependencies & Dependents
- **Dependencies**: Statistic Card, Progress Indicator, Status Badge, Surface, Typography, Icon, Motion Tokens, Color Tokens, Accessibility Tokens. Must NOT depend on Dashboard, Budget Domain Models, Transactions, Analytics, or Domain Services.
- **Dependents**: Used primarily by the Dashboard. Future reuse may include Budget Module Overview, Home Widget, Financial Summary.

## 8. Design Tokens
- **Surface**: Card background color.
- **Typography**: Display/Headline for primary values, Label for titles.
- **Progress Colors**: Semantic foreground/background for progress bars.
- **Status Colors**: Semantic colors for budget states (Healthy, Over Budget).
- **Radius**: Container rounding.
- **Elevation**: Shadow tokens defining depth.
- **Motion**: Standard transition tokens.
- **Spacing**: Generous internal padding.
*Note: Never define hardcoded values.*

## 9. Inputs (Props)
- `budgetName`: String - The semantic label for the budget (e.g., "Monthly Budget").
- `budgetAmount`: String/Number - The total allocated budget amount.
- `amountSpent`: String/Number - The amount already spent.
- `remainingAmount`: String/Number - The calculated amount remaining.
- `percentageUsed`: Number - A value from 0 to 100 for the progress visualization.
- `budgetStatus`: Enum - `healthy`, `near-limit`, `over-budget`, `completed`.
- `progressValue`: Number - The mapped progress value.
- `categoryCount`: Number - Optional count of categories grouped under this budget.
- `lastUpdated`: String - Formatted timestamp.
- `isLoading`: Boolean - Toggles skeleton state.
- `isEmpty`: Boolean - Toggles empty state presentation.

## 10. Outputs (Events)
If configured as non-interactive, no interaction events are emitted.
- `onBudgetPressed`: Emitted when the card is tapped (navigates to Budget Details).
- `onBudgetViewed`: Emitted for analytics when rendered on screen.

## 11. States
- **Default**: Displays full budgeting context.
- **Loading**: Preserves dimensions while replacing data with skeletons. **Crucial**: Loading skeletons must perfectly preserve card height, progress area, and typography spacing to eliminate layout shifts (jumping).
- **Empty**: Displays when no budgets exist (e.g., prompt to create a budget).
- **Error**: Graceful degradation to a warning state.
- **Offline**: Displays stale data with a visual indicator.
- **Warning**: Visual changes (typically yellow/orange) when `near-limit`.
- **Critical**: Visual changes (typically red) when `over-budget`.

## 12. Variants
- **Standard**: Full visual treatment with progress indicator.
- **Compact**: Minimized height, often dropping the progress bar or status badge.
- **Interactive**: Allows pressing to navigate.
- **Read Only**: Suppresses the action indicator and press interactions.

## 13. Composition Rules
The Budget Overview Card must compose existing approved components. It must NOT duplicate:
- Statistic Card behaviour.
- Progress rendering.
- Currency formatting.
- Motion rules.
- Accessibility behaviour.
*Those responsibilities belong to their respective reusable components.*

## 14. Financial Presentation Rules
The component never formats values independently. It delegates formatting to approved formatting services and design tokens.
Supports:
- Currency localisation.
- Percentage formatting.
- Remaining budget.
- Budget status.
- Locale awareness.

### Budget Status Rules
Support semantic budget states only. Presentation only. No calculations.

| Status | Purpose |
|--------|---------|
| `Healthy` | Within budget |
| `Near Limit` | Approaching threshold |
| `Over Budget` | Budget exceeded |
| `Completed` | Budget period ended |

## 15. Layout Rules
- **Container**: Full-width container.
- **Summary**: Primary budget summary first (e.g., "$800 spent").
- **Progress**: Progress indicator below summary.
- **Hierarchy**: Remaining budget visually subordinate to the primary summary.
- **Status**: Status badge positioned consistently (e.g., top trailing edge).
- **Action Indicator**: Optional action indicator aligned to trailing edge (e.g., chevron icon).

## 16. Responsive Behaviour
- **Mobile**: Single-column layout.
- **Tablet**: Expanded spacing and padding.
- **Desktop**: Supports dashboard grid layouts, adapting to columnar widths.

## 17. Accessibility
- **Semantic Role**: `region` (labeled "Budget Overview").
- **Accessible Name**: Must announce the budget name.
- **Accessible Description**: Synthesizes the spent, remaining, and percentage amounts.
- **Reading Order**: Title -> Status -> Spent -> Progress -> Remaining.
- **Progress Announcements**: Translates the visual progress bar into spoken percentages.
- **Dynamic Type**: Text scales without clipping.
- **Screen Reader Behaviour**: Must group related values to avoid fragmented reading.
- **Keyboard Behaviour**: Fully focusable if interactive; activates via Enter/Space.

## 18. Internationalization
- **RTL**: Layout mirrors completely (including progress bar direction).
- **Currency Localisation**: Delegated to formatting services.
- **Percentage Localisation**: Properly formats decimals/separators.
- **Long Labels**: Truncates safely with ellipses.
- **Date Localisation**: "Last Updated" must respect the user's regional date/time format.

## 19. Security & Privacy
- **Displays Sensitive Data**: YES (Displays spending and budgets).
- **Requires Data Masking**: Configurable.
- **Logs Sensitive Values**: NO.
*Note: When masking is enabled, maintain layout stability without shifting content.*

## 20. Motion
- **Entrance**: Fade-in and slide up.
- **Progress Updates**: Smooth filling animation on the progress indicator.
- **Budget Status Transitions**: Color crossfade when moving between statuses (e.g., healthy to warning).
- **Loading Transition**: Crossfade from skeleton to real data.
*Note: Motion must communicate financial state changes. Never distract.*

## 21. Performance
- **Render Cost**: Medium (due to progress indicator and composition).
- **Memoization Suitability**: High.
- **Partial Updates**: Progress animation must not re-render the entire card.
- **Progress Animation Performance**: Should utilize native driver or CSS transforms for 60fps.
- **Dashboard Scroll Performance**: Must not drop frames while scrolling.

## 22. Analytics
- **Events**: `budget_overview_viewed`, `budget_overview_pressed`
- **Required Payload Data**: None specific beyond standard component metadata.
- **Prohibited Payload Data**: Payload must never contain Budget amounts, Spending amounts, Category names, or Financial values. Only semantic identifiers.

## 23. Error Recovery
- **Missing Values**: Degrades gracefully to `-` or `0` while preserving layout.
- **Invalid Values**: Reverts to error boundary state.
- **Offline Data**: Stays visible but marks "Last Updated" clearly.
- **Partial Data Policy**: Graceful degradation is strictly required to reduce implementation ambiguity:
  - *Budget amount present, progress unavailable*: Render the budget totals and hide the progress bar completely.
  - *Progress available, last updated unavailable*: Render the progress bar and hide the timestamp.
  - *Amount spent missing*: Fall back to $0.00 or dashed state while preserving remaining values.

## 24. Known Limitations
- Displays one summarized budget view.
- Not intended for editing budgets.
- Not intended for category management.
- Progress visualization is informational only.

## 25. Anti-Patterns
> [!WARNING]
> **Never:**
> ❌ **Calculate remaining budget**: Must receive pre-calculated amounts.
> ❌ **Display transaction lists**: The card is for summaries only.
> ❌ **Mix currencies**: Prevents semantic ambiguity.
> ❌ **Perform financial calculations**: Forces the parent container to do the math.
> ❌ **Override design tokens**: Use standard Typography and Colors.
> ❌ **Duplicate Statistic Card behaviour**: The card should wrap or compose the Statistic Card primitives, not rebuild them.

## 26. Component Decision Record (CDR)
| Decision | Why | Alternatives Considered | Trade-offs | Approved By |
|----------|-----|-------------------------|------------|-------------|
| Pre-calculated Inputs | Ensures the UI layer remains purely presentational | Passing a list of transactions to calculate progress internally | Requires parent layers to provide correctly computed totals | UI Architecture |

## 27. Breaking Change Impact
- **Affected Components**: Dashboard Layout.
- **Affected Screens**: Dashboard, Budget Overview.
- **Migration Strategy**: Changes to the card's prop signature require updates to the Dashboard controller.

## 28. Testing
- **Unit Tests**: Emits interaction events correctly.
- **Accessibility Tests**: Verifies region semantics and progress announcements.
- **Visual Regression**: Baseline captures of unmasked, masked, loading, and RTL states.
- **Financial Formatting Tests**: Validates delegation to formatting services.
- **Progress Indicator Tests**: Ensures correct scaling/clipping.
- **Motion Validation**: Verifies progress bar animates smoothly.
- **Performance Validation**: Toggling visibility does not thrash layout.
*Expected Success Criteria: 100% pass rate.*

## 29. Version History
| Version | Date | Author | Description of Changes |
|---------|------|--------|------------------------|
| 1.0.0 | 2026-08-04 | UI Architecture | Initial Specification |

## 30. Review Checklist
- [x] Composition verified
- [x] Dependencies verified
- [x] Accessibility verified
- [x] Motion verified
- [x] Security verified
- [x] Analytics verified
- [x] Performance verified
- [x] Anti-patterns documented
- [x] Testing complete
