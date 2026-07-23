# Dashboard: Phase 1.5 Presentation Architecture

**Status**: Approved (Frozen)
**Phase**: 1.5

---

## 1. Objectives

This document defines the presentation-layer architecture for the Finance Tracker Dashboard. It specifies how the visual interface is composed, rendered, and updated based on the contracts established in the approved Design Package (Stages 0.1–0.7), Requirements (Phase 1.1), Domain Architecture (Phase 1.2), Application Architecture (Phase 1.3), and Infrastructure Architecture (Phase 1.4).

The presentation layer is strictly responsible for user interaction and UI rendering. It contains zero business logic, performs no domain calculations, and consumes data exclusively in the form of Application-Layer View Models (`DashboardViewModel`, `SectionViewModel`, etc.).

---

## 2. Presentation Layer Overview

The Presentation Layer represents the top tier of the application architecture. It mediates between the human user and the Application Layer.

```
[ User Interaction ]
        ↓ (gestures, taps, keypresses)
[ Presentation Layer ]  ← This document
        ↓ (dispatches Commands & Queries / consumes View Models)
[ Application Layer ]
        ↓
[ Domain Layer ] & [ Infrastructure Layer ]
```

### Core Responsibilities
- Rendering UI components according to the Stage 0.4 Design System and Stage 0.5 Component Library.
- Binding visual elements to Application-Layer View Models.
- Capturing user inputs and mapping them to Application Commands or Queries.
- Managing local presentation state (e.g., scroll position, active tab index, modal visibility).
- Executing visual transitions and motion according to Stage 0.6 Interaction Design.
- Enforcing accessible visual states, focus loops, and screen reader announcements.

---

## 3. Presentation Responsibilities

### Included
- **Screen & View Composition**: Structuring page layout zones and section containment.
- **View Model Mapping to UI**: Binding formatted string values and status flags to visual components.
- **Component Rendering & Re-rendering**: Efficiently updating DOM/widget elements when View Model updates arrive.
- **Interaction Capturing**: Routing user clicks, taps, keypresses, and touch gestures to application command handlers.
- **UI State Transitions**: Managing visual representation during Loading, Loaded, Empty, and Error states.
- **Responsive Layout Adaptation**: Adjusting column counts, spacing, and element ordering based on viewport breakpoints.
- **Accessibility & Focus Rendering**: Managing visual focus rings, aria-attributes, and screen reader announcements.

### Excluded
- Business rule evaluations (e.g., determining if spend exceeds a budget limit).
- Raw data formatting or currency calculations (pre-formatted by Application DTOs/View Models).
- Direct data access or API communication.
- Direct event publishing to external domains.

---

## 4. Screen Composition

The Dashboard screen composition follows the layout zones specified in Stage 0.3 (Wireframes) and Stage 0.7 (Dashboard Specification).

```
+-------------------------------------------------------------+
| Header Zone                                                 |
|  - Page Header                                              |
|  - Period Selector                                          |
+-------------------------------------------------------------+
| Hero Zone                                                   |
|  - Total Balance & Period Summary KPI Cards                 |
|  - Quick Actions Toolbar                                    |
+-------------------------------------------------------------+
| Insights Zone                                               |
|  - Budget Health Card                                       |
|  - Category Breakdown Card                                  |
+-------------------------------------------------------------+
| Activity Zone                                               |
|  - Recent Activity Feed                                     |
+-------------------------------------------------------------+
```

### Composition Rules
- **Containment**: Every data section resides inside a `Section Card` wrapper. Section Cards may not be nested within other Section Cards (violates Stage 0.5 rules).
- **Zonal Order**: The vertical ordering (Header -> Hero -> Insights -> Activity) is fixed and must not reorder dynamically.
- **Section Independence**: Each Section Container renders independently based on its respective `SectionViewModel.LoadStatus`.

---

## 5. Component Hierarchy

The visual tree maps directly to the Component Inventory established in Stage 0.5.

