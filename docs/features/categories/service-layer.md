# Categories Service Layer

## Purpose

Coordinates business workflows for categories.

## Responsibilities

- Validate input
- Apply business rules
- Coordinate repositories
- Translate persistence errors
- Emit business events
- Return domain models

## Business Rules

- Unique names per user and type
- Prevent deletion of categories in use
- Prevent modification of protected system categories
- Archive instead of delete when appropriate

## Workflows

- Create
- Update
- Archive
- Restore
- Delete
- Search
- List

## Logging

Emit structured business events for significant operations.