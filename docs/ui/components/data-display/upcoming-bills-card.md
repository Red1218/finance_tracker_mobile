# Upcoming Bills Card Specification

> [!IMPORTANT]
> **Status**: Approved & Frozen
> **Version**: 1.0.0
> **Maturity Level**: L2 Stable

## 1. Component Contract Summary
- **Purpose**: Presents a concise summary of the user's upcoming financial obligations to increase financial awareness by surfacing bills that require attention soon. The component is presentation-only.
- **Inputs**: Bill Name, Bill Amount, Currency, Due Date, Payment Status, Urgency, Category, Optional CTA Label, Loading, Empty.
- **Outputs**: Bill Viewed, Bill Pressed, CTA Pressed.
- **Dependencies**: Surface, Typography, Icon, Badge, Button.

## 2. Metadata
- **Component ID**: `data-display.upcoming-bills-card`
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
The Upcoming Bills Card is presentation-only. It never schedules, calculates, prioritizes, or manages bills.

The Upcoming Bills Card:
- Displays upcoming bills.
- Displays due dates.
- Displays bill amounts.
- Displays payment status.
- Displays optional urgency indicators.
- Supports optional navigation into the Bills module.

The Upcoming Bills Card does NOT:
- Calculate due dates.
- Determine urgency.
- Schedule reminders.
- Execute bill payments.
- Fetch bill information.
- Perform business logic.

## 5. Component Hierarchy
The Upcoming Bills Card is a Composite Component. It composes approved reusable components and must never directly depend on domain models.

```text
Dashboard / Bills Module
        │
        ▼
Upcoming Bills Card
        │
        ├── Surface
        ├── Bill Summary (Typography)
        ├── Due Date (Typography)
        ├── Amount (Typography)
        ├── Status Badge
        ├── Optional Urgency Indicator (Icon/Color)
        └── Optional CTA (Button)
```

## 6. Usage Examples
### Correct
```text
Upcoming Bills Card
  ↓
"Electric Bill"
  ↓
Presenting a pre-calculated due date (e.g., "Due Tomorrow") and status ("Unpaid") provided by the Bills Domain layer.
```

### Incorrect
```text
Upcoming Bills Card
  ↓
Fetching user calendar, computing days until the 15th, and deciding if a bill is "Overdue".
  ↓
Violates responsibility by attempting to perform date and urgency calculations internally.
```

## 7. Dependencies & Dependents
- **Dependencies**: Surface, Typography, Icon, Badge, Button, Motion Tokens, Color Tokens, Accessibility Tokens. Must NOT depend on Dashboard, Bills Domain, Calendar Services, Payment Services, or Domain Models.
- **Dependents**: Used primarily by the Dashboard. Future reuse may include Bills Module, Home Widget, Reminder Centre.

## 8. Design Tokens
- **Surface**: Card background color.
- **Typography**: Display for Amount, Headline for Bill Name, Label for Due Date.
- **Color**: Semantic foreground/background mapped to urgency and status levels.
- **Radius**: Container rounding.
- **Elevation**: Shadow tokens defining depth.
- **Motion**: Standard transition tokens.
- **Spacing**: Padding and gap tokens.
*Note: Never define hardcoded values.*

## 9. Inputs (Props)
- `billName`: String - The semantic label for the bill (e.g., "Electric Bill").
- `billAmount`: String/Number - The amount due.
- `currency`: String - Currency code or symbol for localization.
- `dueDate`: String - Formatted timestamp or pre-calculated relative string (e.g., "Tomorrow").
- `paymentStatus`: Enum - E.g., `upcoming`, `due-today`, `paid`, `overdue`, `scheduled`.
- `urgency`: Enum - `critical`, `high`, `medium`, `low`.
- `category`: Enum - Bill category.
- `ctaLabel`: String (Optional) - Button text.
- `isLoading`: Boolean - Toggles skeleton state.
- `isEmpty`: Boolean - Toggles empty state presentation.

## 10. Outputs (Events)
If configured as read-only, document that interaction events are suppressed.
- `onBillViewed`: Emitted for analytics when rendered on screen.
- `onBillPressed`: Emitted when the card body is tapped.
- `onCtaPressed`: Emitted when the action button is tapped.

## 11. States
- **Default**: Displays full upcoming bill content.
- **Loading**: Preserves dimensions while replacing data with skeletons. **Crucial**: Loading skeletons must preserve card height, amount position, badge location, and CTA area to prevent layout shifts.
- **Empty**: Renders a consistent placeholder state when there are no upcoming bills. Must include:
  - Empty illustration (optional)
  - Supporting text (e.g., "No upcoming bills")
  - Optional CTA (e.g., "Add Bill")
- **Error**: Graceful degradation to an error boundary.
- **Offline**: Stale data marked accordingly.
- **Overdue**: Visual change reflecting missed payment (typically red).

## 12. Variants
- **Standard**: Full visual treatment with description and optional CTA.
- **Compact**: Minimized height, often dropping CTA or supporting icons.
- **Interactive**: Allows pressing to navigate or trigger CTA.
- **Read Only**: Suppresses press interactions.

## 13. Composition Rules
The Upcoming Bills Card must compose approved reusable components. It must NOT duplicate:
- Badge behaviour.
- Typography behaviour.
- Motion rules.
- Accessibility rules.
- Button behaviour.
*Those responsibilities belong to their respective reusable components.*

## 14. Bill Presentation Rules
The component never determines due dates, urgency, payment status, or bill priority. It only presents information supplied by higher layers.

Support:
- Currency localisation.
- Date localisation.
- Semantic bill status.
- Semantic urgency.

