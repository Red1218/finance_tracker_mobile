# Categories Database Design

## Purpose

Defines the database schema for categories.

## Table

Categories store user-defined and system-defined transaction groups.

## Constraints

- Primary Key
- Foreign Key
- NOT NULL
- Unique name per user and type

## Relationships

User → Categories → Expenses

## Indexes

Optimize lookups by:

- user
- type
- archived state
- name

## Security

Protected by Row Level Security.

## Archive

Categories should be archived rather than deleted whenever historical data exists.

## Migration Order

1. Enum
2. Table
3. Indexes
4. Constraints
5. RLS
6. Policies
7. Seed Data