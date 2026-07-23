# Dashboard: Phase 1.6 Integration Architecture

**Status**: Approved (Frozen)
**Phase**: 1.6

---

## 1. Objectives

This document defines the integration architecture for the Finance Tracker Dashboard. It specifies how the Dashboard feature connects with adjacent internal bounded contexts, external services, system events, and cross-cutting platform security/observability services.

It guarantees that integration boundaries strictly preserve the separation of concerns established in Phases 1.1 through 1.5, ensuring that the Dashboard remains a read-optimized, loosely-coupled presentation hub.

---

## 2. Integration Overview

The Dashboard Context communicates with adjacent contexts primarily through **Domain Event Subscriptions** and **Read-Only Service/Repository Adapters**.

```
                           ┌─────────────────────────┐
                           │   Transaction Context   │
                           └────────────┬────────────┘
                                        │ (Events & Read Queries)
                                        ▼
┌─────────────────────────┐    ┌─────────────────────────┐    ┌─────────────────────────┐
│     Budget Context      │───►│    Dashboard Context    │◄───│    Category Context     │
└─────────────────────────┘    └────────────┬────────────┘    └─────────────────────────┘
                                            │
                                            ▼
                               ┌─────────────────────────┐
                               │ User Preferences Context│
                               └─────────────────────────┘
```

### Key Principles
- **Loose Coupling**: The Dashboard Context does not mutate data in adjacent contexts.
- **Asynchronous Event-Driven Updates**: Data changes in transaction/budget/category contexts notify the Dashboard asynchronously.
- **Read-Only Data Consumer**: The Dashboard observes aggregated state and never claims ownership of underlying domain models.

---

## 3. Internal Context Integrations

The Dashboard interacts with four internal bounded contexts within the Finance Tracker system.

### 3.1 Transaction Context
- **Boundary Contract**: Read-only query access to transaction history and event stream subscriptions.
- **Data Ownership**: Transaction Context owns all transaction records, amounts, dates, and merchant labels.
- **Integration Points**:
  - `GetTransactionsForPeriodQuery`: Used by Dashboard Recent Activity & Financial Summary services.
  - `TransactionAdded` / `TransactionUpdated` / `TransactionDeleted` events.

### 3.2 Budget Context
- **Boundary Contract**: Read-only query access to budget configurations and consumption status.
- **Data Ownership**: Budget Context owns budget limits, categories, and calculation thresholds.
- **Integration Points**:
  - `GetBudgetHealthQuery`: Used by Budget Health section service.
  - `BudgetUpdated` / `BudgetDeleted` events.

### 3.3 Category Context
- **Boundary Contract**: Metadata lookup for category names, icons, and hierarchies.
- **Data Ownership**: Category Context owns the master taxonomy.
- **Integration Points**:
  - `GetCategoryMetadataQuery`: Used for Category Breakdown and Activity Rows.
  - `CategoryUpdated` events.

### 3.4 User Preferences Context
- **Boundary Contract**: System locale, currency preference, and display settings.
- **Data Ownership**: User Preferences Context owns user-specific settings.
- **Integration Points**:
  - `GetUserPreferencesQuery`: Used for formatting and localization.
  - `UserPreferencesUpdated` events.

### 3.5 Integration Responsibility Matrix

An overview of data ownership, event publishing, consumption, and mutation capabilities across integrated contexts:

| Bounded Context | Owns Source Data | Publishes Events | Consumed by Dashboard | Dashboard Can Mutate |
|---|---|---|---|---|
| **Transactions** | Yes | Yes (`TransactionAdded/Updated/Deleted`) | Yes (KPIs, Activity, Spend) | No |
| **Budgets** | Yes | Yes (`BudgetUpdated/Deleted`) | Yes (Budget Health) | No |
| **Categories** | Yes | Yes (`CategoryUpdated`) | Yes (Metadata, Breakdown) | No |
| **User Preferences** | Yes | Yes (`UserPreferencesUpdated`) | Yes (Formatting, Locale) | No |
| **Dashboard** | No | Yes (`DashboardLoaded`, `ReportingPeriodChanged`) | Self / Logging | N/A |

---

## 4. External System Integrations

### 4.1 Remote Backend API Services
- **Role**: Remote persistence authority for cloud sync.
- **Boundary Pattern**: Mediated entirely via Infrastructure Layer Network Transport Adapters (Phase 1.4).
- **Behavior**: Application and Domain layers interact via port interfaces (`DashboardReadRepository`); external HTTP/REST/GraphQL details are hidden behind infrastructure adapters.

### 4.2 System Platform Services
- **Device Local Storage**: Encrypted disk persistence for L2 cache models (SEC-003).
- **System Locale & Region API**: Provides fallback formatting rules if user preferences are unconfigured.

---

## 5. Event Integration Model

### 5.1 Event Subscription Matrix

