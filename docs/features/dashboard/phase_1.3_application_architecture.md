# Dashboard: Phase 1.3 Application Architecture

**Status**: Approved (Frozen)
**Phase**: 1.3

---

## 1. Objectives

This document defines the application layer for the Finance Tracker Dashboard. The application layer sits between the domain model (Phase 1.2) and the outside world (infrastructure, UI, and external systems). Its sole responsibility is orchestration: coordinating domain objects, mediating input from external sources, and directing output to the appropriate channels.

The application layer contains no business rules. All business logic resides in the domain. The application layer only decides *what to call*, *in what order*, and *how to handle outcomes*.

*(Reference: Phase 1.2 Domain Architecture, Phase 1.1 Requirements)*

---

## 2. Application Layer Overview

The application layer acts as the boundary between the outside world and the domain. It:
- Accepts Commands (intent to change state) and Queries (intent to read state) from external callers.
- Delegates execution to domain entities, value objects, and domain services.
- Returns structured results or error signals to the caller.
- Listens for Domain Events and coordinates reactions across the application.

```
[ UI / Presentation Layer ]
         ↕ Commands / Queries / View Models
[ Application Layer ]         ← This document
         ↕ Domain model calls
[ Domain Layer ]
         ↕ Port interfaces
[ Infrastructure Layer ]
```

The application layer depends on the domain. It must not depend on infrastructure details or UI concerns. Infrastructure depends on the application layer through dependency inversion.

---

## 3. Responsibilities of the Application Layer

The application layer is responsible for:

1. **Receiving Commands and Queries** from the presentation layer.
2. **Validating inputs** structurally (not business rules — those belong in the domain).
3. **Invoking domain services** and coordinating between them.
4. **Assembling View Models / DTOs** from domain results for consumption by the presentation layer.
5. **Translating domain errors** into application-level error signals that the caller can interpret without domain knowledge.
6. **Subscribing to Domain Events** and coordinating appropriate application-level reactions.
7. **Managing transaction boundaries** (coordinating what must succeed together as a unit).

The application layer must not:
- Contain business rules or calculations.
- Directly access data stores or external services.
- Reference UI components or rendering concerns.
- Make decisions about visual state.

---

## 4. Use Cases

Use cases represent distinct, named operations that the application layer exposes to the outside world.

---

### UC-001: Load Dashboard

**Purpose**: Initialize and populate the complete Dashboard view for the authenticated user for the active Reporting Period.

**Inputs**:
- User identity reference
- Active Reporting Period (or default period if none is active)

**Outputs**:
- Dashboard View Model containing all section data (or their respective loading/empty/error states)

**Success Path**:
1. Validate that a user identity reference is present.
2. Resolve the active Reporting Period (or apply the default).
3. Dispatch the Load Dashboard Command.
4. The Dashboard Assembly Application Service invokes the domain's Dashboard Assembly Service.
5. All Dashboard Sections are populated concurrently.
6. Assemble the Dashboard View Model from resolved section results.
7. Return the Dashboard View Model to the caller.

**Failure Path**:
- If user identity is absent: return an authentication error signal. Do not proceed.
- If the domain service fails for a specific section: mark that section's View Model with an Error state and include a retry token. Do not fail the entire Dashboard.
- If all sections fail: return a Dashboard View Model in a total-error state with a global retry signal.

---

### UC-002: Change Reporting Period

**Purpose**: Update the active Reporting Period and refresh all Dashboard data accordingly.

**Inputs**:
- User identity reference
- Selected Reporting Period (Period Type and optional custom date range)

**Outputs**:
- Updated Dashboard View Model with all sections refreshed for the new period

**Success Path**:
1. Validate the selected Reporting Period is structurally valid (start date ≤ end date).
2. Dispatch the Change Reporting Period Command.
3. Emit the `ReportingPeriodChanged` Domain Event.
4. The application layer reacts to the event by re-dispatching Load Dashboard (UC-001) with the new period.
5. Return the refreshed Dashboard View Model.

**Failure Path**:
- If the Reporting Period is structurally invalid: return a validation error. Do not change the active period.
- If data refresh fails for one or more sections: follow the partial-failure path from UC-001.

---

