# Finance Tracker — List System Architecture

> [!IMPORTANT]
> **Status**: Approved & Frozen
> **Version**: 1.0.0
> **Description**: The Single Source of Truth for all list patterns within the Finance Tracker application.

## 1. Introduction
Lists are one of the primary interaction patterns in Finance Tracker. Given the volume of financial data—transactions, bills, accounts, goals, and investments—users rely heavily on lists to scan, digest, and manage their financial lives. This document defines the architectural rules governing every list to ensure consistency, accessibility, and performance across the entire ecosystem. No list component may contradict this document.

## 2. List Philosophy
Lists must communicate information efficiently and adhere to the following principles:
- **Scanability**: Users must be able to parse rows instantly without reading every word.
- **Predictability**: Structural consistency ensures users know where to look for values, dates, and actions.
- **Density**: Whitespace and typography must adapt to the context of the data.
- **Readability**: Content hierarchy must guide the eye naturally from primary identifier to financial value.
- **Performance**: Lists must never drop frames, even when rendering thousands of transactions.
- **Accessibility**: Semantic structure and touch targets must support all users, regardless of ability.

## 3. List Architecture
Lists follow a strict composition hierarchy. Higher layers orchestrate layout, while lower layers handle presentation.

```text
Application
  ↓
Section
  ↓
List (Container)
  ↓
Section Header
  ↓
List Item
  ↓
Divider
  ↓
Swipe Actions
  ↓
Footer
```

- **Application/Section**: Owns domain data and layout positioning.
- **List Container**: Owns virtualization, scrolling, and orchestration.
- **List Item/Header/Divider/Footer**: Owns presentation, semantics, and accessibility.

## 4. List Types
- **Standard List**: A continuous vertical list of uniform items. Used for simple selections or short lists.
- **Grouped List**: Items grouped within inset cards. Used for settings or distinct categorical groups.
- **Sectioned List**: A continuous list divided by sticky section headers. Used for transactions grouped by date.
- **Virtualized List**: A list that only renders items currently visible on screen. Mandatory for any list exceeding 50 items.
- **Infinite List**: A virtualized list that paginates data automatically as the user scrolls. Used for transaction history.
- **Selection List**: A list optimized for choosing one or more items. Used for category or account selection.

*Appropriate usage must be observed. Never use a standard list for thousands of items without virtualization.*

## 5. List Anatomy
- **Container**: The scrolling region bounds. Responsible for virtualization.
- **Section Header**: Grouping title (e.g., "August 2026").
- **Item**: The interactive row containing data.
- **Leading Content**: Typically an icon, avatar, or selection indicator.
- **Primary Text**: The main identifier (e.g., Merchant Name).
- **Secondary Text**: Supporting context (e.g., Category).
- **Metadata**: Tertiary data, often right-aligned (e.g., Timestamp).
- **Trailing Content**: Values (e.g., -$45.00) or interactive elements (e.g., Chevron).
- **Divider**: Visual separator between items.
- **Footer**: End-of-list indicator or pagination loader.

## 6. Density Rules
- **Comfortable**: Generous padding (e.g., 16px). Used for dashboard summaries, insight lists, and standard navigation.
- **Compact**: Reduced padding (e.g., 12px). Used for dense transaction histories or deep data views.
- **Dense**: Minimal padding (e.g., 8px). Reserved for complex financial data tables or desktop views.
*Specify where each density is permitted. Do not mix densities within the same list.*

## 7. Item Hierarchy
Visual priority must guide the user's eye from the most to least important information:
```text
Primary (Merchant Name, Bill Name)
  ↓
Trailing Action/Value (Transaction Amount, Due Date)
  ↓
Secondary (Category, Account Name)
  ↓
Metadata (Time, Status)
```

## 8. Section Headers
- **Purpose**: Groups related items logically.
- **Sticky Behaviour**: Section headers should stick to the top of the viewport during scrolling to maintain context.
- **Grouping**: Must represent a single semantic grouping (e.g., Date, Alphabetical).
- **Spacing**: Requires larger top margin than bottom margin to associate with the content below.
- **Accessibility**: Must act as a semantic boundary, allowing screen readers to jump between sections.

## 9. Dividers
- **Inset**: Aligns with the primary text, leaving leading content undivided. Used in continuous standard lists.
- **Full Width**: Spans edge-to-edge. Used to separate distinct sections or list boundaries.
- **Grouped**: No dividers between items; relying on spacing or alternating backgrounds. Used in inset grouped lists.
*When each should be used is dictated by the List Type.*

## 10. Selection
- **Single Select**: Only one item can be active. Requires a radio button or checkmark indicator.
- **Multi Select**: Multiple items can be active. Requires checkboxes.
- **Selection Indicators**: Must be positioned in the leading content area.
*Never mix single and multi-select behaviours within the same list.*

## 11. Swipe Actions
- **Leading Actions**: Swiping right reveals actions (e.g., Mark as Read, Pin).
- **Trailing Actions**: Swiping left reveals destructive or secondary actions (e.g., Delete, Archive).
- **Allowed Gestures**: Must not conflict with horizontal carousel scrolling or drawer navigation.
- **Confirmation Behaviour**: Destructive actions must require a second tap or a full-width continuous swipe to confirm.
- **Accessibility Alternatives**: Swipe actions must be accessible via a standard context menu or "Edit" mode.

## 12. Empty States
An empty list must never display a blank screen. It must render:
- **Illustration**: Optional branded empty state imagery.
- **Headline**: Clear explanation (e.g., "No transactions found").
- **Supporting Text**: Context or instructions (e.g., "Try adjusting your search filters").
- **Primary Action**: CTA to resolve the empty state (e.g., "Clear Filters").
- **Secondary Action**: Optional fallback action.

