# Statistic Card Specification

> [!IMPORTANT]
> **Status**: Approved & Frozen
> **Version**: 1.0.0
> **Maturity Level**: L2 Stable

## 1. Component Contract Summary
- **Purpose**: Presents a single high-value financial metric together with supporting context at a glance.
- **Inputs**: Title, Primary Value, Trend Data, Supporting Label/Value, Status, Optional Sparkline.
- **Outputs**: Card Pressed, Card Focused, Card Viewed.
- **Dependencies**: Surface, Typography, Icon, Badge, Sparkline, TrendIndicator.

## 2. Metadata
- **Component ID**: `data-display.statistic-card`
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
The Statistic Card enables users to understand important financial information at a glance while maintaining visual consistency across the application.

The Statistic Card:
- Displays one primary metric.
- Displays supporting context.
- Displays optional trend information.
- Displays optional status indicators.
- Supports loading and empty states.

The Statistic Card does NOT:
- Calculate financial values.
- Aggregate data.
- Fetch data.
- Execute business logic.
- Compute sparkline data (it strictly renders pre-computed points).
- Render charts larger than an optional sparkline.

## 5. Component Hierarchy
The Statistic Card is a reusable Data Display Composite. It must never depend on domain models. Note that the Trend Indicator is a distinct, reusable sub-component to ensure consistency across all metric displays.

```text
Dashboard / Analytics / Budget Overview
        │
        ▼
Statistic Card
        │
        ├── Surface
        ├── Typography (Title, Value, Supporting Label)
        ├── TrendIndicator
        ├── Status Badge
        └── Optional Sparkline

-----------------------------------------
Trend Indicator Reusability Path:

TrendIndicator
        │
        ├── StatisticCard
        ├── NetWorthHero
        ├── BudgetCard
        └── Analytics
```

## 6. Usage Examples
### Correct
```text
Statistic Card
  ↓
Total Net Worth
  ↓
Displaying a pre-calculated primary metric with a 30-day trend line
```

### Incorrect
```text
Statistic Card
  ↓
Transaction History
  ↓
Violates responsibility by attempting to display multiple distinct records or complex data tables
```

## 7. Dependencies & Dependents
- **Dependencies**: Surface, Typography, Icon, Badge, Sparkline, TrendIndicator, Color Tokens, Motion Tokens, Accessibility Tokens. Must NOT depend on Dashboard, Budgets, Transactions, Analytics logic, or Domain Models.
- **Dependents**: Dashboard, Net Worth Hero, Analytics, Budget Overview, Future Widgets.

## 8. Design Tokens
- **Surface**: Card background color.
- **Typography**: Display/Headline for primary value, Label for title and supporting text.
- **Color**: Semantic colors for trends (Positive/Negative/Neutral).
- **Spacing**: Internal padding, gap between value and trend.
- **Radius**: Standard card border radius.
- **Elevation**: Resting and interactive shadow tokens.
- **Motion**: Standard durations for interactions.
*Note: Never define hardcoded values.*

## 9. Inputs (Props)
- `title`: String - Semantic label for the metric (e.g., "Total Balance").
- `primaryValue`: String/Number - The core metric to display.
- `currency`: String (Optional) - ISO currency code for localized formatting.
- `trendValue`: String/Number - The delta amount or percentage.
- `trendDirection`: Enum - `positive`, `negative`, `neutral`.
- `supportingLabel`: String - Context for the supporting value.
- `supportingValue`: String/Number - Secondary metric context.
- `status`: Enum - Semantic status (e.g., `warning`, `critical`).
- `sparklineData`: Array (Optional) - Plotted points for the background sparkline.
- `icon`: String/Asset (Optional) - Semantic icon representation.
- `isLoading`: Boolean - Toggles skeleton state.
- `isEmpty`: Boolean - Toggles empty state presentation.

