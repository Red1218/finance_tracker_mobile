# Bottom Navigation Specification

> [!IMPORTANT]
> **Status**: Approved & Frozen
> **Version**: 1.0.0
> **Maturity Level**: L2 Stable

## 1. Component Contract Summary
- **Purpose**: The Bottom Navigation provides persistent navigation between the application's primary destinations, allowing users to switch between top-level modules while preserving context and navigation state.
- **Inputs**: Destinations, Active Destination, Badge Values, Visibility, Enabled State, Navigation Mode.
- **Outputs**: Destination Selected, Destination Reselected, Navigation Shown, Navigation Hidden.
- **Dependencies**: Surface, Navigation Items, Icons, Labels, Badge, Divider, Motion Tokens.

## 2. Metadata
- **Component ID**: `navigation.bottom-navigation`
- **Owner**: UI Architecture
- **Reviewer**: UI Architecture
- **Last Audit Date**: 2026-08-03
- **Category**: Pattern
- **Classification**: Navigation

## 3. Related Documents
- [Design System](../../01-design-system.md)
- [Component System](../../02-component-system.md)
- [Navigation Architecture](../../03-navigation.md)
- [Motion Architecture](../../04-motion.md)
- [Accessibility Architecture](../../05-accessibility.md)

## 4. Responsibility
The Bottom Navigation:
- Displays top-level destinations.
- Indicates the active destination.
- Supports persistent navigation.
- Preserves navigation hierarchy.
- Supports badges on approved destinations.

The Bottom Navigation does NOT:
- Manage routing.
- Display business data.
- Replace contextual actions.
- Execute domain logic.
- Host secondary navigation.

## 5. Component Hierarchy
The Bottom Navigation is a reusable Navigation Pattern. It is consumed by the Main Application Shell and must never depend on business components.

```text
Main Application Shell
        │
        ▼
Bottom Navigation
        │
        ├── Navigation Item
        ├── Icon
        ├── Label
        ├── Badge
        └── Motion Tokens
```

## 6. Usage Examples
### Correct
```text
BottomNavigation
  ↓
Root Screen Container
  ↓
Switching between primary destinations: Home, Transactions, Budgets, Analytics, More.
```

### Incorrect
```text
BottomNavigation
  ↓
Inside a Modal or secondary detail screen
  ↓
Violates architectural hierarchy by hosting secondary navigation at a primary structural level.
```

## 7. Dependencies & Dependents
- **Dependencies**: Surface, Icon, Typography, Badge, Divider, Motion Tokens, Color Tokens, Accessibility Tokens. Must NOT depend on Dashboard, Transactions, Budgets, Analytics, or Domain Models.
- **Dependents**: Used exclusively by the Main Application Shell. Indirectly supports Dashboard, Transactions, Budgets, Analytics, and More.

## 8. Design Tokens
- **Surface**: Background surface color, elevating above content.
- **Active Color**: Primary semantic color for the selected icon and label.
- **Inactive Color**: Neutral secondary color for unselected items.
- **Typography**: Small label typography for destination names.
- **Spacing**: Padding around touch targets and items.
- **Elevation**: Shadow/elevation token.
- **Motion**: Standard durations and easings for active indicator movement.
- **Divider**: Top border divider token (if applicable by theme).
*Note: Never define hardcoded values.*

## 9. Inputs (Props)
- `destinations`: Array - Semantic configurations for each tab (Icon, Label, ID).
- `activeDestinationId`: String - ID of the currently selected destination.
- `badgeValues`: Object - Map of destination IDs to badge configurations (numerical or dot).
- `isVisible`: Boolean - Controls rendering/visibility of the bar.
- `isEnabled`: Boolean - Master toggle for interactivity.
- `navigationMode`: Enum - Controls presentation (e.g., standard, compact).

## 10. Outputs (Events)
- `onDestinationSelected`: Emitted when a new destination is pressed.
- `onDestinationReselected`: Emitted when the currently active destination is pressed again.
- `onNavigationShown`: Emitted after entrance animation completes.
- `onNavigationHidden`: Emitted after exit animation completes.