## 13. Loading States
- **Skeleton Lists**: Render placeholder geometry matching the exact layout of the list items.
- **Placeholder Rows**: Render a fixed number of skeletons to fill the viewport.
- **Progressive Loading**: Skeleton items at the bottom of the list during infinite scrolling.
*Crucial: Loading states must perfectly match the final geometry to ensure absolutely no layout shifts.*

## 14. Error States
- **Offline**: Show cached data if available, with a non-intrusive offline indicator.
- **Network Error**: Show an inline error boundary inside the list container if initial load fails.
- **Partial Data**: If pagination fails, show a retry button in the list footer, leaving existing items intact.
- **Retry**: Provide a clear, actionable button to re-fetch data.

## 15. Motion
*Reference [Motion Architecture](04-motion.md).*
- **Insertion**: Slide in and fade.
- **Removal**: Collapse height and fade out smoothly.
- **Reordering**: Smooth spring translation to new position.
- **Swipe**: 1:1 finger tracking with resistance physics at boundaries.
- **Expansion**: Smooth accordion expansion of item content.
- **Selection**: Scale or color transition on the selection indicator.

## 16. Accessibility
- **Semantic Roles**: Container must use `list` or `grid`; items must use `listitem` or `row`.
- **Reading Order**: Leading -> Primary -> Secondary -> Trailing.
- **Focus Order**: Sequential traversal down the list.
- **Keyboard Navigation**: Up/Down arrows to traverse items; Space/Enter to activate.
- **Screen Reader Behaviour**: Must announce list boundaries and item counts (e.g., "Item 1 of 50").
- **Touch Targets**: Minimum 44x44pt for all interactive elements and rows.
- **Dynamic Type**: Text must scale without clipping or breaking the layout structure.

## 17. Performance
- **Virtualization**: Mandatory for lists > 50 items.
- **Memoization**: List items must be memoized to prevent re-renders when unrelated state changes.
- **Windowing**: Render only the visible viewport plus a small overscan buffer.
- **Lazy Loading**: Defer image or heavy calculation rendering until the item enters the overscan buffer.
- **Frame Budget**: Scrolling must maintain a strict 60fps (16.6ms per frame).
- **Large Lists**: Use stable keys and optimize layout calculation to prevent UI thread blocking.

## 18. Responsive Behaviour
- **Mobile**: Single-column edge-to-edge list.
- **Tablet**: Expanded horizontal padding, inset grouped lists become standard.
- **Desktop**: Grid layouts or multi-column data tables for dense information viewing.

## 19. Security & Privacy
Lists must never expose:
- **Hidden values**: Do not render sensitive account numbers in the DOM/Tree if they are visually hidden.
- **Sensitive identifiers**: Internal UUIDs or tokens must never be used as visible labels.
- **Masked information**: When privacy mode is active, values must be replaced by stable placeholder geometry.
- **Analytics restrictions**: Never log financial values, merchant names, or user queries tied to list items.

## 20. Advanced List Behaviours
- **Sorting & Filtering Policy**: List components never determine sort order or filter data internally. They strictly render the ordered, filtered data provided by higher layer controllers.
- **Scroll Position Policy**: Scroll positions must be restored when navigating back to a list from a detail screen (e.g., viewing a transaction and pressing back). When re-entering a list from a root navigation action (e.g., tapping the bottom nav tab), the scroll position resets to the top.
- **Pagination Ownership**: Pagination orchestration (triggering fetches, managing cursors) belongs strictly to the parent/container, not to the `ListItem` or other presentation components.
- **Drag & Drop Rules**: When list reordering is supported, the interaction model must rely on an explicit "Edit" mode with grabber handles to prevent conflicting with horizontal swipe actions or vertical scrolling.

## 21. Anti-Patterns
> [!WARNING]
> **Never:**
> ❌ **Mix densities**: A single list must maintain consistent spacing.
> ❌ **Mix interaction models**: Do not combine single-tap navigation with complex inline editing in the same list.
> ❌ **Animate every row**: Staggering animations for hundreds of items blocks the main thread.
> ❌ **Use inconsistent spacing**: Adhere strictly to the defined Design Tokens.
> ❌ **Calculate business logic**: List items are presentation-only; domain logic belongs higher up.
> ❌ **Duplicate item layouts**: Compose reusable `ListItem` components instead of rewriting flexbox rules.
> ❌ **Override design tokens**: Do not hardcode colors, padding, or fonts.

## 22. Testing Standards
- **Unit**: Verify virtualization and pagination logic.
- **Accessibility**: Verify screen reader traversal, ARIA roles, and keyboard navigation.
- **Visual Regression**: Baseline captures of various densities, empty states, and loading states.
- **Performance**: Automated scroll tests to ensure 0 dropped frames.
- **Interaction**: Verify swipe actions, selection mechanics, and tap boundaries.
- **Motion**: Verify insertion/deletion transitions.
- **Localization**: Ensure long text truncates or wraps gracefully in RTL and verbose languages.

## 23. Version History
| Version | Date | Author | Description of Changes |
|---------|------|--------|------------------------|
| 1.0.0 | 2026-08-04 | UI Architecture | Initial Specification |

## 24. Review Checklist
- [x] List Philosophy defined
- [x] Architecture hierarchy defined
- [x] Accessibility and Motion standards integrated
- [x] Performance and Virtualization mandated
- [x] Anti-patterns documented
- [x] Testing standards established
