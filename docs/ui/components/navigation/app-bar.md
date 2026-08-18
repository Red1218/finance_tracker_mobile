# AppBar Specification

> [!IMPORTANT]
> **Status**: Approved & Frozen
> **Version**: 1.0.0
> **Maturity Level**: L2 Stable

## 1. Component Contract Summary
- **Purpose**: Provide persistent screen identity and contextual actions.
- **Inputs**: Title, Subtitle, Navigation Mode, Leading Action, Trailing Actions, Badge Count, Search Mode, Scroll State.
- **Outputs**: Navigation Pressed, Search Pressed, Action Pressed, Back Pressed.
- **Dependencies**: Surface, Typography, Icon, Badge, Divider.

## 2. Metadata
- **Component ID**: `navigation.app-bar`
- **Owner**: UI Architecture
- **Reviewer**: UI Architecture
- **Last Audit Date**: 2026-08-03
- **Category**: Pattern

## 3. Related Documents
- [Design System](../../01-design-system.md)
- [Component System](../../02-component-system.md)
- [Navigation Architecture](../../03-navigation.md)
- [Motion Architecture](../../04-motion.md)
- [Accessibility Architecture](../../05-accessibility.md)

## 4. Responsibility
The App Bar provides persistent screen identity and contextual actions.

The App Bar:
- Displays screen identity.
- Hosts navigation affordances.
- Hosts contextual actions.
- Adapts to navigation state.

The App Bar does NOT:
- Render business data.
- Contain page content.
- Manage routing.
- Store application state.

## 5. Component Hierarchy
The AppBar acts as a primary navigational pattern. It wraps smaller primitive components (Icons, Text, Badges) and is typically consumed directly by Screen Templates. It sits above the main content area in the z-index hierarchy.

## 6. Usage Examples
### Correct
```text
AppBar
  ↓
Screen Identity & Global Actions
  ↓
Consistent placement at the top of a primary screen
```

### Incorrect
```text
AppBar
  ↓
Rendering specific business forms
  ↓
Violates responsibility by managing domain logic instead of screen identity
```

## 7. Dependencies & Dependents
- **Dependencies**: Surface, Typography, Icon, Badge, Divider, Design Tokens. Must NOT depend on Dashboard, Budget Card, Transaction Row, Analytics, or Domain Models.
- **Dependents**: Dashboard, Transactions, Budgets, Analytics, Accounts, Goals, Bills, Settings, Profile, Notifications.

## 8. Design Tokens
- **Color**: Uses semantic surface colors for background, contrasting colors for text/icons.
- **Typography**: Uses header typography for title, standard typography for subtitle.
- **Spacing**: Follows global horizontal padding tokens; fixed internal vertical spacing.
- **Elevation**: Elevated state uses shadow/elevation tokens.
- **Motion**: Uses standard easing and base duration for scroll transitions.
- **Icons**: Uses standard action icon sizes.

## 9. Inputs (Props)
- `title`: String - The primary identity of the screen.
- `subtitle`: String (Optional) - Secondary context (e.g., specific account name).
- `navigationMode`: Enum - Defines leading icon behavior (e.g., Back, Menu, None).
- `leadingAction`: Object - Configuration for the leading icon/action.
- `trailingActions`: Array - Configuration for contextual actions (max 3).
- `badgeCount`: Number (Optional) - Used on specific trailing actions like notifications.
- `searchMode`: Boolean - Toggles the search input variant.
- `scrollState`: Enum - Defines elevation/transparency based on scroll position.

## 10. Outputs (Events)
- `onNavigationPressed`: Emitted when the leading navigation icon is activated.
- `onSearchPressed`: Emitted when the search action is triggered.
- `onActionPressed`: Emitted when a trailing contextual action is activated, passing the action ID.
- `onBackPressed`: Explicit event for back navigation (often maps to navigation pressed).

## 11. States
- **Default**: Resting state at the top of the screen.
- **Elevated**: Active when content scrolls beneath the App Bar.
- **Transparent**: Active when overlaying rich imagery (hero headers).
- **Search Active**: Expanded state when search mode is enabled.
- **Disabled**: Non-interactive (rarely used globally, but actions can be disabled).
- **Loading**: Displays a subtle progress indicator beneath or replaces actions with skeletons.

## 12. Variants
- **Standard**: Default height and typography.
- **Large**: Expanded height with prominent typography (shrinks to standard on scroll).
- **Search**: Replaces title and standard actions with a full-width search input.
- **Contextual**: Appears when items are selected (e.g., multi-select edit mode).

