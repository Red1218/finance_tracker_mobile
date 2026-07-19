# Categories Validation

## Purpose

Defines validation rules for category management.

## Fields

### Name

- Required
- 1–50 characters
- Trimmed
- Case-insensitive uniqueness

### Type

- expense
- income

### Icon

Must be selected from the approved icon library.

### Color

Must use the design system palette or a validated HEX value.

## Business Rules

- Duplicate names are not allowed within the same user and type.
- Categories with transactions cannot be deleted.
- Category type cannot change after transactions exist.

## Error Messages

Provide clear, user-friendly feedback.

## Validation Flow

UI → Zod → Service → Database