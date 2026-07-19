# Validation Standards

## Principles

- Validation is centralized.
- Validation is reusable.
- Validation is predictable.
- Database remains the final authority.

## Validation Layers

### Client
User experience.

### Service
Business rules.

### Database
Integrity and security.

## Validation Flow

User → Client → Service → Database

## Schema Standard

Validation schemas should be reusable and act as the single source of truth.

## Technology

Use Zod for runtime validation and TypeScript type inference.

## Schema Evolution

Breaking validation changes should be versioned or migrated deliberately.