# Floating Action Button (FAB) Specification

> [!IMPORTANT]
> **Status**: Approved & Frozen
> **Version**: 1.0.0
> **Maturity Level**: L2 Stable

## 1. Component Contract Summary
- **Purpose**: The Floating Action Button represents the application's highest-priority contextual action, providing immediate access to the user's most common primary task (e.g., Add Transaction).
- **Inputs**: Icon, Label (optional), Visibility, Enabled, Context, Size Variant, Position.
- **Outputs**: FAB Pressed, FAB Shown, FAB Hidden.
- **Dependencies**: Surface, Icon, Elevation Tokens, Motion Tokens.

## 2. Metadata
- **Component ID**: `navigation.floating-action-button`
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
The FAB:
- Displays one primary action.
- Maintains consistent placement.
- Provides immediate interaction feedback.
- Supports contextual visibility rules.

The FAB does NOT:
- Execute business logic.
- Manage navigation.
- Display multiple actions.
- Replace menus or navigation bars.
- Display dynamic financial information.

## 5. Component Hierarchy
The Floating Action Button is a reusable Navigation Pattern. It is consumed by Screen Templates and must never depend on business components.

```text
Screen Template
        │
        ▼
FloatingActionButton
        │
        ├── Surface
        ├── Icon
        └── Motion Tokens
```

## 6. Usage Examples
### Correct
```text
Floating Action Button
  ↓
Add Transaction
  ↓
Primary intended action on the Dashboard screen
```

### Incorrect
```text
Floating Action Button
  ↓
Account Settings Menu
  ↓
Violates responsibility by displaying nested menus instead of a single primary action
```

## 7. Dependencies & Dependents
- **Dependencies**: Surface, Icon, Elevation Tokens, Motion Tokens, Color Tokens, Accessibility Tokens. Must NOT depend on Dashboard, Transactions, Budgets, Analytics, or Domain Models.
- **Dependents**: Dashboard, Transactions, Budgets, Accounts, Goals. Future modules may reuse this component.

## 8. Design Tokens
- **Color**: Primary Color for background, contrasting Icon Color.
- **Typography**: Label typography (for Extended variant).
- **Spacing**: Standard internal padding.
- **Elevation**: Highest default elevation to sit above all other content.
- **Motion**: Standard scaling/duration.
- **Icons**: Standard sizing.
- **Radius**: Fully rounded (pill/circle).
- **Shadow**: Drop shadow token.

## 9. Inputs (Props)
- `icon`: String/Asset - The primary visual identifier for the action.
- `label`: String (Optional) - Text label, primarily used for the Extended variant or accessibility.
- `isVisible`: Boolean - Controls visibility state.
- `isEnabled`: Boolean - Controls interactivity.
- `context`: String - Semantic identifier ONLY (e.g., "Dashboard", "Transactions"). It must never determine business behavior internally. That remains the responsibility of the consuming screen.
- `badge`: Number (Optional) - Badge value (Note: No badges unless officially approved).
- `position`: Enum - Layout alignment (e.g., bottom-right, center).
- `sizeVariant`: Enum - Standard, Extended, or Mini.

## 10. Outputs (Events)
- `onFabPressed`: Emitted when the user taps the FAB.
- `onFabShown`: Emitted when the FAB completes its entrance transition.
- `onFabHidden`: Emitted when the FAB completes its exit transition.

## 11. States
- **Default**: Resting state, fully visible and elevated above content.
- **Pressed**: Momentary state during user interaction, typically triggering scale and elevation changes.
- **Focused**: Keyboard navigation state, indicated by a prominent focus ring.
- **Disabled**: Diminished opacity and removed elevation, disallowing interaction.
- **Hidden**: Fully removed from the screen (e.g., during upward scrolling).
- **Loading**: Icon is replaced by a spinner; interactions are blocked.

## 12. Variants
- **Standard FAB**: The default circular button containing only an icon.
- **Extended FAB**: A pill-shaped button containing both an icon and a text label.
  - **Appropriate for**: First-time onboarding, Empty states, Tablet layouts.
  - **Inappropriate for**: Standard Dashboard, Dense financial screens.
- **Mini FAB**: A smaller circular button used for secondary floating actions (e.g., map re-center) or on extremely restricted viewports.

## 13. Layout Rules
- **Intrinsic Size**: Fixed dimensions based on variant.
- **Padding/Margin**: Fixed padding to ensure safe area compliance and Bottom Navigation avoidance.
- **Alignment**: Fixed floating position determined by the parent layout (typically bottom-right on LTR). Must respect platform insets and keyboard avoidance, ensuring it never overlaps critical content.

### Visibility Policy
- **Visible**: Dashboard, Transactions, Budgets
- **Hidden**: Authentication, Full-screen Search, Modal Flows, Settings, Onboarding

## 14. Responsive Behaviour
- **Mobile**: Standard FAB, typically positioned in the bottom trailing corner.
- **Tablet**: Optional larger spacing from the edges.
- **Desktop**: May align with the application shell while preserving hierarchy, or transition into a standard primary button within a side rail.

