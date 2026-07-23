# Dashboard: Phase 1.4 Infrastructure Architecture

**Status**: Approved (Frozen)
**Phase**: 1.4

---

## 1. Objectives

This document defines the infrastructure layer architecture for the Finance Tracker Dashboard. The infrastructure layer provides concrete technical implementations for the ports and interfaces declared by the Application Layer (Phase 1.3) and Domain Layer (Phase 1.2).

The infrastructure layer handles technical mechanisms such as data persistence, external communication, event delivery, caching, logging, and security context propagation. It contains zero business logic and serves strictly as an operational foundation for the upper layers.

*(Reference: Phase 1.3 Application Architecture, Phase 1.2 Domain Architecture, Phase 1.1 Requirements)*

---

## 2. Infrastructure Layer Overview

The Infrastructure Layer operates under the Dependency Inversion Principle. Higher layers (Domain and Application) define abstraction contracts (ports), while the Infrastructure Layer supplies concrete adapters to fulfill those contracts.

```
[ Presentation Layer ]
         ↓
[ Application Layer ]   →  [ Domain Layer ]
         ↑ (implements ports defined by Application/Domain)
[ Infrastructure Layer ]  ← This document
```

### Core Responsibilities
- Fulfilling repository and read-model port contracts.
- Managing data fetch, caching, and invalidation strategies.
- Operating the event delivery and message dispatching mechanisms.
- Executing retry, fallback, and circuit-breaking policies.
- Providing logging, telemetry, and security context propagation across technical boundaries.

---

## 3. Repository Interfaces & Implementations (Conceptual)

The Dashboard is a read-centric feature. Rather than traditional write-heavy repositories, the Dashboard infrastructure primarily provides **Read Model Repositories** optimized for query performance and data aggregation.

### 3.1 Dashboard Read Repository Port (Conceptual)
- **Port Purpose**: Contract defined by the application/domain layer to fetch aggregated financial data.
- **Infrastructure Implementation**: Fetches raw data from internal data stores, applies data mapping to conceptual domain representations, and returns query results.
- **Behavior**: Operates asynchronously, supports cancellation, and returns standardized technical error abstractions on failure.

### 3.2 Transaction Read Repository Port (Conceptual)
- **Port Purpose**: Contract to retrieve transaction feeds and category spend aggregations.
- **Infrastructure Implementation**: Connects to the local or remote transaction data store, executes filtered range queries for the active Reporting Period, and maps raw records to domain-understood value objects.

### 3.3 Budget Read Repository Port (Conceptual)
- **Port Purpose**: Contract to retrieve active budget limits and consumption totals.
- **Infrastructure Implementation**: Queries budget persistence adapters and maps results to Budget Health structures.

---

## 4. Data Sources

The Dashboard infrastructure coordinates data retrieval across multiple underlying data sources without leaking source details to the application layer.

### 4.1 Local Persistence Source
- Serves as the primary source for cached dashboard views, offline access, and fast app startup.
- Holds serialized Read Models and temporary calculation snapshots.

### 4.2 Remote API Data Source
- Serves as the authoritative source for fresh financial transactions, updated budgets, and account balances.
- Accessed via network adapters that handle serialization, transport protocols, and authentication headers.

### 4.3 In-Memory Ephemeral Store
- Serves as a high-speed runtime cache for active session state, current Reporting Period selection, and transient section states.

---

## 5. Persistence Strategy

### 5.1 Read Model Persistence
- The Dashboard does not store write-authoritative entities. It persists read-optimized snapshots (Read Models) to minimize aggregation latency on application launch.
- Read models are stored locally using key-value or document abstractions keyed by user identity and Reporting Period.

### 5.2 Read-Through & Write-Through Behaviors
- **Read-Through**: On Dashboard load, the infrastructure first checks the local read model persistence. If valid, it returns immediately while triggering an asynchronous background sync if stale.
- **Invalidation-On-Event**: When domain events (e.g., `TransactionAdded`, `BudgetUpdated`) occur, the corresponding local read model entries are flagged as stale or purged.

---

## 6. Caching Strategy

Caching ensures rapid rendering (meeting NFR-PERF-001) and reliable offline support.

### 6.1 Cache Hierarchy
1. **L1 (In-Memory Runtime Cache)**: Stores active `DashboardViewModel` instances for instantaneous tab switching. Lifetime: Active app session.
2. **L2 (Disk-Backed Local Cache)**: Stores serialized section read models across app restarts. Lifetime: Until invalidated by domain events or explicit expiry TTL.

### 6.2 Cache Invalidation Policy
- **Event-Driven Invalidation**: Subscriptions to domain events (`TransactionAdded`, `TransactionDeleted`, `BudgetUpdated`) immediately invalidate relevant L1 and L2 cache keys.
- **Time-To-Live (TTL)**: Background TTL defaults (e.g., 15 minutes) prevent stale data from persisting indefinitely if events are missed.
- **Scope-Driven Purge**: Changing the Reporting Period purges L1 runtime caches for the previous period to free memory.

---

## 7. Event Infrastructure

The Event Infrastructure provides the transport mechanism for Domain Events passing into and within the Dashboard Context.

