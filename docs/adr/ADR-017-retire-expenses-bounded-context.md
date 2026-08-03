# ADR 017: Retirement of Expenses Bounded Context

**Status:** Accepted
**Date:** 2026-08

## Context

The initial application architecture utilized an `Expenses` bounded context and a corresponding `public.expenses` database table.
However, as the application evolved to support double-entry accounting principles and a more robust financial tracking model, the `Transactions` bounded context was introduced. 

This resulted in redundant schemas, dual maintenance of data layers, and potential bugs where some views pulled from the legacy `expenses` table while others used the canonical `transactions` ledger.

## Decision

We have decided to completely retire and remove the `Expenses` bounded context and any code that queries `public.expenses`.

All expense-related reads and writes must now originate from the `Transactions` ledger and associated Application use cases. The `Transactions` context becomes the canonical bounded context for financial events (income, expenses, and transfers).

## Consequences

- Improved maintainability by having a single `Transactions` schema.
- Prevention of data mismatch bugs caused by disjointed persistence layers.
- The `src/features/expenses` and `src/platform/persistence/expenses` directories have been deleted.
- UI elements (such as Dashboard components) have been migrated to map `transactions` data to their expected snapshots.
