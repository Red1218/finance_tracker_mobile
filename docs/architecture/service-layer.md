# Service Layer

## Purpose

The Service Layer coordinates business workflows.

## Responsibilities

Services:

- Coordinate repositories.
- Apply business rules.
- Execute workflows.
- Handle transactions.
- Translate persistence errors.
- Return domain models.

Services do not:

- Access the database directly.
- Render UI.
- Know about React components.

## Dependency Flow

UI → Service → Repository → Database

## Transaction Rule

Multi-step business operations are coordinated by the Service Layer.

## Error Translation

Repositories throw technical errors.

Services translate them into business-level errors when appropriate.