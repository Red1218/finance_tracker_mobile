# Application Architecture

## Layers

### UI
Responsible for rendering and user interaction.

### Services
Responsible for business logic and workflows.

### Repositories
Responsible for all database interactions.

### Database
Responsible for persistence, integrity, and security.

## Dependency Rule

Dependencies flow only in the following direction:

UI → Services → Repositories → Database

Business logic must not exist in the UI or repositories.