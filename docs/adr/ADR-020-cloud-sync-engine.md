# ADR-020: Cloud Sync Engine Architecture

## Status
**✅ Approved**

## Context
The Finance Tracker platform requires an offline-first architecture. Financial transactions, account balance changes, category updates, and user preferences must be performant locally when offline and synchronized reliably with Supabase when online. A dedicated synchronization bounded context was required to manage queue persistence, retry policies, conflict detection, and network status observation without introducing duplicate financial state.

## Decision
1. **Synchronization Boundary Principle**:
   - Cloud Sync owns **synchronization work only** and does NOT own or mutate financial state.
   - Financial bounded contexts (`Accounts`, `Transactions`, `Categories`, `Budgets`, `Preferences`) remain canonical sources of truth.

2. **Aggregate Root & State Machine (`SyncQueueItem`)**:
   - `SyncQueueItem` is the aggregate root owning `id`, `operation: SyncOperation`, `status: SyncStatus`, `retryCount`, `maxRetries`, `lastAttemptedAt`, and `errorReason`.
   - `SyncStatus` enforces strict state machine transitions: `PENDING` -> `IN_PROGRESS` -> `SYNCED` / `FAILED` -> `PENDING` (retry) or `CONFLICT`.
   - Synced items are immutable and cannot re-enter `PENDING` status. Items in `CONFLICT` status cannot auto-retry without explicit conflict resolution.

3. **Value Objects (`SyncTarget` & `SyncOperation`)**:
   - `SyncTarget`: Encapsulates target entity identity (`entityType`, `entityId`).
   - `SyncOperation`: Immutable snapshot of mutation type (`CREATE`, `UPDATE`, `DELETE`, `VOID`), `target`, `payloadSnapshot`, timestamp, and `correlationId`.

4. **Abstractions**:
   - `ISyncQueueRepository`: Abstracts persistent queue storage.
   - `ISyncTransportProvider`: Abstracts backend transport execution (`pushOperation`).
   - `INetworkStatusProvider`: Abstracts platform network connectivity detection (`isOnline()`, `subscribe()`).

5. **Presentation Layer Architecture**:
   - `SyncViewModel`: Exposes presentation-ready metrics (`isOnline`, `pendingCount`, `conflictCount`, `failedCount`, `statusLabel`, `statusColor`).
   - `SyncController`: Reactive state facade handling network connectivity changes, manual sync triggers, and conflict resolutions.
   - `SyncStatusBadge`: Focused UI indicator displaying status colors and sync triggers.

## Consequences
- **Positive**: Complete offline-first capability with guaranteed event ordering via `correlationId`.
- **Positive**: Total isolation—financial state remains clean and uncorrupted by network transient errors or retries.
- **Negative**: Requires mapper translation and background process coordination.
