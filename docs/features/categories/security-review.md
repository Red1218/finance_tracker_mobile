# Categories Security & Threat Model Review

## Threat Model

### Privilege Escalation
- **Horizontal Privilege Escalation (Tenant Isolation)**: Mitigated. RLS strictly enforces `user_id = auth.uid()` for all write operations. A tenant cannot access or modify a neighboring tenant's categories.
- **Vertical Privilege Escalation**: Mitigated. Standard users cannot elevate their personal categories to `is_system = true`, nor can they modify existing system categories.

### Broken Object Level Authorization (BOLA / IDOR)
Mitigated at the database level. Even if the API exposes a direct `PATCH /categories/:id` endpoint without verifying ownership in the Service Layer, the database will reject the UPDATE if the `id` belongs to another user.

### OWASP API Security
The design strictly adheres to OWASP API Security Top 10, specifically addressing API1:2023 (Broken Object Level Authorization) and API5:2023 (Broken Function Level Authorization) by pushing authorization to the lowest possible tier (the database).

## Data Leakage
System categories are intended to be public to all authenticated users. No sensitive personal identifiable information (PII) is stored in system categories. Personal category names are fully isolated.

## Edge Case Analysis
- **Offline Sync**: Mobile clients syncing local databases will send bulk UPSERTS. RLS ensures that maliciously crafted sync payloads containing other users' IDs will violently fail, protecting the server state.
- **Import/Export**: CSV imports rely on `INSERT`. The `user_id = auth.uid()` constraint guarantees that a user cannot import a CSV engineered to assign categories to arbitrary IDs.
- **AI Categorization**: If an AI agent automatically categorizes transactions, it must operate using the user's Auth Context (JWT) to ensure the RLS boundaries naturally sandbox the AI's actions.

## SECURITY DEFINER Functions
PostgreSQL allows functions to be created with `SECURITY DEFINER`, executing with the privileges of the user that created them (usually a superuser), effectively bypassing RLS.

- **Why they require special review**: A vulnerability in a `SECURITY DEFINER` function (e.g., SQL injection or missing logic checks) can lead to complete database compromise and mass data leakage.
- **How they bypass boundaries**: They step outside the current `auth.uid()` context and act as the database owner, exposing data that the calling user normally cannot see.
- **When they should be used**: Use them only for highly specific, bounded operations where an unprivileged user must perform an action requiring elevated rights that cannot be expressed purely via RLS (e.g., securely rotating an API key or reading a strictly protected system configuration). 
- **Enterprise Approval Requirements**: Any PR introducing a `SECURITY DEFINER` function MUST be explicitly reviewed by the Principal Security Architect. Do not avoid them completely, as they are powerful architectural tools, but they mandate exhaustive security auditing.

## Future Compatibility (Household Support Clarification)

The current architecture intentionally optimizes for **Single-user ownership** (`user_id = auth.uid()`).

It explicitly does **NOT** support:
- Households
- Shared workspaces
- Team ownership
- Collaborative editing

Supporting these collaborative features in the future would require a comprehensively redesigned RLS model. Policies would need to transition from direct user ownership to joining against a `workspace_members` or `household_members` mapping table, significantly altering index strategies, caching, and performance characteristics. The current design establishes the foundation, but deliberate structural migrations will be necessary to support multi-tenant sharing.

## Residual Risks
None identified under the current single-player tenant model.
