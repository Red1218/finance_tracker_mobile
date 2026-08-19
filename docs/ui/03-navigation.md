# Finance Tracker — Navigation Architecture

> [!IMPORTANT]
> **Status**: Approved & Frozen 🔒
> **Version**: 2.1.0 (Phase 2 Shell Navigation & Stitch Integration)
> 
> In accordance with the UI Governance Constitution (`00-ui-governance.md`), this document is the **Single Source of Truth** for the application's navigation architecture.

## 1. Introduction
The Finance Tracker Navigation Architecture defines the pathways and logic by which users move through the application. Navigation acts as the connective tissue bridging the Component System and the end-user experience. This document explicitly governs routing logic, modal presentation, state preservation, deep linking, and cross-module transitions.

## 2. Approved Primary Bottom Navigation (5 Destinations)
The primary bottom navigation bar is managed by Expo Router (`app/(tabs)/_layout.tsx`) utilizing the frozen presentation-only `BottomNavigation` primitive:

| Tab ID | Tab Label | Icon Name | Expo Route Name | Target Route Path | Target Screen / Module |
|---|---|---|---|---|---|
| `home` | Home | `Home` | `index` | `/` | Dashboard (`DashboardModule`) |
| `transactions` | Transactions | `Receipt` | `spends` | `/spends` | Transactions (`TransactionsScreen`) |
| `budgets` | Budgets | `Target` | `budgets` | `/budgets` | Budgets (`BudgetsScreen`) |
| `analytics` | Analytics | `BarChart2` | `insights` | `/insights` | Analytics (`InsightsScreen`) |
| `more` | More | `Menu` | `more` | `/more` | More Navigation Hub (`MoreNavigationRoute`) |

## 3. Secondary & Deep Route Architecture
Secondary features remain registered in Expo Router and fully accessible via deep URLs and secondary links from the `More` hub (`app/(tabs)/more.tsx`):

| Route Path | Expo Route Name | Feature Screen | Access Pathway |
|---|---|---|---|
| `/accounts` | `accounts` | `AccountsScreen` | **More -> Accounts** & Dashboard Balance Card |
| `/categories` | `categories` | `CategoriesScreen` | **More -> Categories** & Budget Configuration |
| `/finances` | `finances` | `ReportingScreen` | **More -> Finances** & Net Worth Summary |
| `/settings` | `settings` | `SettingsScreen` | **More -> Settings** |

> [!NOTE]
> **Shell Boundary Rule (ADR-011)**:
> Expo Router navigation logic belongs strictly in `app/(tabs)/_layout.tsx`. The `BottomNavigation` component is presentation-only and accepts active tab IDs and callbacks without importing Expo Router directly.


## 4. Navigation Architecture & Ownership
The navigation architecture isolates routing logic from component rendering. It operates on a robust state machine model where the URL (or abstract route state) is the single source of truth.

To prevent overlapping responsibilities, the architecture enforces strict ownership:

| Artifact   | Owner         |
| ---------- | ------------- |
| Route      | Navigation    |
| Layout     | Screen        |
| Transition | Motion        |
| Visuals    | Design System |

## 5. Navigation Decision Tree
Developers must not guess the appropriate navigation modality. The following decision tree makes navigation deterministic:

```text
Need full workflow?
        │
        ▼
      Screen

Need temporary task?
        │
        ▼
   Bottom Sheet

Need confirmation?
        │
        ▼
      Dialog

Need short interruption?
        │
        ▼
      Modal
```

## 6. Route Taxonomy & Naming Convention
Routes must follow a predictable, RESTful taxonomy mapping directly to the Domain Architecture.
- **Index Routes**: `/transactions` (List views, dashboards)
- **Detail Routes**: `/transactions/:id` (Specific entity focus)
- **Action Routes**: `/transactions/new` or `/transactions/:id/edit` (Entity manipulation)
- **Nested Contexts**: `/budgets/:id/transactions` (Transactions explicitly scoped to a budget)

### Naming Convention
Paths must be noun-based, identifying the resource rather than the action.

**Good:**
`/accounts`
`/accounts/:id`
`/accounts/new`
`/accounts/:id/edit`

**Avoid:**
`/createAccount`
`/editAccount`
`/updateAccount`

## 7. Navigation Hierarchy
To prevent circular loops, lost states, and unresolvable deep stacks, the application enforces a strict hierarchy:
- **Root Level**: Global initialization, Authentication bounds, and Fatal error states.
- **Primary Level**: The main structural pillars of the application (e.g., Dashboard, Transactions).
- **Secondary Level**: Task-oriented, linear journeys within a primary pillar.
- **Tertiary Level**: Temporary, highly focused context switches (Modals, Bottom Sheets).

## 8. Bottom Navigation
Bottom navigation anchors the Primary Level of the application on mobile devices.
- **Persistency**: Bottom navigation must remain visible at the Root and Primary levels.
- **State Separation**: Each tab maintains its own isolated Secondary Level stack. Switching tabs does not destroy the stack of the previous tab.

## 9. Stack Navigation
Stack navigation handles Secondary Level journeys, pushing new contexts over old ones.
- **Linearity**: Stacks represent linear journeys. Pushing the exact same route multiple times is strictly prohibited.
- **Depth Limit**: Stacks should rarely exceed 3 levels deep.

