# Categories UI Components

## Purpose

Defines the UI component structure for the Categories feature.

## Principles

- Single Responsibility
- Props over Fetching
- Reuse shared components
- Accessible by default

## Component Hierarchy

- CategoriesPage
- CategoriesToolbar
- CategoryList
- CategoryCard
- CategoryDialog
- CategoryForm
- ArchiveDialog
- DeleteDialog
- EmptyState
- LoadingSkeleton
- ErrorState

## Organization

Keep feature components inside the feature directory.

## Accessibility

Every interactive component must support keyboard navigation, semantic HTML, and proper ARIA attributes.