### UC-003: Refresh Dashboard Section

**Purpose**: Re-fetch data for a single Dashboard Section without reloading the entire Dashboard (e.g., after a Retry action).

**Inputs**:
- User identity reference
- Active Reporting Period
- Target Section Type (e.g., BudgetHealth, RecentActivity)

**Outputs**:
- Updated View Model for the targeted section only

**Success Path**:
1. Validate user identity and section type are present.
2. Dispatch the Refresh Section Command for the specified section type.
3. Invoke only the relevant domain service for that section.
4. Assemble and return the updated section View Model.

**Failure Path**:
- If the section-specific domain service fails: return an Error state for that section only.
- Other sections are unaffected.

---

### UC-004: Execute Quick Action

**Purpose**: Initiate a high-priority user flow (e.g., Add Transaction) from the Dashboard without navigating away.

**Inputs**:
- User identity reference
- Quick Action type (e.g., AddTransaction)
- Action-specific payload (e.g., transaction details)

**Outputs**:
- Success confirmation signal
- Updated affected Dashboard Section View Models (post-action refresh)

**Success Path**:
1. Validate user identity and action payload are structurally complete.
2. Dispatch the Quick Action Command to the appropriate domain service or bounded context.
3. On domain confirmation, emit the relevant Domain Event (e.g., `TransactionAdded`).
4. The application layer reacts to the Domain Event by refreshing affected Dashboard Sections.
5. Return success confirmation and the refreshed section View Models.

**Failure Path**:
- If payload validation fails: return a validation error without invoking the domain.
- If the domain operation fails: return a domain error signal. No Dashboard section refresh occurs.

---

### UC-005: Handle Domain Events from Adjacent Contexts

**Purpose**: React to Domain Events from the Transaction, Budget, or Category contexts and propagate the necessary Dashboard updates.

**Inputs**:
- Incoming Domain Event (e.g., `TransactionAdded`, `BudgetUpdated`, `CategoryUpdated`)

**Outputs**:
- Refresh signals dispatched to the affected Dashboard Sections

**Success Path**:
1. The application event handler receives the Domain Event.
2. Determine which Dashboard Sections are affected by the event type (see Domain Event map in Phase 1.2).
3. Dispatch Refresh Section Commands for each affected section.
4. Sections update independently.

**Failure Path**:
- If handling an event fails for a section: mark that section as stale or in error. Do not propagate the failure to other sections or the event source.
- Event handling must be idempotent: receiving the same event twice must not corrupt the Dashboard state.

---

## 5. Commands

Commands represent intent to change state. They are dispatched by the presentation layer and handled by Application Services.

| Command | Trigger | Handler |
|---|---|---|
| `LoadDashboardCommand` | User navigates to Dashboard | Dashboard Assembly Application Service |
| `ChangeReportingPeriodCommand` | User selects a new period | Reporting Period Application Service |
| `RefreshSectionCommand` | User taps Retry or a Domain Event fires | Dashboard Section Application Service |
| `ExecuteQuickActionCommand` | User taps a Quick Action | Quick Action Application Service |

**Command Rules**:
- Commands carry only the data needed to invoke the operation. They do not carry business logic.
- Commands are validated structurally upon receipt; domain-level validation is delegated to the domain.
- A Command handler must produce either a success result or a well-typed error signal. It must never silently swallow failures.

---

## 6. Queries

Queries represent intent to read state without changing it. They return View Models or DTOs.

| Query | Purpose | Handler |
|---|---|---|
| `GetDashboardQuery` | Retrieve the current Dashboard View Model | Dashboard Query Service |
| `GetSectionQuery` | Retrieve a single Dashboard Section View Model | Dashboard Query Service |
| `GetActiveReportingPeriodQuery` | Retrieve the currently active Reporting Period | Reporting Period Query Service |

**Query Rules**:
- Queries must never mutate state.
- Queries may be served from a cached or pre-computed view without re-invoking the full domain pipeline.
- Queries return View Models, not raw domain entities.

---

## 7. Application Services

Application Services are the primary handlers within the application layer. Each service is responsible for a specific slice of orchestration.

---

### 7.1 Dashboard Assembly Application Service

**Responsibility**: Orchestrates the full load of the Dashboard by coordinating all section-level application services concurrently.

