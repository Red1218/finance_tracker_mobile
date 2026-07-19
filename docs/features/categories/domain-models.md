# Categories Domain Models

## Purpose

Defines the business representation of categories.

## Core Model

Category represents a user-owned transaction category.

## DTOs

- CreateCategoryInput
- UpdateCategoryInput
- ArchiveCategoryInput

## View Models

Use dedicated view models for UI presentation.

## Mapping

Database Row → Domain Model → View Model

## Invariants

A valid category must:

- Have a valid name
- Have a valid type
- Belong to a user
- Use approved icon and color values