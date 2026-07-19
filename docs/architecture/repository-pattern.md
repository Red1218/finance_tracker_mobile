# Repository Pattern

## Purpose

Repositories provide data access for the application.

## Responsibilities

Repositories:

- Read data.
- Create data.
- Update data.
- Delete data.
- Map database models.
- Translate persistence errors.

Repositories do not contain business logic.

## Dependency Flow

UI → Service → Repository → Database

## Structure

Each feature owns its own repository.

## Mapping

Database rows are mapped to domain models.

## Errors

Repositories throw persistence-related errors only.