## 15. Accessibility
- **Role**: `button`.
- **Accessible Name**: Must be explicitly defined if no visible label is present.
- **Accessible Hint**: Briefly describe what the action does (e.g., "Opens the add transaction form").
- **Focus Behaviour**: Must receive focus in a logical DOM order (often placed early or late).
- **Keyboard Interaction**: Enter and Space keys trigger the action.
- **Screen Reader Behaviour**: Announces name and role.
- **Dynamic Type**: Extended variant must scale its label without breaking the pill shape.
- **Minimum Touch Target**: Exceeds the 44x44px minimum touch target requirement natively.

## 16. Internationalization
- **RTL behaviour**: Automatically mirrors position to the bottom-left corner.
- **Label localisation**: Required for the Extended variant.
- **Long translations**: Extended FAB labels must be localized and kept extremely brief. Ellipses truncation must apply if limits are exceeded.
- **Icon directionality**: Directional icons (e.g., arrows) must flip for RTL.

## 17. Security & Privacy
- **Displays Sensitive Data**: NO
- **Requires Data Masking**: NO
- **Logs Sensitive Values**: NO

## 18. Motion
- **Entrance**: Scales up from 0 to 1 with an overshoot easing (`duration-base`).
- **Exit**: Scales down from 1 to 0 (`duration-fast`).
- **Press feedback**: Scales down slightly (`0.95`) and increases elevation shadow.
- **Elevation changes**: Crossfades shadow tokens upon press/release.
- **Visibility transitions**: Hides smoothly on downward scroll; reappears on upward scroll.
*Note: Motion must communicate hierarchy. No decorative animation.*

## 19. Performance
- **Render Cost**: Low.
- **Memoization suitability**: Highly suitable; should rarely re-render unless inputs change.
- **Visibility updates**: Must be highly optimized to avoid full page re-renders.
- **Scroll behaviour**: Must respond smoothly to parent scroll events at 60fps/120fps.
- **Performance expectations**: Interaction must feel instantaneous with zero frame drops.

## 20. Analytics
- **Events**: `fab_pressed`, `fab_shown`, `fab_hidden`
- **Required Payload Data**: `context`, `variant`. 
- **Prohibited Payload Data**: Must never include financial values, Account IDs, Transaction IDs, Merchant names, or User-entered text. Only semantic identifiers should be logged.

## 21. Error Recovery
- **Disabled behaviour**: Action blocked, appearance dimmed.
- **Offline behaviour**: Remains enabled if the action (e.g., queuing a transaction offline) is supported.
- **Missing action handling**: Graceful degradation to Disabled state.

## 22. Known Limitations
- One primary action only.
- No nested menus (cannot function as a speed dial without extending the component contract).
- No badges unless officially approved.
- Never hosts secondary actions.

## 23. Anti-Patterns
> [!WARNING]
> **Never:**
> ❌ **Place multiple FABs on one screen**: Violates the "single primary action" rule and creates cognitive overload.
> ❌ **Replace Bottom Navigation**: The FAB is for actions, not navigation switching.
> ❌ **Hide primary navigation**: The FAB should sit above navigation, not replace it.
> ❌ **Use for destructive actions**: A FAB should be a positive or constructive action (e.g., Create, Add), never "Delete" or "Archive".
> ❌ **Place over important content**: Must employ scroll padding or dynamic hiding so users can read underlying text.
> ❌ **Hardcode colors or override elevation**: Breaks theme and depth consistency.

## 24. Component Decision Record (CDR)
| Decision | Why | Alternatives Considered | Trade-offs | Approved By |
|----------|-----|-------------------------|------------|-------------|
| Pure UI Component | Keeps the FAB reusable across modules | Hardcoding the 'Add Transaction' logic | Requires parent screens to wire up the navigation | UI Architecture |

## 25. Breaking Change Impact
- **Affected Components**: Root Screen Layouts.
- **Affected Screens**: Dashboard, Transactions, Budgets.
- **Migration Strategy**: Standard prop signature updates via global refactoring tools.

## 26. Testing
- **Unit Tests**: Emits `onFabPressed` correctly.
- **Accessibility Tests**: Passes contrast checks; has accessible name.
- **Visual Regression**: Baseline captures of all variants (Standard, Extended, Mini).
- **Interaction Tests**: State changes (Hover, Focus, Press).
- **Motion Validation**: Verifies entrance/exit triggers without dropping frames.
- **Performance Validation**: Hiding/showing on scroll does not cause layout thrashing.
*Expected Success Criteria: All tests pass, 100% coverage on interaction handlers.*

## 27. Version History
| Version | Date | Author | Description of Changes |
|---------|------|--------|------------------------|
| 1.0.0 | 2026-08-03 | UI Architecture | Initial Specification |

## 28. Review Checklist
- [x] Responsibility verified
- [x] Dependencies verified
- [x] Accessibility verified
- [x] Motion verified
- [x] Analytics verified
- [x] Performance verified
- [x] Anti-patterns documented
- [x] Testing complete
