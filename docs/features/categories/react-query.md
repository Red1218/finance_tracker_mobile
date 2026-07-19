# Categories React Query

## Purpose

Manages server state for categories.

## Responsibilities

- Fetch data
- Cache data
- Synchronize data
- Invalidate cache
- Handle loading and error states

## Query Keys

- categories
- categories.list
- categories.detail

## Mutations

- Create
- Update
- Archive
- Restore
- Delete

## Cache Strategy

Invalidate only affected queries.

## Loading

Use React Query state.

## Errors

Display business-level errors returned by the Service layer.