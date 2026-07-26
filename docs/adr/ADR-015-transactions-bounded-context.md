# ADR-015: Transactions Bounded Context Architecture

* **Status:** ✅ Approved & Frozen
* **Date:** 2026-07-25
* **Author:** Antigravity AI & Architecture Team

---

## Context & Problem Statement

The Finance Tracker application requires a single, accurate, and immutable record of **how money moves**. Previously, accounts maintained static balance fields or underspecified ledger entries, introducing potential synchronization drift, balance duplication, and ambiguous transfer semantics.

The **Transactions** bounded context establishes the transaction ledger as the single source of financial truth.

---

## Architectural Decisions

### 1. Single Ledger Entry Model (No `destination_account_id`)
Every row in the `transactions` table and every `Transaction` aggregate instance represents **exactly one ledger movement** referencing a single `account_id`. Transfers do not store a `destination_account_id` column. Paired transfer entries exist as separate rows linked solely by a shared `transfer_group_id`.

### 2. Transfer Integrity Invariant
- Every `transfer_group_id` represents **exactly one logical transfer**.
- Every `transfer_group_id` must contain **exactly two non-voided ledger entries**:
  - One `TRANSFER_OUT` (debit from source account)
  - One `TRANSFER_IN` (credit to destination account)
- Both entries must:
  - Belong to the same user
  - Reference different `account_id` values
  - Have identical positive `Money` amounts (`amount > 0`)
  - Share the same `transfer_group_id`
- **Validation**: Enforced in the Application layer (`ExecuteTransferUseCase`).
- **Atomic Persistence**: Enforced in the Infrastructure layer via `saveMany([sourceEntry, destEntry])`.

### 3. Strict Positive Money & Directional Types
Monetary values are strictly positive (`amount > 0`). Financial movement direction is determined **exclusively** by `TransactionType`:
- `EXPENSE`: Money leaving `account_id` (-)
- `INCOME`: Money entering `account_id` (+)
- `TRANSFER_OUT`: Outward transfer from source `account_id` (-)
- `TRANSFER_IN`: Inward transfer to destination `account_id` (+)

### 4. Derived Account Balances
Account balances are derived dynamically from non-voided transactions:
$$\text{Current Balance} = \text{Opening Balance} + \text{Income} + \text{Transfers In} - \text{Expenses} - \text{Transfers Out}$$
Balances are never persisted or cached independently.

### 5. Append-Only Ledger & Soft-Voiding Audit Trail
Transactions are never deleted from financial history. Reversals or cancellations mark records with `voided_at TIMESTAMPTZ NULL` (`voidedAt: Date | null`) to preserve complete audit trails.

### 6. Historical Account Preservation
Archiving an account prevents *new* transaction entry against that account (`ARCHIVED_ACCOUNT_TRANSACTION_REJECTED`) while permanently preserving all historical transactions.

---

## Consequences & Compliance

- **Consistency**: Eliminates balance drift across presentation and persistence layers.
- **Auditability**: Complete financial audit trail maintained via soft-voiding.
- **Safety**: Atomic transfer creation and updates prevent orphan or half-completed transfers.
