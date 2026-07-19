# Shared Type System

This directory contains the canonical TypeScript definitions for the application, acting as the Single Source of Truth for all layers (Repository, Service, UI, API).

## Architectural Boundaries & Dependency Direction

The type system is strictly partitioned to prevent database-specific concepts (e.g., `snake_case` column names) from leaking into the domain logic. The dependency flow moves entirely in one direction:

```
Database (PostgreSQL)
↓
Generated Database Types (src/shared/types/generated/database.ts)
↓
Shared Types (src/shared/types/category.types.ts)
↓
Repository Layer (Mappers)
↓
Service Layer (Business Logic)
↓
React Query / React Components
```

### 1. Generated Database Types (`generated/database.ts`)
**Ownership:** Completely managed by the Supabase CLI (`supabase gen types typescript`).
**Rule:** NEVER manually edit this file. It is the absolute bottom layer of the system.

### 2. Domain Models (`category.types.ts`)
**Ownership:** Application Developer.
**Rule:** The mapped representations used by the application (`Category`). Repositories convert `Database['public']['Tables']['categories']['Row']` into `Category`.

### 3. Data Transfer Objects (DTOs)
**Ownership:** Application Developer.
**Rule:** Used for mutating data (e.g., `CreateCategoryDTO`). These restrict inputs based on business rules (e.g., intentionally omitting `is_system` from updates to match RLS boundaries).

### 4. API Wrappers (`api.types.ts`)
**Ownership:** Application Developer.
**Rule:** Standardized JSON responses for the presentation layer. Leverages Discriminated Unions for strict UI error handling.

## Import Rules & Examples

**1. Always import from the barrel file (`index.ts`)**
✅ **Correct:** `import { Category, CreateCategoryDTO } from '@/shared/types'`
❌ **Incorrect:** `import { Category } from '@/shared/types/category.types'`

**2. Never expose Database rows to the Service or UI layers**
✅ **Correct:** Repositories return `Promise<Category>`
❌ **Incorrect:** Repositories return `Promise<Database['public']['Tables']['categories']['Row']>`

**3. Use DTOs for mutations**
✅ **Correct:** A React form uses `UpdateCategoryDTO` to submit changes.
❌ **Incorrect:** A React form uses `Partial<Category>` (which could incorrectly imply `isSystem` is mutable).

**4. Use Branded Types**
✅ **Correct:** A function expects a user ID as `function getUserCategories(userId: UUID)`.
❌ **Incorrect:** A function expects a user ID as `function getUserCategories(userId: string)`. Branded types (`UUID`) prevent passing raw, unvalidated strings by accident.
