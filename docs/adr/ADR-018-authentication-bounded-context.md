# ADR-018: Authentication Bounded Context Architecture

## Status
**✅ Approved**

## Context
The Finance Tracker platform requires user identity management, multi-tenant row isolation, and session management. While database Row-Level Security (RLS) policies (`auth.uid() = user_id`) were implemented in database migrations, a standalone bounded context for user authentication was needed to orchestrate login, session restoration, session refresh, and logout workflows.

## Decision
1. **Domain Model & Identity**:
   - `UserSession` is the aggregate root in `src/features/auth/domain` owning `userId: UserId | null`, `email: EmailAddress | null`, `status: AuthStatus`, `createdAt: Date`, `expiresAt: Date | null`.
   - `AuthStatus` enum represents core domain states: `UNAUTHENTICATED`, `AUTHENTICATED`, `EXPIRED`.
   - Invariants: Authenticated sessions require non-empty `UserId`, valid `EmailAddress`, and explicit `expiresAt`. Expired sessions cannot transition back to authenticated without re-authentication.

2. **Bearer Token & Infrastructure Isolation**:
   - Bearer access tokens, refresh tokens, and raw Supabase SDK handles remain **strictly outside** the Domain layer.
   - Infrastructure (`SupabaseAuthProvider`, Secure Storage) manages token transport and mapping via `AuthMapper`.

3. **Provider Abstraction & Credentials**:
   - `IAuthProvider` defines the Application-layer provider abstraction.
   - `AuthCredentials` (`email`, `password`) encapsulates login inputs as a uniform contract.

4. **Application Orchestration Use Cases**:
   - Single-responsibility use cases: `LoginUseCase`, `LogoutUseCase`, `GetSessionUseCase`, `RestoreSessionUseCase`, `RefreshSessionUseCase`.

5. **Presentation Architecture**:
   - `AuthViewModel` exposes presentation-ready state (`isAuthenticated`, `userEmail`, `userId`, `status`).
   - `AuthController` manages reactive state updates and subscriptions.
   - `LoginScreen` renders UI components with black/red accent theme and accessibility labels.

6. **Route Boundary (ADR-011)**:
   - Screen routes reside in `app/auth.tsx` as thin wrappers rendering `LoginScreen`.

## Consequences
- **Positive**: Complete framework independence—the core authentication domain contains 0 Supabase or network dependencies.
- **Positive**: Clean Architecture compliance across all 5 layers with 100% test coverage.
- **Negative**: Requires mapper translation between Supabase Auth session payloads and `UserSession` domain aggregates.