| Event Name | Originating Context | Target Dashboard Section(s) | Integration Action |
|---|---|---|---|
| `TransactionAdded` | Transaction Context | Financial Summary, Recent Activity, Category Breakdown | Mark sections stale; trigger async refresh |
| `TransactionUpdated` | Transaction Context | Financial Summary, Recent Activity, Category Breakdown | Mark sections stale; trigger async refresh |
| `TransactionDeleted` | Transaction Context | Financial Summary, Recent Activity, Category Breakdown | Mark sections stale; trigger async refresh |
| `BudgetUpdated` | Budget Context | Budget Health | Re-query Budget Health Status |
| `BudgetDeleted` | Budget Context | Budget Health | Transition Budget Health section to Empty State |
| `CategoryUpdated` | Category Context | Category Breakdown, Recent Activity | Refresh visual metadata (names/icons) |
| `UserPreferencesUpdated` | User Preferences Context | All Dashboard Sections | Re-format all monetary/date string values |

### 5.2 Event Delivery Guarantees
- **Idempotency**: The Dashboard Event Subscriber tracks event identifiers to prevent duplicate processing.
- **Event Ordering**: Handlers process events in timestamp sequence to avoid race conditions.

---

## 6. Authentication & Authorization Integration

### 6.1 Context Propagation
- User identity and authentication tokens are managed by the Authentication Context.
- The Application Layer includes a `UserIdentityReference` in all Command and Query payloads.
- Infrastructure Adapters automatically attach active session credentials to outbound requests.

### 6.2 Security Boundaries
- **Tenant Isolation**: Queries dispatched from the Dashboard must strictly specify the active user scope (SEC-002). Cross-user data retrieval is rejected at the adapter interface.
- **Token Expiry & Re-auth**: On 401/Authentication failure signals from external integrations, the Dashboard captures the error, halts rendering, and requests authentication renewal.

---

## 7. Data Synchronization Strategy

### 7.1 Read-Through Synchronization Flow
```
Dashboard App Request
       ↓
Check L1 (Runtime Memory Cache)
  ├─► Hit  ─► Return ViewModel immediately
  └─► Miss ─► Check L2 (Encrypted Disk Cache)
                ├─► Hit  ─► Return ViewModel + Trigger Async Remote Refresh
                └─► Miss ─► Fetch Remote API + Store L2/L1 + Return ViewModel
```

### 7.2 Offline Synchronization Behavior
- **Offline Detection**: Infrastructure Network Adapters monitor network connectivity state.
- **Degraded Mode**: When offline, the Dashboard serves the latest valid L2 disk cache payload with an "Offline / Stale Data" banner.
- **Re-connection Catch-Up**: Upon network restoration, the Dashboard Event Subscriber checks for missed remote events and issues a background `LoadDashboardCommand`.

---

## 8. Failure & Recovery Strategy

### 8.1 Integration Failure Matrix

| Integration Point | Failure Mode | Recovery Mechanism | Impact |
|---|---|---|---|
| **Transaction Context Query** | Timeout / Outage | Fallback to L2 cached transactions + Section Inline Error with Retry | Recent Activity and Category Breakdown degrade; remaining sections function |
| **Budget Context Query** | Timeout / Outage | Fallback to L2 cached budget health + Section Inline Error with Retry | Budget Health section degrades |
| **User Preferences Context** | Service Unreachable | Default fallback locale (USD / ISO date) | Dashboard renders with system defaults |
| **Remote Sync API** | 5xx Server Error | Exponential Backoff Retry (3 attempts) -> Circuit Breaker Open -> Serve L2 Cache | Full Dashboard serves cached data with warning banner |

### 8.2 Circuit Breaker & Retry Coordination
- Remote calls employ automated exponential backoff with jitter (max 3 retries).
- Breaker trips open after 5 consecutive failures, bypassing remote calls for 60 seconds to protect network and server bandwidth.

---

## 9. Observability Across Integrations

### 9.1 Distributed Tracing & Correlation
- All cross-context queries and event executions carry a shared `CorrelationID` generated at the presentation/application boundary.
- Allows end-to-end tracing from UI action -> Application Command -> Context Integration -> Remote Adapter.

### 9.2 Integration Health Metrics
- Infrastructure adapters emit telemetry markers tracking:
  - Integration query latency (p50, p95, p99).
  - Cross-context event handling success vs. failure counts.
  - Remote API error rates and circuit breaker state transitions.

---

## 10. Integration Constraints

- **INC-001**: Direct Database Coupling Prohibited. The Dashboard must never access SQL tables, ORM models, or persistent storage owned by adjacent contexts.
- **INC-002**: Read-Only Interaction Model. The Dashboard Context must not execute write or state-mutation operations against adjacent contexts.
- **INC-003**: Idempotent Event Consumption. All event subscriber adapters must guarantee idempotent event processing.
- **INC-004**: Strict User Scope Isolation. Every integration query must be scoped to the authenticated user ID.
- **INC-005**: Graceful Degradation. Integration failure in one context must never prevent other sections from rendering.

---

## 11. Future Integration Expansion

- **Multi-Device Event Sync (WebSockets / Push)**: Real-time remote event propagation when transactions are logged on another device.
- **Bank Aggregation Integration**: Integration with external open banking contexts for automated transaction streaming into the system.
- **Cross-App Widget API**: Providing a secure, read-only integration port for system desktop/mobile home screen widgets.