## 11. States
- **Default**: The standard resting state.
- **Active**: Indicates the currently selected destination with distinct color and/or active indicator.
- **Inactive**: Unselected destinations waiting for interaction.
- **Disabled**: Non-interactive state (rarely used globally at this level).
- **Hidden**: Removed from view per the Visibility Policy.
- **Loading**: Sub-components (like badges) may show skeletons, but the core navigation should render immediately.

### Destination Lifecycle
To ensure implementation and animation consistency, destinations flow through the following state lifecycle:
```text
Hidden
  ↓
Visible
  ↓
Active
  ↓
Inactive
  ↓
Hidden
```

## 12. Variants
- **Standard**: Displays both Icon and Label.
- **Compact**: Displays Icon only, suitable for specific scrolling states or very small viewports.
- **Extended**: Reserved for future platform support (e.g., side rail adaptations on tablets).

## 13. Layout Rules
- **Position**: Fixed bottom position.
- **Padding**: Safe Area aware (respects iOS Home Indicator / Android Nav Bar).
- **Width**: Full width of the viewport.
- **Capacity**: Maximum five primary destinations.
- **Alignment**: Equal item distribution across the available width.
- **Content**: Supports icon and label. Active destination must always be visible.
- **Overlap**: Must never overlap system navigation.

### Visibility Policy
- **Visible**: Dashboard, Transactions, Budgets, Analytics, More.
- **Hidden**: Authentication, Full-screen onboarding, Immersive reader, Full-screen media, Modal workflows.

## 14. Navigation Rules
- **Capacity Constraint**: Exactly five primary destinations.
- **State Preservation**: Must follow rules outlined in `03-navigation.md`.

### Destination Registry
| ID | Label | Module | Badge |
|----|-------|--------|-------|
| `home` | Home | Dashboard | No |
| `transactions` | Transactions | Transactions | Optional |
| `budgets` | Budgets | Budgets | Optional |
| `analytics` | Analytics | Analytics | No |
| `more` | More | More | Optional |

### Badge Policy
Badges must never expose private financial data.
- **Allowed**: Notifications, Pending approvals, Sync status.
- **Not allowed**: Account balances, Budget totals, Currency values.

### Selection Policy
To prevent routing thrashing during rapid user interaction:
- Ignore duplicate taps during a transition.
- Queue only the latest destination change.
- Never stack navigation events.
- **Selecting an already active destination**: Must emit `onDestinationReselected` (typically used to scroll to top). Reset nested navigation *only* when explicitly defined by the Navigation Architecture.

## 15. Responsive Behaviour
- **Mobile**: Standard Bottom Navigation.
- **Tablet**: May coexist with a Navigation Rail.
- **Desktop**: May transition entirely into a Navigation Rail or Sidebar while strictly preserving the destination hierarchy.

## 16. Accessibility
- **Role**: `navigation` landmark role.
- **Accessible Labels**: Every destination must have an accessible label.
- **Accessible Current State**: Active destination marked with `aria-current="page"`.
- **Badge Announcements**: Badges must be announced alongside the label (e.g., "Transactions, 3 unread").
- **Focus Order**: Sequential traversal left-to-right.
- **Keyboard Navigation**: Arrow keys cycle; Enter/Space selects.
- **Screen Reader Behaviour**: Reads role, label, state, and badge context.
- **Dynamic Type**: Text must scale cleanly without overflowing the fixed height container.
- **Minimum Touch Targets**: 44x44 CSS pixels minimum per destination item.

## 17. Internationalization
- **RTL**: Automatic mirroring; item order reverses.
- **Label Localisation**: Labels must be localized.
- **Long Translations**: Must be extremely concise. Truncate with ellipses if limits are exceeded. Never wrap to a second line.
- **Badge Reading Behaviour**: Number/dot positioning adapts to RTL flow.

