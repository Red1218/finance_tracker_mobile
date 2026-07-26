# Architecture Guidelines & ADR Process

## Architectural Layers

### Presentation / UI
Responsible strictly for rendering, layout, and user interaction. Presentation components consume ViewModels and Presentation Controllers only. Business logic must **never** exist in the UI layer.

### Application
Responsible for orchestrating use cases, command/query handling, and application workflows. Application use cases are single-responsibility and enforce application-level invariants.

### Domain
The core business model containing Aggregates, Value Objects, Domain Events, and pure Domain Errors. The Domain layer is independent and holds zero framework or database dependencies.

### Infrastructure / Persistence
Responsible for persistence, database interaction, Supabase client integration, and Row-Level Security. Infrastructure adapters implement Application repository interfaces and map persistence rows to domain aggregates through anti-corruption boundaries (Mappers).

## Clean Architecture Dependency Rule

Dependencies flow strictly inward towards the core domain:

`Presentation → Application ← Infrastructure`
`              ↓            `
`            Domain          `

Business logic must not leak into Presentation, Repositories, or Mappers.

---

## ADR Process & Structure

All architectural decisions are documented as numbered ADRs in this directory following `ADR_TEMPLATE.md` and registered in `INDEX.md`.
