# Reporting Phase 5.1 Integration Design

**Status:** Draft

## Integration Responsibilities
The Integration layer is responsible for:
* Wiring all reporting layers together.
* Creating concrete repository implementations.
* Injecting dependencies.
* Connecting Presentation to Application.
* Connecting Application to Domain.
* Connecting Domain contracts to Infrastructure implementations.
* Containing no business rules.
* Containing no SQL.
* Containing no UI rendering logic.

## Dependency Graph
```text
ReportingScreen
        ↓
Presentation Hook
        ↓
Application Use Case
        ↓
ReportingRepository
        ↓
ReportingRepositoryImpl
        ↓
ReportingDataSource
        ↓
Database
```

## Dependency Injection
* ReportingRepositoryImpl is injected into every Application use case.
* Application use cases are injected into Presentation hooks.
* Presentation hooks are consumed by ReportingScreen.
* Child components never construct dependencies.

## Dependency Lifetime
- ReportingRepositoryImpl is created once and shared by all reporting use cases.
- Application use cases are long-lived and reused.
- Presentation hooks are created per ReportingScreen instance.
- UI components do not own dependencies.

## Lifecycle
1. ReportingScreen loads.
2. Presentation hook executes.
3. Application use case validates request.
4. Repository retrieves data.
5. Data source executes database query.
6. Repository maps persistence models into Domain projections.
7. Application maps Domain projections into Response DTOs.
8. Presentation renders immutable UI state.

## Failure Propagation
- Infrastructure returns repository-level errors.
- Application propagates errors without converting them into UI state.
- Presentation hooks convert application errors into UI state.
- ReportingScreen renders the appropriate Error State.

## Integration Rules
* Dependencies flow in one direction only.
* Lower layers never depend on higher layers.
* Domain remains independent.
* Infrastructure is replaceable.
* Presentation communicates only through Application.

## Not Included
This phase must NOT define:
* Dependency injection framework
* Service locator
* SQL
* Supabase
* React implementation
* TypeScript
* API endpoints
* Styling
* Charts implementation

---
**Status:**
Draft
Pending Review