## 13. Layout Rules
- **Intrinsic Size**: Fixed height according to Design System; Large variant adjusts on scroll.
- **Padding/Margin**: Full width. Safe Area aware (respects device notches/status bars). Horizontal padding uses spacing tokens.
- **Alignment**: Supports one leading action. Supports multiple trailing actions (max 3 recommended). Title remains visually centered when appropriate, or start-aligned depending on platform conventions.

## 14. Responsive Behaviour
- **Mobile**: Top App Bar configuration.
- **Tablet**: More horizontal spacing and optional expanded title width.
- **Desktop**: Supports larger action groups and integrates with side navigation architectures.

## 15. Accessibility
- **Roles**: Uses `banner` or equivalent landmark role.
- **State Attributes**: Appropriately tags expanded search (`aria-expanded`) and disabled actions (`aria-disabled`).
- **Focus Management**: Follows logical focus order (Leading Action -> Title/Search -> Trailing Actions).
- **Keyboard Navigation**: Fully traversable via Tab; Enter/Space activates actions.
- **Dynamic Type**: Text scales cleanly; long titles truncate safely without breaking height constraints.
- **Screen Reader**: Accessible names required for all icon-only buttons. Screen readers announce the title upon navigation context changes.

## 16. Internationalization
- **RTL**: Layout mirrors completely. Leading actions become trailing physically, title alignment flips.
- **Currency/Dates**: Standard formatting for any financial subtitles.
- **Long Text**: Titles strictly truncate with ellipses; they do not wrap to multiple lines.

## 17. Security & Privacy
- **Displays Sensitive Data**: NO (Generally, titles are safe. Avoid putting specific sensitive balances in the App Bar).
- **Requires Data Masking**: NO
- **Logs Sensitive Values**: NO

## 18. Motion
- **Entrance**: Standard global entrance motion.
- **Elevation on Scroll**: Smooth crossfade of shadow/elevation tokens (`duration-base`, `ease-standard`) as content scrolls under.
- **Search Expansion**: Smooth lateral expansion (`duration-base`, `ease-standard`).
- **Context Changes**: No decorative animation. Use clean fades or slides when swapping variants (e.g., Default to Contextual).

## 19. Performance
- **Render Cost**: Low
- **Constraints**: Must avoid unnecessary re-renders. Must update independently of page content (e.g., scroll-linked elevation must not trigger a full page re-render). Supports memoization. Supports smooth 60fps/120fps scrolling.

## 20. Analytics
- **Events**: `app_bar_action_pressed`, `app_bar_back_pressed`, `app_bar_search_opened`
- **Required Payload Data**: `action_id`, `screen_name`. Never expose business data in payloads.

## 21. Error Recovery
- **Retry**: N/A
- **Fallback**: N/A
- **Offline**: Remains fully visible and functional; contextual actions requiring network may enter a disabled state.

## 22. Known Limitations
- Displays maximum of one leading action.
- Displays maximum of two lines of text (Title + Subtitle).
- Recommended maximum of three trailing actions to prevent crowding.

## 23. Anti-Patterns
> [!WARNING]
> **Never:**
> ❌ Put business widgets inside the App Bar.
> ❌ Place more than one navigation action on the leading side.
> ❌ Display more than two lines of title text.
> ❌ Hardcode colors or override spacing tokens.

## 24. Component Decision Record (CDR)
| Decision | Why | Alternatives Considered | Trade-offs | Approved By |
|----------|-----|-------------------------|------------|-------------|
| Decouple from Routing Logic | Ensures App Bar is reusable across all modules | Injecting Router directly | Requires screens to manually pass down navigation callbacks | UI Architecture |

## 25. Breaking Change Impact
- **Affected Components**: None (Pattern component consumed by screens)
- **Affected Screens**: Dashboard, Transactions, Budgets, Analytics, Accounts, Settings, Profile
- **Migration Required**: Updating prop signatures globally across all consuming screens.

## 26. Testing
- **Unit**: Verify event emissions (`onActionPressed`, `onBackPressed`).
- **Visual**: Regression snapshots of all variants (Standard, Large, Search, Contextual).
- **Accessibility**: Verify landmark roles and contrast ratios.
- **Interaction Tests**: Validate search expansion and scroll elevation logic.
- **Performance Validation**: Ensure scroll events do not cause layout thrashing.

## 27. Version History
| Version | Date | Author | Description of Changes |
|---------|------|--------|------------------------|
| 1.0.0 | 2026-08-03 | UI Architecture | Initial Specification |

## 28. Review Checklist
- [x] Responsibility defined
- [x] Dependencies mapped
- [x] Accessibility validated
- [x] Motion tokens applied
- [x] Analytics payloads confirmed
- [x] Performance constraints met
- [x] Testing criteria established
- [x] Anti-patterns documented
