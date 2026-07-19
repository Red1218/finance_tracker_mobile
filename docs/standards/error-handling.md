# Error Handling Standard

## Principles

- Errors are typed.
- Errors are actionable.
- Errors are user-friendly.
- Unexpected errors are logged.

## Error Categories

- Validation
- Business Rule
- Authentication
- Authorization
- Database
- Unknown

## Error Flow

Repository → Service → UI

Repositories throw technical errors.

Services map technical errors to application errors.

UI displays user-friendly messages.

## Logging

Expected errors are generally not logged.

Unexpected errors are logged.

## Error Codes

Every custom application error should have a stable error code.