# Type Standards

## Principles

- Types model the business domain.
- Database types remain inside repositories.
- DTOs define service contracts.
- View models prepare data for the UI.

## Type Categories

### Domain Types
Business concepts.

### Database Types
Persistence models.

### DTOs
Input and output contracts.

### View Models
Presentation-specific models.

## Organization

- Feature-specific types stay with the feature.
- Shared types belong in `shared/types`.

## Naming

Use descriptive, intention-revealing names.

## Immutability

Prefer immutable types where appropriate.