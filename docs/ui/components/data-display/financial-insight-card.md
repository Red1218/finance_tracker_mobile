# Financial Insight Card Specification

> [!IMPORTANT]
> **Status**: Approved & Frozen
> **Version**: 1.0.0
> **Maturity Level**: L2 Stable

## 1. Component Contract Summary
- **Purpose**: Presents a single actionable financial insight to help users understand their financial situation. The insight is provided by the Application layer. The component is presentation-only.
- **Inputs**: Insight Title, Insight Description, Insight Category, Priority, Status, Optional Recommendation, Optional CTA Label, Optional CTA Availability, Last Updated, Loading, Empty.
- **Outputs**: Insight Viewed, Insight Pressed, CTA Pressed.
- **Dependencies**: Surface, Typography, Icon, Badge, Button.

## 2. Metadata
- **Component ID**: `data-display.financial-insight-card`
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
The Financial Insight Card is presentation-only. It never generates, analyzes, predicts, or calculates financial insights.

The Financial Insight Card:
- Displays one financial insight.
- Displays optional supporting information.
- Displays insight priority.
- Displays insight category.
- Supports optional recommended action.
- Supports optional navigation.

The Financial Insight Card does NOT:
- Generate insights.
- Perform financial analysis.
- Calculate trends.
- Fetch data.
- Execute business logic.

## 5. Component Hierarchy
The Financial Insight Card is a Composite Component. It composes approved reusable components and must never directly depend on domain models.

```text
Dashboard / Insights Module
        │
        ▼
Financial Insight Card
        │
        ├── Surface
        ├── Insight Icon
        ├── Headline (Typography)
        ├── Supporting Text (Typography)
        ├── Priority Badge
        ├── Optional CTA (Button)
        └── Optional Status Indicator
```

## 6. Usage Examples
### Correct
```text
Financial Insight Card
  ↓
"High spending on Dining"
  ↓
Presenting a pre-calculated insight provided by the AI/Analytics layer.
```

### Incorrect
```text
Financial Insight Card
  ↓
Fetching user transactions and determining they spent 30% more this month.
  ↓
Violates responsibility by attempting to perform financial analysis internally.
```

## 7. Dependencies & Dependents
- **Dependencies**: Surface, Typography, Icon, Badge, Button, Motion Tokens, Color Tokens, Accessibility Tokens. Must NOT depend on Dashboard, Analytics Engine, AI Services, Budget Domain, Transactions, or Domain Models.
- **Dependents**: Used primarily by the Dashboard. Future reuse may include Insights Module, Financial Coach, Notifications, Home Widget.

## 8. Design Tokens
- **Surface**: Card background color.
- **Typography**: Headline for insight titles, Label for supporting text.
- **Color**: Semantic foreground/background mapped to priority levels.
- **Radius**: Container rounding.
- **Elevation**: Shadow tokens defining depth.
- **Motion**: Standard transition tokens.
- **Spacing**: Padding and gap tokens.
- **Icon**: Standard sizing.
*Note: Never define hardcoded values.*

## 9. Inputs (Props)
- `insightTitle`: String - The main headline (e.g., "High spending on Dining").
- `insightDescription`: String - Supporting context.
- `insightCategory`: Enum - E.g., `spending`, `saving`, `budget`.
- `priority`: Enum - `critical`, `high`, `medium`, `low`, `informational`.
- `status`: Enum - Current status (e.g., `new`, `read`).
- `recommendation`: String (Optional) - Actionable advice.
- `ctaLabel`: String (Optional) - Button text.
- `ctaAvailable`: Boolean (Optional) - Controls button interactivity.
- `lastUpdated`: String - Formatted timestamp.
- `isLoading`: Boolean - Toggles skeleton state.
- `isEmpty`: Boolean - Toggles empty state presentation.

## 10. Outputs (Events)
If configured as read-only, document that interaction events are suppressed.
- `onInsightViewed`: Emitted for analytics when rendered on screen.
- `onInsightPressed`: Emitted when the card body is tapped.
- `onCtaPressed`: Emitted when the recommended action button is tapped.

## 11. States
- **Default**: Displays full insight content.
- **Loading**: Preserves dimensions while replacing data with skeletons.
- **Empty**: Renders a placeholder state (e.g., "No new insights").
- **Error**: Graceful degradation to an error boundary.
- **Offline**: Stale data marked accordingly.
- **Dismissed**: Hides or transitions the card out of view.

### Insight Freshness
Since insights can become stale, they flow through a freshness lifecycle. The component reflects this state strictly for presentation, performing no calculations itself:
```text
Fresh
  ↓
Cached
  ↓
Stale
  ↓
Unavailable
```

## 12. Variants
- **Standard**: Full visual treatment with description and optional CTA.
- **Compact**: Minimized height, often dropping description or CTA.
- **Interactive**: Allows pressing to navigate or trigger CTA.
- **Read Only**: Suppresses press interactions.

## 13. Composition Rules
The Financial Insight Card must compose approved reusable components. It must NOT duplicate:
- Badge behaviour.
- Typography behaviour.
- Motion rules.
- Accessibility rules.
- Button behaviour.
*Those responsibilities belong to their respective reusable components.*

## 14. Insight Presentation Rules
The component never determines insight priority, recommendation quality, financial correctness, or AI output. It only presents information supplied by higher layers.

### Insight Type Registry
This registry is the canonical source for semantic insight categories.

