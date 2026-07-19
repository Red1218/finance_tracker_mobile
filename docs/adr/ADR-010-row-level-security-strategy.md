# ADR 010: Row Level Security Strategy

## Status
Approved

## Context
The Personal Finance application stores sensitive financial data (Transactions, Categories, Budgets) mapped to individual users. To prevent Broken Object Level Authorization (BOLA) vulnerabilities and guarantee strict tenant isolation, we must determine the primary tier for enforcing authorization. We must also define the lifecycle rules for financial metadata and determine how global application data is segregated from user-owned data.

## Problem Statement
Relying exclusively on the application Service Layer or Repository Layer to append `WHERE user_id = ?` is prone to developer error, creating a massive risk for horizontal privilege escalation. Furthermore, the handling of immutable system defaults, deletion lifecycles, and backend scheduled tasks requires a unified, secure approach.

## Decision Drivers
- **Zero Trust Architecture**: We must assume the API and Service Layers are untrusted and capable of bugs.
- **Performance**: Authorization checks must be mathematically fast and index-compatible.
- **Auditability**: Financial records must remain historically intact.
- **Developer Velocity**: Product engineers should not have to manually string together complex authorization logic for every query.

## Considered Alternatives
1. **Application-Layer Authorization**: Enforcing rules purely in TypeScript services/ORMs. (Rejected due to high risk of human error).
2. **Hard Deletion for Financial Metadata**: (Rejected due to the destruction of historical ledger referential integrity).
3. **Multi-Tenant Workspace Structure initially**: Building complex joining policies immediately. (Rejected as YAGNI; we are optimizing for a single-user model first).

## Chosen Solution
We enforce authorization exclusively at the PostgreSQL database level using **Row Level Security (RLS)**, coupled with an explicit Archive-only lifecycle.

### Key Decisions Explanations
- **Why authorization is enforced in PostgreSQL**: It mathematically guarantees that regardless of the entry point (API endpoint bug, rogue SQL query, or compromised container), the database evaluates the session JWT and blocks cross-tenant reads/writes natively.
- **Why Service Layer does not perform authorization**: The Service Layer focuses solely on business logic (e.g., verifying limits, validating transitions). Decoupling security from business logic prevents API endpoints from accidentally leaking data if a developer forgets a validation check.
- **Why Repository Layer does not filter by user_id**: Appending `user_id` to every query is repetitive and fragile. RLS implicitly filters queries at the execution engine level, ensuring the Repository Layer remains clean and focused on data mapping.
- **Why system categories are global**: Setting `user_id = NULL` and `is_system = true` avoids duplicating identical baseline records (Food, Rent) across millions of users, saving space and allowing universal updates.
- **Why Service Role bypass is accepted**: Backend administrative, scheduled cron, and GDPR compliance jobs require a superuser context to process data across all tenants. This is secure provided the key never touches the frontend or user-facing API handlers.
- **Why Archive is preferred over Delete**: Financial applications mandate auditability. Hard deleting a category breaks the foreign keys of past transactions. Archiving preserves historical integrity and reporting accuracy indefinitely.
- **Why single-user ownership is intentionally chosen**: Optimizing for strict `user_id = auth.uid()` ensures the highest possible query performance via composite indexes. Supporting collaborative households requires complex joins that degrade performance and complicate policies, which is unnecessary for our current product phase.

## Consequences

### Positive Outcomes
- Complete immunity to standard API IDOR/BOLA attacks.
- High developer confidence and velocity when writing queries.
- Bulletproof referential integrity for financial records.

### Tradeoffs
- Debugging RLS issues can be opaque, as Postgres silently drops rows that fail policies rather than throwing explicit permission errors on SELECTs.
- Collaborative features (households) are explicitly locked out and will require a comprehensive architectural pivot later.

### Future Considerations
When multi-tenant/household sharing becomes necessary, we will issue a new ADR to design the transition from direct ownership to a `workspace_members` joining architecture, prioritizing migration paths and index optimization.