**Collaborators**: Financial Summary Application Service, Budget Health Application Service, Category Breakdown Application Service, Recent Activity Application Service.

**Inputs**: User identity reference, Active Reporting Period.

**Outputs**: Fully assembled Dashboard View Model (with all sections resolved or in error).

**Rules**:
- Must invoke all section services concurrently.
- Must not wait for one section to complete before starting another.
- Must produce a valid Dashboard View Model regardless of individual section failures.

---

### 7.2 Financial Summary Application Service

**Responsibility**: Invokes the domain's Financial Summary Service and translates the result into a KPI Section View Model.

**Collaborators**: Domain Financial Summary Service.

**Inputs**: User identity reference, Active Reporting Period.

**Outputs**: KPI Section View Model (Total Balance, Period Income, Period Expenses, Trend Indicators).

**Rules**:
- On domain success: assemble and return the populated KPI Section View Model.
- On domain failure: return the KPI Section View Model in an Error state.
- On empty result: return the KPI Section View Model in an Empty state.

---

### 7.3 Budget Health Application Service

**Responsibility**: Invokes the domain's Budget Health Service and translates the result into a Budget Health Section View Model.

**Collaborators**: Domain Budget Health Service.

**Inputs**: User identity reference, Active Reporting Period.

**Outputs**: Budget Health Section View Model (status, amounts, progress ratio).

**Rules**:
- On no budgets found: return the Budget Health Section View Model in an Empty state.
- On domain failure: return the Budget Health Section View Model in an Error state.

---

### 7.4 Category Breakdown Application Service

**Responsibility**: Invokes the domain's Category Breakdown Service and translates the result into a Category Breakdown Section View Model.

**Collaborators**: Domain Category Breakdown Service.

**Inputs**: User identity reference, Active Reporting Period.

**Outputs**: Category Breakdown Section View Model (ranked list of category summaries).

**Rules**:
- On no spending data: return the Category Breakdown Section View Model in an Empty state.
- On domain failure: return the Category Breakdown Section View Model in an Error state.

---

### 7.5 Recent Activity Application Service

**Responsibility**: Invokes the domain's Recent Activity Service and translates the result into a Recent Activity Section View Model.

**Collaborators**: Domain Recent Activity Service.

**Inputs**: User identity reference, Active Reporting Period, Display limit.

**Outputs**: Recent Activity Section View Model (ordered list of activity rows).

**Rules**:
- On no transactions: return the Recent Activity Section View Model in an Empty state.
- On domain failure: return the Recent Activity Section View Model in an Error state.

---

### 7.6 Reporting Period Application Service

**Responsibility**: Validates and applies a Reporting Period change, then triggers Dashboard re-assembly.

**Collaborators**: Dashboard Assembly Application Service.

**Inputs**: User identity reference, Requested Reporting Period.

**Outputs**: Refreshed Dashboard View Model.

**Rules**:
- Validates that the requested Reporting Period is structurally valid before delegating to the domain.
- Emits `ReportingPeriodChanged` event on success.
- Triggers full Dashboard re-assembly after successful period change.

---

### 7.7 Quick Action Application Service

**Responsibility**: Routes Quick Action commands to the appropriate bounded context and coordinates post-action Dashboard refresh.

**Collaborators**: Transaction Context boundary, Dashboard Assembly Application Service (for partial refresh).

**Inputs**: User identity reference, Quick Action type, Action payload.

**Outputs**: Success/failure signal, Updated section View Models.

**Rules**:
- Validates payload structure before delegating to the target context.
- On success: emits the appropriate Domain Event; does not perform the refresh directly — the event handler coordinates it.
- On failure: returns an error signal without triggering any Dashboard refresh.

---

### 7.8 Domain Event Handler Service

**Responsibility**: Receives Domain Events from adjacent bounded contexts and dispatches the appropriate Refresh Section Commands.

**Collaborators**: Dashboard Section Application Services, Event bus or subscriber mechanism.

**Inputs**: Incoming Domain Events (e.g., `TransactionAdded`, `BudgetUpdated`).

**Outputs**: Refresh signals for affected Dashboard Sections.

