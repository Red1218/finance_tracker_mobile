# Net Worth Hero Specification

> [!IMPORTANT]
> **Status**: Approved & Frozen
> **Version**: 1.0.0
> **Maturity Level**: L2 Stable

## 1. Component Contract Summary
- **Purpose**: The Net Worth Hero is the application's primary financial summary component. It presents the user's overall financial position together with high-level supporting information.
- **Inputs**: Net Worth Value, Currency, Trend, Trend Direction, Supporting Summary, Visibility State, Sparkline, Last Updated, Loading, Empty.
- **Outputs**: Visibility Changed, Hero Pressed (optional), Hero Viewed.
- **Dependencies**: Statistic Card, Surface, Typography, Icon, Visibility Toggle, Status Badge, Sparkline, Trend Indicator.

## 2. Metadata
- **Component ID**: `data-display.net-worth-hero`
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
The Net Worth Hero's responsibility is composition. It must not calculate, fetch, or transform financial data.

The Net Worth Hero:
- Displays the primary Net Worth value.
- Displays supporting financial context.
- Displays trend information.
- Supports optional value masking.
- Composes reusable financial display components.
- Acts as the visual focal point of the Dashboard.

The Net Worth Hero does NOT:
- Calculate Net Worth.
- Aggregate accounts.
- Fetch financial information.
- Format currencies independently.
- Replace detailed financial reports.

## 5. Component Hierarchy
The Net Worth Hero is a Composite Component. It composes approved reusable components and must never directly depend on domain models.

```text
Dashboard / Home Widget
        │
        ▼
Net Worth Hero
        │
        ├── Statistic Card (Primary)
        ├── Trend Indicator
        ├── Visibility Toggle
        ├── Status Badge
        └── Optional Sparkline
```

## 6. Usage Examples
### Correct
```text
Net Worth Hero
  ↓
Total Net Worth: $15,240.00
  ↓
Acting as the primary visual anchor at the top of the Dashboard screen
```

### Incorrect
```text
Net Worth Hero
  ↓
Total Net Worth: calculate(assets - liabilities)
  ↓
Violates responsibility by attempting to calculate domain logic instead of accepting pre-computed values
```

## 7. Dependencies & Dependents
- **Dependencies**: Statistic Card, Surface, Typography, Icon, Visibility Toggle, Status Badge, Sparkline, Motion Tokens, Color Tokens, Accessibility Tokens. Must NOT depend on Dashboard, Accounts, Transactions, Budgets, or Domain Models.
- **Dependents**: Used primarily by the Dashboard. Future reuse may include Home Widget, Account Overview, Executive Summary.

## 8. Design Tokens
- **Surface**: Hero background color.
- **Typography**: Largest display typography in the system for the primary value.
- **Elevation**: Shadow tokens defining depth.
- **Radius**: Container rounding.
- **Spacing**: Generous internal padding to establish hierarchy.
- **Motion**: Standard transition tokens.
- **Color**: Semantic foreground and background mappings.
*Note: Never define hardcoded values.*

## 9. Inputs (Props)
- `netWorthValue`: String/Number - The pre-calculated total.
- `currency`: String (Optional) - ISO code.
- `trend`: String/Number - The delta amount/percentage.
- `trendDirection`: Enum - `positive`, `negative`, `neutral`.
- `supportingSummary`: String - E.g., "Across 5 accounts".
- `isMasked`: Boolean - Controls visibility state.
- `sparklineData`: Array (Optional) - Chart data points.
- `lastUpdated`: String - Formatted timestamp.
- `isLoading`: Boolean - Toggles skeleton state.
- `isEmpty`: Boolean - Toggles empty state presentation.

## 10. Outputs (Events)
- `onVisibilityChanged`: Emitted when the user toggles value masking.
- `onHeroPressed`: Emitted when tapped (optional; routes to detailed net worth breakdown).
- `onHeroViewed`: Emitted for analytics when rendered on screen.

## 11. States
- **Default**: Displays full financial context.
- **Loading**: Preserves exact dimensions while replacing data with skeletons.
- **Empty**: Displays $0.00 or dashed lines.
- **Error**: Graceful degradation to a warning state.
- **Offline**: Displays stale data with a visual indicator.
- **Value Hidden**: Triggers the data mask (e.g., `••••••`).

## 12. Variants
- **Standard**: Full visual treatment with sparkline.
- **Compact**: Minimized height, often dropping the sparkline (used in Home Widget).
- **Read Only**: Supresses the visibility toggle and press interactions.

## 13. Composition Rules
The Net Worth Hero must compose existing approved components. It must NOT duplicate:
- Statistic Card behaviour.
- Trend rendering.
- Currency formatting.
- Motion rules.
- Accessibility behaviour.
*Those responsibilities belong to their respective components (e.g., `data-display.statistic-card`).*

## 14. Financial Presentation Rules
The Net Worth Hero never formats values itself. It delegates formatting to approved formatting services and design tokens.
Supports:
- Currency localisation.
- Value masking.
- Positive/Negative trend display.
- Locale awareness.