```
DashboardScreen
├── PageHeaderContainer
│   ├── PageHeader
│   └── PeriodSelector (interactive control)
├── HeroZoneContainer
│   ├── KPICardContainer (Grid/Flex)
│   │   ├── KPICard [Total Balance]
│   │   ├── KPICard [Period Income]
│   │   └── KPICard [Period Expense]
│   └── QuickActionToolbar
│       └── QuickActionCard [Add Transaction]
├── InsightsZoneContainer
│   ├── BudgetHealthCardContainer
│   │   └── BudgetHealthCard (Progress bar, Status badge)
│   └── CategoryBreakdownCardContainer
│       └── CategoryBreakdownCard (Ranked spend list)
└── ActivityZoneContainer
    └── RecentActivityContainer
        └── ActivityRowList (Item feed)
```

---

## 6. State Management Strategy (Conceptual)

The Presentation Layer manages two distinct categories of state:

### 6.1 View State (Sourced from Application Layer)
- Driven entirely by incoming `DashboardViewModel` updates.
- Read-only within the presentation layer.
- Controls section content, metric labels, trend indicators, and high-level section status (`Loading`, `Loaded`, `Empty`, `Error`).

### 6.2 Local UI State (Owned by Presentation Layer)
- Ephemeral visual state that does not belong in the application or domain layers.
- Examples:
  - Active dropdown open/closed state (e.g., Period Selector).
  - Quick Action Modal / Bottom Sheet visibility.
  - Active focused element index for keyboard navigation.
  - Scroll offset position.

---

## 7. User Interaction Flow

Visual feedback and interaction mechanics strictly follow the Stage 0.6 Interaction Priority Matrix.

```
User Action (Tap/Click/Key)
   ↓
Local UI Feedback (Active/Pressed visual state - immediate <50ms)
   ↓
Dispatch Command / Query to Application Layer
   ↓
Application Layer processes & emits updated View Model / Result
   ↓
UI Re-renders with transition / animation
```

### Flow Examples
1. **Changing Period**: User taps `Period Selector` -> Local UI opens dropdown -> User selects period -> Local UI closes dropdown & sets section View States to `Loading` -> Dispatches `ChangeReportingPeriodCommand` -> Application returns refreshed `DashboardViewModel` -> Presentation renders `Loaded` content.
2. **Section Retry**: User taps "Retry" button on a failed Section Card -> Dispatches `RefreshSectionCommand(SectionType)` -> Section container displays localized inline spinner -> Application returns updated `SectionViewModel` -> Section container re-renders.

---

## 8. Rendering Strategy

### 8.1 View Model Consumption
- Visual components subscribe to or receive immutably passed View Models.
- Components derive their visual tree exclusively from View Model fields.
- Currency symbols, numbers, and dates are rendered directly from the pre-formatted string fields provided in the View Model.

### 8.2 Rendering Lifecycle
1. **Initial Mount**: Screen renders structural layout zones immediately with Skeleton representations.
2. **Data Arrival**: Skeletons transition out via cross-fade as `SectionViewModel` instances transition to `Loaded`.
3. **Partial Updates**: When an individual section updates (e.g., Recent Activity), only that section container re-renders; siblings remain untouched.
4. **Unmount**: Subscriptions and local timers are cleaned up.

---

## 9. Accessibility Strategy

Accessibility rendering complies with WCAG AA guidelines and Stage 0.6 specifications.

### 9.1 Keyboard Navigation & Focus
- Interactive elements (Buttons, Period Selector, Quick Actions, Activity Rows) are in the logical tab order (`Tab` / `Shift+Tab`).
- High-contrast visual focus indicators are rendered around the focused element.
- Modal overlays trap focus while open and restore focus to the triggering element upon dismissal.

### 9.2 Screen Reader Presentation
- **KPI Cards**: Rendered with structural headings and ARIA properties connecting metrics with their labels.
- **Trend Badges**: Include hidden text describing direction and magnitude (e.g., ARIA label: "Increased by 12 percent").
- **Empty & Error States**: Announce status changes politely (`aria-live="polite"`).

---

## 10. Responsive Rendering