**Rules**:
- Must be idempotent.
- Must handle events asynchronously without blocking the event source.
- Must not propagate failures back to the event source.

---

## 8. DTOs / View Models (Conceptual Only)

View Models are data structures shaped for the presentation layer. They contain no domain logic and are assembled by Application Services from domain results.

---

### 8.1 DashboardViewModel

- Active Reporting Period label
- KPI Section View Model
- Budget Health Section View Model
- Category Breakdown Section View Model
- Recent Activity Section View Model
- Quick Actions Section View Model
- Overall Dashboard load status

---

### 8.2 SectionViewModel (base concept)

Every section View Model carries:
- Section Type
- Load Status (Loading / Loaded / Empty / Error)
- Error detail (if Status = Error), including a retry token
- Content (type-specific, present only when Status = Loaded)

---

### 8.3 KPISectionViewModel

Extends SectionViewModel with:
- Total Balance (formatted string)
- Period Income (formatted string)
- Period Expenses (formatted string)
- Net for Period (formatted string)
- Trend Indicators (one per KPI)

---

### 8.4 BudgetHealthSectionViewModel

Extends SectionViewModel with:
- Budget status label (OnTrack / AtRisk / OverBudget)
- Amount consumed (formatted string)
- Budget limit (formatted string)
- Consumption ratio (percentage)

---

### 8.5 CategoryBreakdownSectionViewModel

Extends SectionViewModel with:
- Ordered list of Category rows:
  - Category name
  - Amount spent (formatted string)
  - Proportion (percentage)
  - Rank

---

### 8.6 RecentActivitySectionViewModel

Extends SectionViewModel with:
- Ordered list of Activity rows:
  - Merchant / description label
  - Category name
  - Date (formatted string)
  - Amount (formatted string)
  - Direction (Income / Expense)
- Has more indicator (boolean)

---

### 8.7 TrendIndicatorViewModel

- Direction (Positive / Negative / Neutral)
- Display label (e.g., "+12%")
- Accessibility label (e.g., "Increased by 12 percent")

---

## 9. Application Workflows

Workflows describe the end-to-end sequence of application-layer steps for each major operation.

---

### 9.1 Load Dashboard Workflow

```
Presentation → LoadDashboardCommand
  → Dashboard Assembly Application Service
      → [concurrent]
          → Financial Summary Application Service → Domain Financial Summary Service → KPI Section VM
          → Budget Health Application Service → Domain Budget Health Service → Budget Health Section VM
          → Category Breakdown Application Service → Domain Category Breakdown Service → Category Breakdown Section VM
          → Recent Activity Application Service → Domain Recent Activity Service → Recent Activity Section VM
      → Assemble DashboardViewModel
  → Return DashboardViewModel to Presentation
```

---

### 9.2 Change Reporting Period Workflow

```
Presentation → ChangeReportingPeriodCommand(newPeriod)
  → Reporting Period Application Service
      → Validate period structure
      → Emit ReportingPeriodChanged event
      → Dispatch LoadDashboardCommand(newPeriod)
          → [Load Dashboard Workflow]
  → Return refreshed DashboardViewModel to Presentation
```

---

### 9.3 Refresh Dashboard Section Workflow

```
Presentation → RefreshSectionCommand(sectionType)
  → Dashboard Section Application Service
      → Invoke relevant domain service for sectionType
      → Assemble updated Section View Model
  → Return updated Section View Model to Presentation
```

---

### 9.4 Execute Quick Action Workflow

```
Presentation → ExecuteQuickActionCommand(type, payload)
  → Quick Action Application Service
      → Validate payload structure
      → Delegate to target bounded context (e.g., Transaction Context)
          → On success: emit Domain Event (e.g., TransactionAdded)
          → On failure: return error signal to Presentation
      → [Domain Event triggers Refresh Section Workflow for affected sections]
  → Return success signal + updated section VMs to Presentation
```

---

### 9.5 Handle Domain Event Workflow

```
External Context → publishes Domain Event (e.g., TransactionAdded)
  → Domain Event Handler Service
      → Determine affected sections from event type
      → Dispatch RefreshSectionCommand per affected section
          → [Refresh Dashboard Section Workflow per section]
```

---

## 10. Application Sequence Catalog

