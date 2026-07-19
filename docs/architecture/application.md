## Folder Structure

### app/
Application bootstrap.

### features/
Feature-specific implementation.

### components/
Reusable UI components.

### shared/
Code shared between features.

### lib/
Infrastructure and external integrations.

## Import Rules

- Features may import from Shared and Lib.
- Shared may import from Lib.
- Features must not import directly from other features.

## Public API

Each feature should expose an `index.ts` that acts as its public API.