### Bill Status Registry
This registry is the canonical reference for UI, QA, and engineering regarding bill statuses.

| Status | Meaning |
|--------|---------|
| `Upcoming` | Due in the future |
| `Due Today` | Due on the current day |
| `Scheduled` | Payment already scheduled |
| `Paid` | Obligation fulfilled |
| `Overdue` | Due date has passed |

### Urgency Mapping
Urgency is supplied by higher layers. The component only changes presentation (e.g., color, iconography). It never changes behaviour.

```text
Critical
  ↓
High
  ↓
Medium
  ↓
Low
```

### Multiple Bills Policy
The parent container decides the quantity of bills displayed. The component itself should not decide this. The component can be configured to show:
- One single bill (e.g., the most urgent).
- Top three bills.
- A summarized count of all upcoming bills.

## 15. Layout Rules
- **Container**: Full-width container.
- **Grouping**: Bill information grouped logically (e.g., Name and Category together).
- **Amount**: Visually prominent.
- **Due Date**: Clearly visible and paired with urgency indicators if applicable.
- **Status Badge**: Consistently positioned (e.g., top trailing edge).
- **CTA**: Aligned consistently (e.g., bottom leading edge).

## 16. Responsive Behaviour
- **Mobile**: Single-column layout.
- **Tablet**: Expanded spacing and padding.
- **Desktop**: Supports dashboard grids.

## 17. Accessibility
- **Semantic Role**: `region` (labeled "Upcoming Bill").
- **Accessible Name**: Card labeled by the bill name.
- **Accessible Description**: Synthesizes the bill name, amount, due date, and status.
- **Reading Order**: Bill Name -> Amount -> Due Date -> Status -> CTA.
- **Due Date Announcements**: Clearly articulates dates (e.g., avoiding ambiguous relative times if not explicitly provided).
- **Dynamic Type**: Text scales smoothly and wraps without clipping.
- **Screen Reader Behaviour**: Reads logical groupings (e.g., Name and Amount together).
- **Keyboard Behaviour**: Fully focusable if interactive; CTA requires standard Tab traversal.

## 18. Internationalization
- **RTL**: Layout mirrors completely.
- **Currency Localisation**: Delegated to formatting services using the `currency` prop.
- **Date Localisation**: "Due Date" respects regional date/time formats.
- **Long Translations**: Truncates safely with ellipses where necessary.
- **Category Localisation**: Category badges display translated strings.

## 19. Security & Privacy
- **Displays Sensitive Data**: YES (Displays bill amounts and merchant names implicitly).
- **Requires Data Masking**: Configurable.
- **Logs Sensitive Values**: NO.
*Note: When masking is enabled, preserve layout stability.*

## 20. Motion
- **Entrance**: Fade-in and slide up.
- **Bill Status Updates**: Color crossfade.
- **Due Date Changes**: Subtle numeric crossfade if updated live.
- **Loading Transition**: Crossfade from skeleton to real data.
*Note: Motion communicates financial state. Never distract.*

## 21. Performance
- **Render Cost**: Low.
- **Memoization Suitability**: High.
- **Partial Updates**: Dismiss or status change animations must not block the main thread.
- **Dashboard Scroll Performance**: Must not drop frames while scrolling.

## 22. Analytics
- **Events**: `upcoming_bill_viewed`, `upcoming_bill_pressed`, `upcoming_bill_cta_pressed`
- **Required Payload Data**: `bill_category`, `bill_status`, `component_id`.
- **Prohibited Payload Data**: Payload must NEVER include bill amount, merchant name, account identifiers, or payment references.

## 23. Error Recovery
- **Missing Bill**: Degrades gracefully.
- **Invalid Due Date**: Degrades to a default format or hides the date string.
- **Offline Data**: Maintains presentation of cached bills.
- **Partial Data**: E.g., CTA missing, but amount renders successfully.

## 24. Known Limitations
- Displays a summary only.
- Does not process payments.
- Does not schedule reminders.
- CTA is optional.

## 25. Anti-Patterns
> [!WARNING]
> **Never:**
> ❌ **Execute payments**: UI components do not handle transactional logic.
> ❌ **Calculate overdue status**: Domain layer must pass in "overdue".
> ❌ **Schedule notifications**: Device services handle this.
> ❌ **Display account credentials**: Account numbers for bills must not be displayed here.
> ❌ **Override design tokens**: Use standard Typography and Colors.
> ❌ **Replace the Bills screen**: This is a dashboard summary only.

## 26. Component Decision Record (CDR)
| Decision | Why | Alternatives Considered | Trade-offs | Approved By |
|----------|-----|-------------------------|------------|-------------|
| Pre-calculated Relative Dates | Keeps timezone, leap-year, and logic out of the presentation layer | Calculating "Due in X days" inside the component | Requires the API or Domain layer to refresh date strings daily | UI Architecture |

## 27. Breaking Change Impact
- **Affected Components**: Dashboard Layout.
- **Affected Screens**: Dashboard, Bills Module.
- **Migration Strategy**: Changes to the card's prop signature require updates to the Dashboard controller.

## 28. Testing
- **Unit Tests**: Emits interaction events correctly.
- **Accessibility Tests**: Verifies region semantics and reading order.
- **Visual Regression**: Baseline captures of unmasked, masked, loading, and RTL states.
- **Localisation Tests**: Validates translations, date presentation, and currency formats.
- **Date Presentation Tests**: Ensures dates render safely without timezones shifting them visually.
- **Motion Validation**: Verifies entrance and status updates.
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
