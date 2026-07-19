# State Management

## Principles

- Keep state local whenever possible.
- Separate server state from UI state.
- Never duplicate derived state.
- Introduce global state only when justified.

## State Categories

### Server State

Use TanStack Query.

### UI State

Use React state.

### Form State

Use React Hook Form.

### Session State

Use Context.

### Derived State

Compute rather than store.

## Data Flow

Supabase → Repository → Service → React Query → UI

## Global State

Only introduce a dedicated global state library when application requirements justify it.