A concise reference of layer-traversal paths for every major orchestration scenario. This supplements the detailed workflow diagrams in Section 9 and provides a quick orientation guide.

| Scenario | Layer Sequence |
|---|---|
| **Dashboard Startup** | Presentation → Application → Domain → Application → Presentation |
| **Period Change** | Presentation → Application → Domain Event → Application → Domain → Application → Presentation |
| **Section Retry** | Presentation → Application → Domain → Application → Presentation |
| **Quick Action** | Presentation → Application → External Context → Domain Event → Application → Domain → Application → Presentation |
| **Incoming Domain Event** | External Context → Application → Domain → Application → Presentation |

**Key**:
- **Presentation**: Dispatches Commands or Queries; receives View Models.
- **Application**: Orchestrates; never contains business logic.
- **Domain**: Executes business rules; returns results.
- **External Context**: An adjacent bounded context (e.g., Transaction, Budget).
- **Domain Event**: An asynchronous notification crossing context boundaries.

---

## 11. Error Propagation Strategy

The application layer translates domain-level errors into structured error signals for the presentation layer. It never exposes raw domain exceptions.

| Error Origin | Application Response | Presentation Effect |
|---|---|---|
| Missing user identity | Return `AuthenticationError` signal | Redirect to authentication |
| Invalid Command input | Return `ValidationError` signal with field details | Inline validation feedback |
| Domain operation failure (single section) | Return Section View Model in Error state with retry token | Section-level error with Retry button |
| Domain operation failure (total Dashboard) | Return Dashboard View Model in total-error state | Full-page error with Retry |
| Domain Event handling failure | Log and suppress; do not propagate upstream | Section may remain stale |
| Quick Action domain failure | Return `OperationError` signal | Inline error message in overlay |

**Rules**:
- The presentation layer must never receive raw domain exceptions.
- All errors must carry enough context for the presentation layer to offer an actionable recovery path.
- Errors from one section must never cascade into errors for other sections.

---

## 12. Dependency Rules

The application layer enforces strict dependency directionality:

- ✅ Application Layer → Domain Layer (allowed)
- ✅ Infrastructure Layer → Application Layer (allowed, via dependency inversion)
- ✅ Presentation Layer → Application Layer (allowed, via commands/queries)
- ❌ Application Layer → Infrastructure Layer (not allowed; use port interfaces)
- ❌ Application Layer → Presentation Layer (not allowed)
- ❌ Domain Layer → Application Layer (not allowed)

The application layer references domain services and entities by their domain interfaces. It does not reference concrete infrastructure implementations (e.g., specific data stores, network clients).

---

## 13. Application Constraints

- **AC-001**: Application Services must contain no business logic. All rules reside in the Domain Layer.
- **AC-002**: Application Services must not directly access data stores. All data access is mediated through domain service calls or port interfaces.
- **AC-003**: View Models must not carry domain entities. Domain objects must be fully translated before leaving the application layer.
- **AC-004**: All Commands and Queries must be uniquely named and independently handleable.
- **AC-005**: The Domain Event Handler Service must be idempotent. Receiving the same event twice must not corrupt the Dashboard state.
- **AC-006**: All Dashboard Sections must be loaded concurrently. Sequential section loading is not permitted.
- **AC-007**: The application layer must not impose a specific concurrency or threading model. That is a concern of the infrastructure layer.
- **AC-008**: Error signals returned by the application layer must be structured types, not raw strings or untyped exceptions.

---

## 14. Future Expansion

The following application-layer expansions are anticipated for future phases:

- **Offline Support**: A caching application service that serves pre-computed Dashboard View Models when data is unavailable, coordinating with an infrastructure cache port.
- **Push Notification Handling**: An event handler that reacts to remote notification events (e.g., budget threshold breached) and dispatches targeted section refresh commands.
- **Custom Reporting Period**: Extending the Reporting Period Application Service and `ChangeReportingPeriodCommand` to support arbitrary date ranges.
- **Multi-Account Aggregation**: Extending the Dashboard Assembly Application Service to merge financial summaries across multiple user accounts.
- **Savings Goal Section**: A new Application Service and corresponding Use Case for populating a future Savings Goal Dashboard Section.
