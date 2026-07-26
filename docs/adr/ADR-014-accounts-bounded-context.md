# ADR-014: Accounts Bounded Context Architecture

## Status
Accepted & Frozen

## Context
The application requires a dedicated Accounts module representing where users hold money (`CASH`, `BANK`, `CREDIT_CARD`, `WALLET`). Accounts serve as the single source of truth for future financial features (Expenses, Income, Transfers, Net Worth, Reconciliation, and Bank Sync).

## Decision

1. **Aggregate Root & Single Source of Truth**:
   - `Account` aggregate encapsulates business behavior.
   - `archivedAt: Date | null` is the sole source of truth for archival state. Boolean `isArchived` is a derived getter (`get isArchived(): boolean { return this.archivedAt !== null; }`).
   - Current balance is **never stored** in the database table. It is dynamically derived at query time from `Opening Balance + Ledger Transactions`.

2. **Atomic Default Account Operations**:
   - Every user must have at least one active default account.
   - Initializing accounts auto-creates a default `Cash` account if 0 active accounts exist.
   - `SetDefaultAccountUseCase` and `ArchiveAccountUseCase` execute as atomic operations.
   - Archiving the current default account automatically promotes the oldest active account (`ORDER BY created_at ASC, id ASC`) to default.
   - Archiving is rejected if only 1 active account remains (`LAST_ACTIVE_ACCOUNT_ARCHIVE`).

3. **Database Schema & Constraints**:
   - Dedicated `public.accounts` table with `opening_balance NUMERIC(18, 2)` monetary precision.
   - Partial unique index `idx_accounts_user_name_active` on `(user_id, lower(name)) WHERE archived_at IS NULL`.
   - Partial unique index `idx_accounts_user_default` on `(user_id) WHERE is_default = true`.

4. **Domain Event Reservations**:
   - Domain events (`AccountCreatedEvent`, `AccountRenamedEvent`, `AccountArchivedEvent`, `AccountRestoredEvent`, `DefaultAccountChangedEvent`) are defined as reserved contract structures for future cross-context messaging. They are not dispatched automatically in Phase 2/3 until an event bus integration exists.

5. **State Coordinator Facade**:
   - `AccountController` serves as the presentation facade orchestrating UI operations while delegating business rules strictly to single-responsibility application use cases.

## Consequences
- Clean separation of concerns between domain aggregates, application use cases, pure persistence repositories, and presentation screens.
- Prevention of duplicate active account names and multiple default accounts at both application and database engine levels.
- Full compliance with Clean Architecture, DDD, SOLID, and ADR-011.