The presentation layer adapts component rendering across viewport breakpoints defined in Stage 0.5.

| Breakpoint Zone | Layout Adaptation | Interaction Rules |
|---|---|---|
| **Mobile (<600px)** | Single-column vertical stack. Multi-column KPI cards stack vertically. Touch targets expanded to min 44x44pt. | Hover states disabled. Touch ripples enabled. Tooltips require tap. Bottom sheet overlays preferred. |
| **Tablet (600px–1024px)** | 2-column grid for Insights Zone (Budget Health & Category Breakdown side-by-side). | Touch targets min 44x44pt. Hybrid touch/mouse support. |
| **Desktop (>1024px)** | Full multi-column grid layout. Maximum padding tokens applied. | Full hover state previews enabled. Desktop tooltips on hover. Side modals or floating overlays used. |

---

## 11. Error & Loading Presentation

The Presentation Layer renders distinct visual states corresponding to the four primary section states:

```
[ Section View Model Status ]
         │
         ├── LOADING ──► Render Skeleton Loader matching target component dimensions
         ├── LOADED  ──► Render standard component visual hierarchy
         ├── EMPTY   ──► Render Empty State illustration + Copy + Primary Action Button
         └── ERROR   ──► Render Inline Error Card + Message + Retry Button
```

### Rules
- **Non-Blocking Error Isolation**: An error state in one Section Card renders an inline error inside that card container. The rest of the Dashboard continues to display `Loaded` content.
- **Skeleton Matching**: Skeletons must mirror the exact spatial layout of the expected component to avoid layout shifts (CLS) when data resolves.

---

## 12. Presentation Constraints

- **PC-001**: Zero Business Rules. The presentation layer must never perform mathematical calculations, data filtering, or business logic.
- **PC-002**: Pure View Model Consumption. Components must only consume formatted values from Application View Models.
- **PC-003**: Strict Design Token Adherence. Visual styles must use Design System tokens from Stage 0.4; ad-hoc colors, fonts, or padding values are prohibited.
- **PC-004**: Component Library Compliance. All rendered UI elements must correspond directly to Stage 0.5 Component Library specifications.
- **PC-005**: Framework Independence. Presentation architecture must remain conceptual and not mandate specific UI rendering frameworks or libraries.
- **PC-006**: Touch Target Guarantee. Touch targets on mobile viewports must meet or exceed 44x44 points.

---

## 13. Presentation Event Map

A centralized reference mapping user-initiated UI events and incoming Application updates to their corresponding presentation response and command dispatch:

| UI Trigger / Source | Target / Action | Dispatched Command / Query | UI Response / State Effect |
|---|---|---|---|
| **Screen Mount / Launch** | Dashboard Container | `LoadDashboardCommand` | Render Skeleton Layout |
| **Select Period** | Period Selector Dropdown | `ChangeReportingPeriodCommand` | Close dropdown, set section states to `Loading` |
| **Tap "Retry"** | Failed Section Card | `RefreshSectionCommand` | Display localized inline spinner in Section Card |
| **Tap "Add Transaction"** | Quick Action Card | `ExecuteQuickActionCommand` | Open Quick Add Modal / Bottom Sheet |
| **Tap Category Row** | Category Breakdown Card | Navigate to Category Detail | Trigger drill-down view transition |
| **Tap "View All" Activity** | Recent Activity Card | Navigate to Activity History | Trigger full-page activity view transition |
| **ViewModel Update Arrives** | Component Subscriptions | None (Reactive update) | Re-render affected section containers |

---

## 14. Future Presentation Expansion

- **Theme Switching (Dark / Light Mode)**: Dynamic application of design token sets based on user preference or OS setting.
- **Customizable Dashboard Layout**: Allowing users to drag, drop, or hide optional Dashboard Section Cards.
- **Micro-Animation Enhancement**: Expanding state transition motion profiles for data refreshes and chart load states.
- **Widget Extensions**: Presentation wrappers for rendering condensed Dashboard widgets on mobile home screens or watch OS extensions.