## 10. Outputs (Events)
If configured as non-interactive, no interaction events are emitted. If interactive:
- `onCardPressed`: Emitted when the user taps the card.
- `onCardFocused`: Emitted when keyboard navigation enters the card.
- `onCardViewed`: Emitted for analytics when the card becomes visible on screen.

## 11. States
- **Default**: Displaying standard data.
- **Loading**: Primary value and sparkline replaced with skeleton loaders. **Crucial**: Loading state must perfectly preserve card height, typography spacing, and layout. No visual jumping is permitted when data loads.
- **Empty**: Displays a placeholder (e.g., "$0.00" or "-") when no data exists.
- **Error**: Displays an error icon and fallback state when data ingestion fails.
- **Offline**: Visually indicates stale data (e.g., timestamp of last sync).
- **Disabled**: Dimmed opacity; suppresses interactive events.

## 12. Variants
- **Standard**: Full context with title, value, and trend.
- **Compact**: Minimized vertical padding; title and value inline.
- **Emphasized**: Larger typography and elevation (often used for Net Worth).
- **Interactive**: Has hover/press states and emits `onCardPressed`.
- **Read-Only**: Static display with no interaction affordances.

## 13. Layout Rules
- **Dimensions**: Full-width or container-defined width.
- **Spacing**: Internal spacing strictly uses Design System tokens.
- **Value Priority**: Visual hierarchy must follow a strict descending order:
  ```text
  Primary Value
        ↓
  Trend Indicator
        ↓
  Supporting Value
        ↓
  Status
  ```
- **Competition**: Supporting information must never compete visually with the primary value.
- **Sparkline**: Optional; acts as a background or bottom-anchored element and never dominates the card.
- **Icons**: Remain secondary to data.

## 14. Financial Presentation Rules
The component never formats values independently of the Design System.

### Formatting Ownership
```text
Formatting Owner
        ↓
Design System
        ↓
Localization
        ↓
Currency Service
```

- **Formatting**: Currency and Percentage formatting must map to global configuration.
- **Indicators**: Positive/Negative indicators must use semantic colors and supporting icons (e.g., arrows).
- **Numerals**: Requires tabular numerals (`font-variant-numeric: tabular-nums`) to prevent horizontal jitter during value updates.
- **Precision**: Enforces strict decimal precision rules based on the currency.
- **Scale**: Enforces large number abbreviations (e.g., "1.2M") when configured.
- **Locale**: Fully locale-aware (e.g., swapping `,` and `.`).

## 15. Responsive Behaviour
- **Mobile**: Single-column presentation, spanning full available width.
- **Tablet**: Supports wider layouts and multi-column grid alignment.
- **Desktop**: Participates flexibly in dashboard grids, expanding or anchoring to grid tracks.

## 16. Accessibility
- **Semantic Role**: `group` or `region` (or `button`/`link` if interactive).
- **Accessible Name**: Card must be labeled by its title.
- **Accessible Description**: Must synthesize the value and trend into a single cohesive announcement.
- **Reading Order**: Title -> Primary Value -> Trend -> Supporting Data -> Sparkline (if meaningful).
- **Dynamic Type**: Text must scale smoothly and wrap predictably without clipping.
- **Contrast**: Trend colors must meet strict 4.5:1 contrast ratios.
- **Keyboard Behaviour**: Fully focusable if interactive; activates via Enter/Space.

## 17. Internationalization
- **RTL**: Layout mirrors (icon alignment, sparkline flow).
- **Currency Localisation**: Formats cleanly (e.g., `$100` vs `100 €`).
- **Number Localisation**: Respects regional grouping separators.
- **Long Labels**: Safely truncates titles with ellipses.
- **Pluralisation**: Correctly parses dynamic labels based on numerical context.

## 18. Security & Privacy
- **Displays Sensitive Data**: YES (Displays account balances, net worth).
- **Requires Data Masking**: Configurable.
- **Logs Sensitive Values**: NO.
*Note: If masking is enabled, the component must visually obscure the primary value (e.g., `••••••`) while preserving layout stability.*

