# Logging Standards

## Principles

- Use structured logging.
- Choose the appropriate log level.
- Never log sensitive information.
- Log meaningful events.

## Log Levels

- DEBUG
- INFO
- WARN
- ERROR
- FATAL

## Layer Responsibilities

### UI
User interactions and unexpected UI errors.

### Services
Business operations and workflow events.

### Repositories
Database and persistence events.

### Infrastructure
Application lifecycle events.

## Event Naming

Use consistent event names.

Examples:

- expense.created
- budget.updated
- auth.login
- validation.failed

## Logger Interface

All logging should go through the application's logger abstraction rather than directly using `console`.