### 7.1 In-Process Event Bus
- Handles internal event delivery (e.g., `ReportingPeriodChanged`) synchronously or asynchronously within the local application memory space.
- Ensures decoupled communication between application services.

### 7.2 Cross-Context Event Dispatcher
- Listens to external context events (`TransactionAdded` from Transaction Context, `BudgetUpdated` from Budget Context).
- Implements idempotent subscriber wrappers to ensure that duplicate event delivery does not cause redundant refetches or state corruption (satisfying AC-005).

---

## 8. External Service Adapters

External service adapters wrap communications with third-party or remote services.

### 8.1 Network Transport Adapter
- Encapsulates HTTP/transport details, headers, payload serialization, and status code interpretation.
- Maps low-level transport errors (e.g., connection timeout, 5xx responses) to domain/application error signals (e.g., `NetworkUnavailableError`, `RemoteServerError`).

### 8.2 Currency & Formatting Adapter
- Interacts with system localization APIs to format monetary values according to user locale preferences without embedding formatting logic in domain entities.

---

## 9. Resilience & Retry Strategy

To maintain high availability and satisfy NFR-REL-001/NFR-REL-002, the infrastructure implements robust resilience patterns.

### 9.1 Retry Policy
- **Transient Failures**: Network timeouts or temporary server busy responses trigger automated retries with exponential backoff and jitter.
- **Non-Transient Failures**: Authentication failures or client validation errors fail fast without retry attempts.

### 9.2 Timeout Boundaries
- Remote data fetches enforce strict timeout bounds (e.g., 3 seconds per section request).
- Upon timeout expiry, the request is canceled, and an inline Section Error state is produced, allowing the rest of the Dashboard to render.

### 9.3 Circuit Breaker & Fallback
- If a remote data source experiences repeated consecutive failures, a circuit breaker trips open.
- **Fallback**: While the breaker is open, the infrastructure automatically falls back to stale L2 cached data (if available) paired with an offline/stale banner indicator.

---

## 10. Logging & Observability

### 10.1 Logging Boundaries
- Logging occurs exclusively at the infrastructure boundary (adapters, repository implementations, event dispatchers).
- Log levels:
  - **Debug**: Detailed payload trace (sanitized), cache hits/misses, performance markers.
  - **Info**: Navigation events, period changes, background sync triggers.
  - **Warn**: Transient retries, cache fallbacks, degraded section renders.
  - **Error**: Network failures, unhandled adapter exceptions, event parsing errors.

### 10.2 Telemetry & Performance Monitoring
- Infrastructure wraps section fetch operations with performance markers measuring time-to-first-render and total assembly time.
- Aggregated metrics track cache hit ratios, network latency, and section error rates.

---

## 11. Security Considerations

### 11.1 Sensitive Data Protection
- Financial data in L2 disk cache must be encrypted at rest using system-level secure storage primitives (satisfying SEC-003).
- Sensitive values (balances, individual transaction amounts) must be masked in log outputs and trace logs (satisfying SEC-001).

### 11.2 Authentication Context Propagation
- Infrastructure adapters automatically inspect and attach the active user's authentication context (tokens/session identifiers) to all outbound requests.
- If the authentication context is invalid or expired, network adapters intercept the 401 response and trigger an authentication signal to the application layer.

---

## 12. Infrastructure Constraints

- **IC-001**: No business logic or calculations are permitted in infrastructure code. Infrastructure strictly transforms and moves data.
- **IC-002**: Database schemas, SQL queries, or specific ORM models must not be exposed outside the infrastructure layer.
- **IC-003**: Infrastructure adapters must strictly implement ports defined by the Application or Domain layers.
- **IC-004**: All sensitive cached data must be encrypted at rest.
- **IC-005**: Network operations must specify explicit timeouts and cancellation support.
- **IC-006**: Event subscribers must guarantee idempotent processing.

---

## 13. Infrastructure Port Catalog

A centralized reference of all infrastructure ports/contracts declared across the domain and application layers, and their operational purpose:

| Port Contract | Layer Defined | Operational Purpose |
|---|---|---|
| **DashboardReadRepository** | Application | Retrieves aggregated Dashboard read models for initial rendering. |
| **TransactionReadRepository** | Application | Retrieves filtered transaction lists and category spend metrics. |
| **BudgetReadRepository** | Application | Retrieves active budget limits and consumption metrics. |
| **EventPublisher** | Domain / Application | Publishes internal Dashboard domain events (e.g., `ReportingPeriodChanged`). |
| **EventSubscriber** | Application | Subscribes to and processes external context events (e.g., `TransactionAdded`). |
| **CacheProvider** | Infrastructure | Manages L1 in-memory and L2 disk-backed persistent storage. |
| **Logger** | Infrastructure | Provides structured logging across infrastructure boundaries. |
| **TelemetryProvider** | Infrastructure | Collects execution performance metrics, traces, and error counts. |

---

## 14. Future Infrastructure Expansion

- **Distributed Event Broker**: Migration from in-process event bus to a distributed message queue for multi-device sync.
- **Offline-First Synchronization Engine**: Advanced bi-directional sync engine with delta tracking and conflict resolution.
- **Encrypted Local Database**: Transitioning from file key-value stores to a full encrypted relational or document store for complex local aggregations.