## 15. Layout Rules
- **Container**: Full-width container respecting safe areas.
- **Hierarchy**: Highest visual hierarchy on the Dashboard.
- **Dominance**: Primary value must always remain visually dominant.
- **Subordination**: Supporting content (Last updated, summary) is visually subordinate.
- **Sparkline**: Optional sparkline anchored below the primary value.
- **Toggle**: Visibility toggle consistently positioned (typically trailing or adjacent to the value).

## 16. Responsive Behaviour
- **Mobile**: Single-column hero.
- **Tablet**: Expanded horizontal spacing and padding.
- **Desktop**: Supports wider dashboard layouts while maintaining hierarchy, potentially wrapping the sparkline or statistics horizontally.

## 17. Accessibility
- **Semantic Role**: `region` (labeled "Net Worth Summary").
- **Accessible Name**: Must announce "Total Net Worth".
- **Accessible Description**: Synthesizes the value, trend, and last updated time.
- **Reading Order**: Title -> Visibility Toggle -> Value -> Trend -> Summary.
- **Dynamic Type**: Text scales without clipping.
- **Screen Reader Announcements**: Must explicitly announce when values change between masked/unmasked states.
- **Keyboard Behaviour**: Visibility toggle and the entire card (if interactive) are focusable.
- **Value Masking Announcements**: Announces "Net worth hidden" when masked.

## 18. Internationalization
- **RTL**: Layout mirrors completely.
- **Currency Localisation**: Delegated to formatting services.
- **Number Localisation**: Delegated to formatting services.
- **Long Labels**: Truncates safely with ellipses.
- **Date Localisation**: "Last Updated" must respect the user's regional date/time format.

## 19. Security & Privacy
- **Displays Sensitive Data**: YES
- **Requires Data Masking**: YES
- **Logs Sensitive Values**: NO
*Note: When masked, the layout must remain stable. Toggling visibility must not shift surrounding content.*

## 20. Motion
- **Entrance**: Large fade-in and slide up.
- **Value Updates**: Ticking or crossfading numerical values.
- **Trend Updates**: Color fading on the trend indicator.
- **Visibility Toggle Animation**: Smooth crossfade between the actual value and the mask characters.
- **Loading Transition**: Crossfade from skeleton to real data.
*Note: Motion communicates financial state changes. Never use decorative animation.*

## 21. Performance
- **Render Cost**: Medium (due to composition).
- **Memoization Suitability**: High.
- **Partial Updates**: Toggling visibility should only re-render the specific value node, not the entire hero.
- **Frequent Value Updates**: Must be batched/debounced.
- **Dashboard Scroll Performance**: Must remain pinned or scroll seamlessly at 60fps/120fps.

## 22. Analytics
- **Events**: `net_worth_viewed`, `net_worth_hidden`, `net_worth_revealed`, `net_worth_pressed`
- **Required Payload Data**: None specific beyond standard component metadata.
- **Prohibited Payload Data**: Payload must never contain financial values, real numbers, or account references.

## 23. Error Recovery
- **Missing Value**: Degrades gracefully to `$0.00` or `-` while preserving layout.
- **Invalid Value**: Reverts to error boundary state.
- **Offline Data**: Stays visible but marks "Last Updated" clearly.
- **Partial Data**: If trend or sparkline fails, the primary Net Worth value must still render.

## 24. Known Limitations
- Displays one aggregated financial summary.
- Not intended for detailed account analysis.
- Sparkline is optional.
- No editable fields.

## 25. Anti-Patterns
> [!WARNING]
> **Never:**
> ❌ **Perform financial calculations**: Must receive pre-calculated sums.
> ❌ **Mix multiple currencies**: Convert before passing data to the Hero.
> ❌ **Embed transaction lists**: The Hero is for summaries only.
> ❌ **Replace dashboard analytics**: Keep it focused on the highest-level metric.
> ❌ **Override design tokens**: Use standard Typography and Colors.
> ❌ **Duplicate Statistic Card behaviour**: The Hero should wrap or compose the Statistic Card primitives, not rebuild them.

## 26. Component Decision Record (CDR)
| Decision | Why | Alternatives Considered | Trade-offs | Approved By |
|----------|-----|-------------------------|------------|-------------|
| Pure Composition | Prevents duplicating complex financial formatting logic | Building formatting logic into the Hero directly | Requires passing many props down to the composed `Statistic Card` | UI Architecture |

## 27. Breaking Change Impact
- **Affected Components**: Dashboard Layout.
- **Affected Screens**: Dashboard.
- **Migration Strategy**: Changes to the Hero's prop signature require updates to the Dashboard controller.

## 28. Testing
- **Unit Tests**: Emits visibility toggle events.
- **Accessibility Tests**: Verifies masking announcements and region semantics.
- **Visual Regression**: Baseline captures of unmasked, masked, and loading states.
- **Financial Formatting Tests**: Validates delegation to formatting services.
- **Motion Validation**: Verifies visibility toggle crossfades smoothly.
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
