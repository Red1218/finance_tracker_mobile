# Categories Repository

## Purpose

Provides persistence for categories.

## Responsibilities

- Read
- Create
- Update
- Archive
- Delete
- Map database rows
- Translate persistence errors

## Interface

Expose business-oriented methods.

## Mapping

Database Row → Domain Model

Domain Model → Database Payload

## Errors

Repositories throw persistence-related errors only.

## Organization

Separate:

- Queries
- Mapping
- Errors
- Implementation