## 18. Security & Privacy
- **Displays Sensitive Data**: NO
- **Requires Data Masking**: NO
- **Logs Sensitive Values**: NO

## 19. Motion
- **Destination Transitions**: Crossfades or slides to indicate the new active state.
- **Active Indicator Movement**: Smooth spatial movement or scale of the background pill/icon.
- **Badge Updates**: Pop or scale animation on value change.
- **Visibility Transitions**: Smooth slide down/up for hiding/showing.
*Note: Motion must reinforce orientation and never distract.*

## 20. Performance
- **Render Cost**: Low.
- **Memoization Suitability**: High. Should avoid re-rendering unrelated items when one item's badge or state changes.
- **Independent Destination Updates**: Items must update in isolation.
- **Badge Update Optimisation**: Must not trigger a full component re-render.
- **Smooth Interaction**: Guaranteed 60fps/120fps during all transitions and taps.

## 21. Analytics
- **Events**: `navigation_destination_selected`, `navigation_destination_reselected`, `navigation_shown`, `navigation_hidden`
- **Required Payload Data**: `destination_id`, `previous_destination`.
- **Prohibited Payload Data**: Must never include business data or financial values.

## 22. Error Recovery
- **Missing Destination**: Fails safely; logs error, attempts to render remaining valid destinations.
- **Disabled Destination**: Blocks interaction; visually dimmed.
- **Navigation Unavailable**: Remains visible but disabled (e.g., during catastrophic app failure).
- **Offline Behaviour**: Remains fully functional.

## 23. Known Limitations
- Maximum five destinations.
- No nested menus natively supported within the bar itself.
- No horizontal scrolling.
- Labels must remain concise.
- No custom destination ordering by the user.

## 24. Anti-Patterns
> [!WARNING]
> **Never:**
> ❌ **Add more than five destinations**: Creates touch target overlap and cognitive overload.
> ❌ **Replace with tabs inside modules**: Bottom Navigation is for top-level switching; use Segmented Controls or Tabs for internal views.
> ❌ **Hide labels**: Relying on icons alone damages accessibility and usability.
> ❌ **Mix unrelated navigation models**: Keep interactions consistent with `03-navigation.md`.
> ❌ **Display financial data**: Do not embed balances inside badges or labels.
> ❌ **Hardcode colors or override spacing**: Destroys theme integrity.

## 25. Component Decision Record (CDR)
| Decision | Why | Alternatives Considered | Trade-offs | Approved By |
|----------|-----|-------------------------|------------|-------------|
| Pure UI Presentation | Ensures separation of concerns | Passing Router directly | Requires Main Shell to intercept events and push routes | UI Architecture |

## 26. Breaking Change Impact
- **Affected Components**: Main Application Shell.
- **Affected Screens**: All top-level destinations.
- **Migration Strategy**: Requires coordinating signature updates in the Root Shell and adjusting any badge subscriptions.

## 27. Testing
- **Unit Tests**: Emits `onDestinationSelected` and `onDestinationReselected` correctly.
- **Accessibility Tests**: Passes contrast checks; verifies `aria-current`.
- **Visual Regression**: Baseline captures of all states (Default, Active, Badged, RTL).
- **Navigation Behaviour Tests**: Ensures correct payloads are dispatched.
- **Motion Validation**: Verifies active indicator transitions.
- **Performance Validation**: Ensures badge updates do not thrash layout.
*Expected Success Criteria: 100% pass rate, zero accessibility violations.*

## 28. Version History
| Version | Date | Author | Description of Changes |
|---------|------|--------|------------------------|
| 1.0.0 | 2026-08-03 | UI Architecture | Initial Specification |

## 29. Review Checklist
- [x] Responsibility verified
- [x] Navigation rules verified
- [x] Dependencies verified
- [x] Accessibility verified
- [x] Motion verified
- [x] Analytics verified
- [x] Performance verified
- [x] Anti-patterns documented
- [x] Testing complete
