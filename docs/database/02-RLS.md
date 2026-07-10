# Finance Tracker v2: Row-Level Security

## Purpose

Row-level security enforces the Domain Model rule that a user's data cannot be accessed by, merged with, or modified by another user. It is mandatory for every database table and every database view that exposes user-owned data.

Authentication credentials remain outside the application tables. An authenticated actor may operate only within the profile identifier that matches the actor's authenticated identity.

## Universal Rules

- Row-level security is enabled before a user-owned table or view is exposed to an application client.
- Every select, insert, update, and delete decision evaluates the authenticated actor against the row owner.
- A user-scoped read can return only rows whose user_id equals the authenticated actor. Profiles use id as the ownership key.
- A user-scoped write can create or retain only rows whose user_id equals the authenticated actor.
- Client-supplied user_id values are not trusted. The policy must reject any attempted mismatch.
- No policy may grant access through a client-provided role, email address, display name, category name, card name, or other mutable attribute.
- Elevated administrative access, if introduced, is a separate operational boundary and requires an accepted ADR. It must not be available to the mobile client.
- A new table or view containing user-owned data cannot be released until its RLS policy is tested.

## Table Policy Matrix

| Table | Select | Insert | Update | Delete |
| --- | --- | --- | --- | --- |
| profiles | Own profile only | Own profile only during registration lifecycle | Own profile only | No routine client delete; account-deletion lifecycle only |
| user_preferences | Own row only | Own row only during profile provisioning | Own row only | No routine client delete |
| categories | Own rows only | Own Custom rows only; Protected rows through controlled provisioning | Own Custom rows only | Own Custom rows only when reassignment integrity is satisfied |
| budgets | Own rows only | Own rows only | Own rows only | Own rows only |
| credit_cards | Own rows only | Own rows only | Own rows only, including archive | No routine client delete |
| expenses | Own rows only | Own rows only with same-user references | Own rows only with same-user references | Own rows only |
| borrowings | Own rows only | Own rows only | Own rows only | Own rows only with linked repayments removed atomically |
| repayments | Own rows only | Own rows only against own Borrowing | Own rows only against own Borrowing | Own rows only against own Borrowing |

## Write Integrity Requirements

RLS is necessary but not sufficient for financial integrity. Write paths must also enforce the following conditions at the database boundary:

- An Expense category belongs to the same user as the Expense.
- An Expense credit card, when present, belongs to the same user as the Expense.
- Credit payment requires a card, and non-credit payment forbids a card.
- A Repayment borrowing belongs to the same user as the Repayment.
- A new or changed Repayment cannot make the parent borrowing's repayment total exceed its original amount.
- A Protected Category cannot be changed or deleted by a client.
- A Custom Category cannot be deleted while Expenses still reference it, except through the approved reassignment operation.
- An Archived CreditCard cannot receive a new Expense.
- At most one active CreditCard is default for a user.
- Case-insensitive category and credit-card name uniqueness is enforced within the authenticated user's ownership scope.

## View Policies

- A user-owned view must inherit the caller's authenticated user scope. It must never run as an unrestricted data reader.
- A view may expose only the source rows the caller could read directly.
- A view must not expose user_id values, notes, counterparty names, or financial amounts from another user through aggregation, joins, ordering, or error messages.
- Views are read-only. No view permits mutation of underlying financial facts.
- A change to a view's ownership behavior, execution context, or underlying access path requires an ADR and contract tests.

## Account Lifecycle Rules

- Successful registration provisions a Profile, User Preferences, and the protected Categories for the new user in one account-initialization lifecycle.
- Logout removes active client session and cache state; it does not delete server-authoritative rows.
- Account deletion removes the profile and every owned business row through a controlled lifecycle. It cannot leave orphaned rows.
- Failed provisioning must not leave a usable partial account state. The lifecycle either completes all required rows or reports failure for recovery.

## Verification Requirements

RLS verification must include, at minimum:

1. A user can read and modify each permitted own row.
2. A user cannot read, create, update, or delete another user's row.
3. A user cannot attach an own Expense or Repayment to another user's related record.
4. A client cannot create, rename, or delete Protected Categories.
5. An archived card cannot receive an Expense.
6. A view returns no rows or aggregates for a user with no eligible source records.
7. Account deletion removes all data owned by the deleted account and no data owned by any other account.