## 19. Motion
- **Entrance**: Staggered fade and slide up (`duration-base`).
- **Value Updates**: Crossfade or counter-tick animation for numerical changes.
- **Trend Updates**: Color crossfade (`duration-fast`).
- **Loading Transition**: Smooth opacity swap between skeleton and real data.
- **Visibility Changes**: Smooth layout shifts.
*Note: Motion must communicate state changes and never distract.*

## 20. Performance
- **Render Cost**: Medium (due to optional Sparkline).
- **Memoization Suitability**: High; should only re-render on explicit data changes.
- **Partial Updates**: Animations on the value must not trigger full card re-renders.
- **Frequent Value Updates**: Must debounce or throttle tick animations.
- **Scroll Performance**: Must not drop frames while scrolling.

## 21. Analytics
- **Events**: `statistic_card_viewed`, `statistic_card_pressed`, `statistic_card_value_hidden`, `statistic_card_value_revealed`
- **Required Payload Data**: `card_id`, `metric_type`.
- **Prohibited Payload Data**: Payload must NEVER include financial values or specific balances.

## 22. Error Recovery
- **Missing Values**: Degrades gracefully by showing dashes (`-`) or `$0.00`.
- **Invalid Values**: Renders error state boundary.
- **Offline Data**: Shows stale value with a subtle "offline" indicator or warning icon.
- **Partial Data**: If sparkline data fails, renders primary metric without the sparkline.

## 23. Known Limitations
- Displays one primary metric only.
- Sparkline is optional and purely decorative/directional.
- Not intended for complex charts, interactive scrubbing, or tooltips.
- Contains no editable content.

## 24. Anti-Patterns
> [!WARNING]
> **Never:**
> ❌ **Display multiple unrelated metrics**: Fragments the user's focus and breaks the single-responsibility rule.
> ❌ **Mix currencies in one card**: Creates semantic ambiguity.
> ❌ **Use decorative charts**: A sparkline must represent the actual trend of the primary metric.
> ❌ **Perform calculations inside the component**: The component is presentation-only; passing raw data arrays for it to sum violates architecture.
> ❌ **Hardcode colors or override typography**: Ruins visual consistency.

## 25. Component Decision Record (CDR)
| Decision | Why | Alternatives Considered | Trade-offs | Approved By |
|----------|-----|-------------------------|------------|-------------|
| Presentation Only (No calculations) | Decouples UI from Business Logic | Having the card compute totals from an array | Enforces parent screens to do the math, ensuring the UI is pure | UI Architecture |

## 26. Breaking Change Impact
- **Affected Components**: Dashboard Grids, Net Worth Hero, Analytics Layouts.
- **Affected Screens**: Dashboard, Budgets, Analytics.
- **Migration Strategy**: API changes require global refactoring of all metric presentation layers.

## 27. Testing
- **Unit Tests**: Verifies data passing, masking triggers, and click events.
- **Accessibility Tests**: Checks `aria-label` synthesis and contrast ratios for trend colors.
- **Visual Regression**: Baseline captures of all variants, including masked states, loading states, and RTL.
- **Financial Formatting Tests**: Validates locale and tabular numeral rendering.
- **Motion Validation**: Ensures number ticks are smooth.
- **Performance Validation**: Verifies sparkline does not cause layout thrashing.
*Expected Success Criteria: 100% pass rate.*

## 28. Version History
| Version | Date | Author | Description of Changes |
|---------|------|--------|------------------------|
| 1.0.0 | 2026-08-04 | UI Architecture | Initial Specification |

## 29. Review Checklist
- [x] Responsibility verified
- [x] Financial formatting verified
- [x] Dependencies verified
- [x] Accessibility verified
- [x] Motion verified
- [x] Analytics verified
- [x] Performance verified
- [x] Anti-patterns documented
- [x] Testing complete