| Type | Purpose |
|------|---------|
| `spending` | Spending behaviour |
| `saving` | Saving opportunity |
| `budget` | Budget status |
| `bills` | Upcoming obligations |
| `cashflow` | Income vs expenses |
| `investment` | Portfolio summary |
| `goal` | Goal progress |
| `general` | Informational |

### Priority Levels
Priority affects presentation only (e.g., color, iconography). It never changes behaviour.
- Critical
- High
- Medium
- Low
- Informational

### CTA Policy
The card should encourage exploration, not perform transactions.
- **Allowed**: View Details, Open Budget, Review Transactions, Learn More.
- **Forbidden**: Delete, Pay, Transfer, Execute financial actions.

### Multiple Insight Policy
- Only one insight is displayed per card.
- Prioritization happens before the Presentation layer.
- The component never chooses which insight to show.

### Dismiss Policy
The component only reflects the dismiss state provided to it:
- **Temporary dismiss**: Hidden for a short duration.
- **Session dismiss**: Hidden until the app restarts.
- **Permanent dismiss**: Never shown again.

## 15. Layout Rules
- **Container**: Full-width container.
- **Headline**: Positioned first.
- **Description**: Below headline.
- **Priority Badge**: Consistently positioned (e.g., top trailing edge).
- **Optional CTA**: Aligned consistently (e.g., bottom leading edge).
- **Icon**: Remains secondary to the message.

## 16. Responsive Behaviour
- **Mobile**: Single-column layout.
- **Tablet**: Expanded spacing and padding.
- **Desktop**: Supports dashboard grid layouts.

## 17. Accessibility
- **Semantic Role**: `region` (labeled "Financial Insight").
- **Accessible Name**: Card labeled by the insight title.
- **Accessible Description**: Synthesizes the description, priority, and recommendation.
- **Reading Order**: Title -> Priority -> Description -> Recommendation -> CTA.
- **CTA Announcements**: Clearly identifies the button's action context.
- **Dynamic Type**: Text scales smoothly and wraps without clipping.
- **Screen Reader Behaviour**: Reads logical groupings.
- **Keyboard Behaviour**: Fully focusable if interactive; CTA requires standard Tab traversal.

## 18. Internationalization
- **RTL**: Layout mirrors completely.
- **Localised Text**: Headline, description, and CTA must be translated.
- **Long Translations**: Truncates safely with ellipses where necessary.
- **Date Localisation**: "Last Updated" respects regional date/time formats.
- **Category Localisation**: Category badges display translated strings.

## 19. Security & Privacy
- **Displays Sensitive Data**: Possible (Insights may mention spending habits).
- **Requires Data Masking**: Configurable.
- **Logs Sensitive Values**: NO.
*Note: Never expose financial values through analytics payloads.*

## 20. Motion
- **Entrance**: Fade-in and slide up.
- **Dismiss Transition**: Slide out and collapse height smoothly.
- **Priority Updates**: Color crossfade.
- **CTA Feedback**: Standard button press scale/ripple.
- **Loading Transition**: Crossfade from skeleton to real data.
*Note: Motion communicates state. Never distract.*

## 21. Performance
- **Render Cost**: Low/Medium.
- **Memoization Suitability**: High.
- **Partial Updates**: Dismiss animations must not block the main thread.
- **Dashboard Scroll Performance**: Must not drop frames while scrolling.

## 22. Analytics
- **Events**: `insight_viewed`, `insight_pressed`, `insight_cta_pressed`, `insight_dismissed`
- **Required Payload Data**: `insight_category`, `priority`, `component_id`.
- **Prohibited Payload Data**: Payload must NEVER include financial values, AI prompts, account identifiers, or transaction identifiers.

## 23. Error Recovery
- **Missing Insight**: Degrades gracefully.
- **Invalid Insight**: Reverts to error boundary state.
- **Offline Data**: Maintains presentation of cached insights.
- **Partial Data**: E.g., CTA missing, but headline renders successfully.

## 24. Known Limitations
- Displays one insight only.
- Does not generate insights.
- Does not replace analytics.
- CTA is optional.

## 25. Anti-Patterns
> [!WARNING]
> **Never:**
> ❌ **Generate financial advice**: Must receive pre-generated insights.
> ❌ **Execute AI requests**: AI calls belong in the domain layer.
> ❌ **Perform calculations**: Prevents business logic leaking into presentation.
> ❌ **Display multiple unrelated insights**: A single card represents a single insight.
> ❌ **Override design tokens**: Use standard Typography and Colors.
> ❌ **Replace the Analytics screen**: Insights point to deeper analysis but don't replace it.

## 26. Component Decision Record (CDR)
| Decision | Why | Alternatives Considered | Trade-offs | Approved By |
|----------|-----|-------------------------|------------|-------------|
| Pure Presentation | Prevents LLM/AI logic from bleeding into UI components | Embedding local logic to calculate "spend" alerts | Parent screens must supply fully formed insights via props | UI Architecture |

## 27. Breaking Change Impact
- **Affected Components**: Dashboard Layout.
- **Affected Screens**: Dashboard, Insights Module.
- **Migration Strategy**: Changes to the card's prop signature require updates to the Dashboard controller.

## 28. Testing
- **Unit Tests**: Emits interaction events correctly.
- **Accessibility Tests**: Verifies region semantics and reading order.
- **Visual Regression**: Baseline captures of unmasked, masked, loading, and RTL states.
- **Localisation Tests**: Validates translations and text wrapping.
- **Motion Validation**: Verifies dismiss animation collapses layout smoothly.
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