## 10. Modal Navigation
Modals are highly disruptive to the user's cognitive flow and must be used judiciously.
- **Full-Screen Modals**: Reserved exclusively for complex, multi-step tasks (e.g., Onboarding).
- **Rule of One**: Only one modal may be active at any given time.

## 11. Bottom Sheet Navigation
Bottom Sheets provide contextual, tertiary navigation on mobile devices.
- **Usage**: Rapid, localized tasks (e.g., selecting an account, quick filters).
- **Dismissibility**: Must always be easily dismissible via a downward swipe gesture.

## 12. Dialog Navigation
Dialogs are urgent, blocking interruptions.
- **Usage**: Critical confirmations, destructive action warnings, or system-level permissions.
- **Constraints**: Dialogs must never contain complex forms or secondary navigation.

## 13. Deep Linking
Deep linking is a first-class citizen. Every significant screen must be addressable via a universal URL.
- **Routing Independence**: Deep links must resolve correctly regardless of the application's current launch state.
- **Fallback Logic**: If a deep link points to an unavailable resource, the router must fail gracefully to a safe fallback screen with a descriptive toast.
- **Auth Rehydration**: Deep links accessed while logged out must capture the intended destination and replay it immediately upon successful login.

## 14. Navigation State Preservation
Navigation must intelligently preserve context.
- **Tab State**: Switching between primary tabs preserves the scroll position and active stack.
- **List State**: Navigating back to an index view must restore scroll position, active filters, and search queries.

## 15. Back Navigation Policy
The back button is a critical contract with the user.
- **Contextual Return**: Pressing "Back" must return the user to their immediate previous logical context in the stack.
- **Modal/Sheet Dismissal**: "Back" must close active modals or focus states before navigating backward in the primary stack.

## 16. Navigation Guards
Guards act as middleware for the routing engine.
- **Authentication Guards**: Prevent access to protected routes without a valid session.
- **Authorization Guards**: Prevent access to restricted domains.
- **Data Guards**: Ensure prerequisite data is loaded before rendering a screen.
- **Unsaved Changes Guard**: Intercept navigation to prompt for confirmation before abandoning dirty forms.

## 17. Cross-Module Navigation
Transitions across bounded contexts must be visually coherent.
- **Loading Boundaries**: If crossing modules requires significant data fetching, a governed skeleton must bridge the gap smoothly.

## 18. Transition Matrix
Transitions between states are governed by a matrix, ensuring motion and navigation remain synchronized.

| From      | To        | Transition   |
| --------- | --------- | ------------ |
| Dashboard | Details   | Push         |
| Details   | Dashboard | Pop          |
| Dashboard | Filter    | Bottom Sheet |
| Dashboard | Logout    | Dialog       |

## 19. User Journey Mapping
Before implementing any navigation paths, the journey must be formally mapped as an architectural artifact.
Every documented journey must define: Start, Goal, Entry Point, Exit Point, Navigation, Success Criteria, and Failure States.

### Journey Registry
Every formally mapped journey must be recorded in the Journey Registry, ensuring ongoing governance.
- **Journey**
- **Owner**
- **Status**
- **Entry**
- **Exit**
- **Version**

## 20. Navigation Registry
Routes are strictly governed by a centralized Navigation Registry.

| Route | Type | Module | Guard | Deep Link |
| ----- | ---- | ------ | ----- | --------- |

## 21. Navigation Analytics
Navigation events provide critical telemetry.
- **Tracking Requirements**: Every route change must emit a standardized navigation event.
- **Data Privacy**: Route parameters containing sensitive data must be explicitly scrubbed before emission.

## 22. Accessibility
Navigation must be universally accessible by default.
- **Focus Management**: Upon a route transition, screen reader focus must automatically move to the primary `h1` heading or the logical start of the new context.
- **Modal Focus Trapping**: Active modals and dialogs must strictly trap keyboard focus until dismissed.

## 23. Performance
Navigation transitions must be immediate and fluid.
- **Pre-fetching**: Predictive data fetching should occur on link hover or press initiation.
- **Code Splitting**: Routes must be lazily loaded at the module boundary.
- **Transition Budget**: The time from interaction to visual transition start must not exceed 100ms.

## 24. Navigation Lifecycle & Route Ownership
The execution flow of any route transition is strictly separated across architectural layers:

```text
Trigger
(UI)

   ↓

Guards
(Application)

   ↓

Prefetch
(Application)

   ↓

Transition
(Presentation)

   ↓

Render
(Presentation)

   ↓

Analytics
(Integration)
```

## 25. Navigation Anti-Patterns
To preserve routing integrity, the following actions are explicitly prohibited.

> [!WARNING]
> **Never:**
> ❌ Push duplicate routes onto the stack.
> ❌ Stack dialogs on top of other dialogs.
> ❌ Navigate directly from component internals (use generic events).
> ❌ Skip navigation guards for perceived performance.
> ❌ Reset navigation stacks unnecessarily.

## 26. Testing Standards
Navigation architecture must be rigorously tested before reaching production.
- **Integration Tests**: Verify that deep links resolve to the correct component trees and states.
- **Guard Tests**: Verify that unauthorized users are correctly intercepted.

## 27. Versioning
Changes to the application's URL schema or routing taxonomy are subject to architectural versioning.
- **Major**: Changing root paths or altering primary tab structure.
- **Minor**: Adding new routes.
- **Patch**: Internal guard logic updates.
