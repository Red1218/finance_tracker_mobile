# ADR-022: Bills Bounded Context Architecture

* **Status:** ✅ Approved & Frozen
* **Date:** 2026-08-21
* **Author:** Antigravity AI & Architecture Team

---

## 1. Title

ADR-022: Bills Bounded Context Architecture

---

## 2. Status

🟢 **APPROVED & FROZEN**

---

## 3. Context

The Finance Tracker application requires an **Upcoming Bills** user experience on the Dashboard Home screen to give users visibility into upcoming, due-today, and overdue payment obligations.

Currently, the system has bounded contexts for:
- **Accounts** (`ADR-014`): Source of truth for money holders and derived balances.
- **Transactions** (`ADR-015`): Canonical financial ledger for completed historical financial movement.
- **Categories** (`ADR-012`): Classification system.
- **Budgets** (`ADR-016`): Planning constructs for spending limits.
- **Preferences** (`ADR-013`): User notification and locale settings.
- **Reporting** (`ADR-019`): Read-only analytical CQRS projections.

An exhaustive codebase audit confirmed that **no domain entity, value object, database table, repository, or application use case exists for Bills or recurring payment obligations**.

### Why Transactions Cannot Represent Upcoming Bills

Transactions record completed ledger movements (`occurred_at`). Attempting to represent upcoming or future bills by creating "future transactions" or pseudo-ledger rows would introduce severe architectural defects:

1. **Incorrect Balances**: Derived account balances ($\text{Balance} = \text{Opening} + \text{Income} - \text{Expense}$) would be corrupted by including money that has not actually moved.
2. **Distorted Budget Consumption**: `BudgetHealthService` queries non-voided `EXPENSE` transactions. Unpaid future bills would incorrectly consume budget limits prior to payment.
3. **Corrupted Analytical Reporting**: Reporting read models (`ADR-019`) rely on `public.transactions`. Future entries would skew income/expense totals and net savings calculations.
4. **Violation of Transaction Bounded Context Semantics**: `ADR-015` mandates that transactions are completed, single-account ledger entries representing actual money movement.
5. **Violation of ADR-015 Invariants**: Transactions do not support fields like `due_date`, `recurrence_rule`, `is_paid`, or `payment_status`.

Therefore, a dedicated **Bills bounded context** is required to manage payment obligations, recurring schedules, and due dates independently of the financial ledger.

---

## 4. Problem Statement

How should Finance Tracker model, persist, schedule, and project upcoming bill obligations without corrupting the canonical transaction ledger, polluting existing bounded contexts, or creating tight coupling between period-based reporting and absolute due dates?

---

## 5. Decision

Establish a new, dedicated **Bills Bounded Context** following Domain-Driven Design (DDD) and Clean Architecture principles.

The Bills context will act as the authoritative domain for tracking payment commitments, due dates, recurring schedules, and payment state. It will interface with the **Transactions** context via explicit application-layer use cases and integration ports when a bill is marked as paid, preserving ledger immutability and balance accuracy.

---

## 6. Domain Design & Aggregate Boundaries

### Aggregate Boundary Decision: Separate `BillPayment` Entity vs Embedded Array

The design evaluated two aggregate structures:
- **Option A (Rejected)**: Embed `paymentHistory: PaymentRecord[]` directly inside the `Bill` aggregate root.
- **Option B (Approved Decision)**: Model `Bill` as a compact aggregate root and persist `BillPayment` as a separate entity/table linked by `billId`.

#### Rationale for Option B (Separate `BillPayment` Entity)
1. **Aggregate Size & Memory Footprint**: For a long-lived recurring bill (e.g. a monthly utility bill paid over 10 years), embedding payments causes unbounded aggregate growth (120+ array entries), inflating memory and serialization costs.
2. **Concurrency & Lock Contention**: Mutating bill metadata (e.g. updating name or amount) should not conflict with recording historical payment receipts.
3. **Clean Persistence Mapping**: Relational database schemas mapping 1-to-N history tables perform better when queried independently.
4. **Clean Architecture Symmetry**: Mirrors `Accounts` (money holder) vs `Transactions` (ledger entries) where historical entries exist as separate records rather than embedded array state inside the account aggregate.

### `Bill` Aggregate Root Structure

```typescript
export class Bill {
  private constructor(
    public readonly id: BillId,
    public readonly userId: UserId,
    private _name: BillName,
    private _amount: MonetaryAmount,
    private _categoryId: CategoryId | null,
    private _recurrence: RecurrenceRule,
    private _nextDueDate: BillDueDate,
    public readonly createdAt: Date,
    private _updatedAt: Date,
    private _archivedAt: Date | null
  ) {}

  get name(): BillName { return this._name; }
  get amount(): MonetaryAmount { return this._amount; }
  get categoryId(): CategoryId | null { return this._categoryId; }
  get recurrence(): RecurrenceRule { return this._recurrence; }
  get nextDueDate(): BillDueDate { return this._nextDueDate; }
  get updatedAt(): Date { return this._updatedAt; }
  get archivedAt(): Date | null { return this._archivedAt; }
  get isArchived(): boolean { return this._archivedAt !== null; }

  public markArchived(now: Date = new Date()): void {
    if (this._archivedAt !== null) {
      throw new BillDomainError(BillDomainErrorCode.BILL_ALREADY_ARCHIVED);
    }
    this._archivedAt = now;
    this._updatedAt = now;
  }

  public advanceToNextOccurrence(now: Date = new Date()): void {
    if (this._recurrence.type === RecurrenceType.NONE) {
      this.markArchived(now);
      return;
    }
    this._nextDueDate = this._recurrence.nextOccurrence(this._nextDueDate);
    this._updatedAt = now;
  }
}
```

---

## 7. Value Objects & Recurrence Anchoring

### `BillName`
- Encapsulates non-empty, trimmed string.
- Invariants: Minimum 1 character, maximum 100 characters. Throws `BillDomainError.INVALID_NAME` on violation.

### `MonetaryAmount`
- Reuses the project's canonical monetary value object from domain.
- Invariants: Strictly positive numeric amount (`amount > 0`), valid ISO-4217 3-letter currency code (e.g. `INR`, `USD`). Throws `BillDomainError.INVALID_AMOUNT` if non-positive.

### `BillDueDate`
- Wraps UTC Date representing midnight of the due date.
- Key Domain Methods:
  - `isToday(asOf: Date): boolean` — returns true if due date matches `asOf` calendar date.
  - `isOverdue(asOf: Date): boolean` — returns true if due date is prior to `asOf` calendar date.
  - `daysUntilDue(asOf: Date): number` — calculates difference in calendar days.

### `RecurrenceRule` (Calendar-Based Anchor Recurrence)
- Supported Types: `NONE`, `WEEKLY`, `BIWEEKLY`, `MONTHLY`, `QUARTERLY`, `YEARLY`.
- **Anchor Day-of-Month (`anchorDayOfMonth: number`)**: Stores the originally intended calendar day of the month (1–31).

#### Calendar-Based Recurrence & Clamping Rules
1. **Intended Schedule Anchor**:
   - Recurrence calculations for `MONTHLY`, `QUARTERLY`, and `YEARLY` are ALWAYS computed relative to the original `anchorDayOfMonth`, NOT calculated cumulatively from a previously clamped date.
   - *Example*: A monthly bill set for the 31st (Jan 31) advances to Feb 28 (or Feb 29 in leap year) due to month-end clamping. When advancing from Feb to March, the system uses the anchor day 31 to compute **March 31**, preventing permanent day-drift to the 28th.
2. **Month-End Clamping**:
   - When advancing to a target month that has fewer days than `anchorDayOfMonth` (e.g., Feb, April 30th for 31st anchor), the due date **clamps to the last valid day of the target month**.
3. **Leap Years (Feb 29)**:
   - A yearly bill set on Feb 29 in a leap year recurs on Feb 28 in non-leap years, and restores to Feb 29 in leap years.
4. **Time-Zone Normalisation**:
   - All due dates are stored and evaluated exclusively in **UTC midnight (`00:00:00.000Z`)** or ISO-8601 string dates (`YYYY-MM-DD`). Local device time offsets are stripped during domain instantiation.

---

## 8. Bill Lifecycle & Derived Status Resolution

### State Model

```
                    ┌──────────────┐
                    │   Upcoming   │ (nextDueDate > today && archivedAt == null)
                    └──────┬───────┘
                           │ (date reaches today)
                    ┌──────▼───────┐
                    │   DueToday   │ (nextDueDate == today && archivedAt == null)
                    └──────┬───────┘
                           │ (date passes today)
                    ┌──────▼───────┐
                    │   Overdue    │ (nextDueDate < today && archivedAt == null)
                    └──────┬───────┘
                           │ (marked paid)
             ┌─────────────┴─────────────┐
             ▼                           ▼
 ┌──────────────────────┐    ┌──────────────────────┐
 │ Recurred to Next     │    │ Completed / Archived │
 │ (recurrence != NONE) │    │ (recurrence == NONE) │
 │ nextDueDate advanced │    │ archivedAt set       │
 │ status -> Upcoming   │    │ status -> Archived   │
 └──────────────────────┘    └──────────────────────┘
```

### Absolute Rule: `Paid` is NOT a Bill Lifecycle Status

- **`BillStatus` Enumeration**: `Upcoming | DueToday | Overdue | Archived`.
- **Derived Status Invariant**: `BillStatus` is strictly derived dynamically from `nextDueDate`, `archivedAt`, and current date (`asOf`). `Paid` does NOT exist as a persistent or derived `BillStatus` on the `Bill` aggregate root.
- **Payment State Ownership**: Payment records live exclusively in `BillPayment`.
- **Lifecycle Transition on Payment**:
  - For **recurring bills** (`recurrence !== NONE`): Executing `MarkBillPaidUseCase` records a `BillPayment`, advances `nextDueDate` to the next occurrence, and the `Bill` immediately derives status `Upcoming` (or `DueToday`/`Overdue` if the next date is reached).
  - For **non-recurring bills** (`recurrence === NONE`): Executing `MarkBillPaidUseCase` records a `BillPayment`, sets `archivedAt = now`, and the `Bill` derives status `Archived`.

---

## 9. Payment Model Rationale (Separate `BillPayment` Entity)

```typescript
export class BillPayment {
  constructor(
    public readonly id: string,
    public readonly billId: BillId,
    public readonly occurrenceKey: string, // YYYY-MM-DD string derived from nextDueDate
    public readonly userId: UserId,
    public readonly paidAt: Date,
    public readonly amount: MonetaryAmount,
    public readonly linkedTransactionId: string | null,
    public readonly createdAt: Date
  ) {}
}
```

### Invariants:
- `BillPayment` records historical settlement of a bill obligation for a specific recurrence cycle occurrence.
- `BillPayment` is immutable once created.
- `occurrenceKey` is deterministically computed from the `Bill`'s `nextDueDate` (e.g. `2026-08-21`).

---

## 10. Transaction Integration Boundary & Payment Idempotency

### Mandatory Invariants
1. **Separation of Concerns**: `BillPayment` records settlement of a Bill obligation. The `Transactions` context remains sole authority for actual money movement. `BillPayment` never participates directly in balance, expense, budget, or reporting calculations.
2. **Dependency Inversion**: The Bills application layer does **NOT** import, access, or directly invoke `CreateTransactionUseCase` or `ITransactionRepository` from the `Transactions` context.

### Integration Architecture (Port & Adapter Pattern)

```
Bills Bounded Context
┌──────────────────────────────────────────────┐
│  MarkBillPaidUseCase                        │
│        │                                     │
│        ▼                                     │
│  IBillTransactionPort (Application Port)     │
└────────┬─────────────────────────────────────┘
         │ (implements interface)
Integration Layer Adapter
┌────────▼─────────────────────────────────────┐
│  BillTransactionAdapter                      │
│        │ (translates contract)               │
│        ▼                                     │
│  Transactions Bounded Context                │
│  (CreateTransactionUseCase / Repository)      │
└──────────────────────────────────────────────┘
```

- **`IBillTransactionPort`** resides in `src/features/bills/application/ports/IBillTransactionPort.ts`.
- **`BillTransactionAdapter`** resides in `src/features/bills/integration/BillTransactionAdapter.ts`.
- **Decoupling Rules**:
  - Bills does not import or directly invoke Transactions implementation classes.
  - Bills does not access Transactions repositories.
  - Bills does not duplicate transaction creation logic.
  - Transactions remains authoritative for actual financial movement.
  - The integration adapter translates between bounded-context contracts.

### Execution Contract: `MarkBillPaidUseCase`

`MarkBillPaidUseCase` accepts an execution command specifying one of three explicit transaction modes:

1. **`AUTO_CREATE`**: Invokes `IBillTransactionPort.createExpenseTransaction({ userId, accountId, amount, description, date })`. The integration adapter delegates to the Transactions bounded context and returns the generated `transactionId`, which is stored in `BillPayment.linkedTransactionId`.
2. **`LINK_EXISTING`**: Invokes `IBillTransactionPort.verifyTransactionExists(transactionId)`. Stores `transactionId` in `BillPayment.linkedTransactionId`.
3. **`UNLINKED`**: Creates `BillPayment` with `linkedTransactionId = null` (e.g. cash payment or unmanaged bank auto-debit).

### Cardinality Rules
- Exactly one `BillPayment` references 0 or 1 `Transaction`.
- One `Transaction` may be referenced by at most 1 `BillPayment`.
- **Multiple `BillPayment` records CANNOT reference the same `transactionId`.**

### Dual Idempotency & Duplicate Payment Prevention

```
Invariant 1: One Bill + One Recurrence Occurrence = Maximum One BillPayment
Invariant 2: One Transaction = Maximum One BillPayment
```

1. **Occurrence Idempotency (`UNIQUE(bill_id, occurrence_key)`)**:
   - `occurrence_key` is deterministically derived from `nextDueDate` (formatted `YYYY-MM-DD`).
   - `MarkBillPaidUseCase` checks if a `BillPayment` exists for `(billId, occurrenceKey)`. Re-executing payment for an already paid occurrence cycle is rejected with `BillDomainError.ALREADY_PAID_FOR_PERIOD`.
   - Guaranteed at database level by `UNIQUE(bill_id, occurrence_key)`.
2. **Transaction Link Idempotency (`UNIQUE(linked_transaction_id)`)**:
   - Prevents the same financial ledger transaction from being linked to multiple `BillPayment` records.
   - Guaranteed at database level by `UNIQUE(linked_transaction_id) WHERE linked_transaction_id IS NOT NULL`.

---

## 11. Application Layer & Scoped Use Cases

To prevent scope creep and adhere strictly to inside-out architecture, use cases are explicitly split into **Phase 4.2 MVP Dashboard Scope** and **Phase 4.3 Deferred Management Scope**.

### Phase 4.2 MVP Dashboard Scope (REQUIRED)

1. **`GetUpcomingBillsUseCase`**:
   - Queries active (`archivedAt IS NULL`) bills for `userId` due within a rolling date window (default: next 30 days from `asOf`).
   - Resolves derived status (`Upcoming`, `DueToday`, `Overdue`) and urgency (`critical`, `high`, `medium`, `low`).
   - Returns `UpcomingBillsReadModel[]`.

2. **`MarkBillPaidUseCase`**:
   - Handles the Dashboard quick-action to mark a bill paid.
   - Enforces transaction mode (`AUTO_CREATE`, `LINK_EXISTING`, `UNLINKED`) via `IBillTransactionPort`.
   - Creates `BillPayment`, advances or archives the `Bill`, and enforces dual idempotency.

### Phase 4.3 Deferred Scope (DEFERRED)

The following use cases are explicitly **DEFERRED to Phase 4.3 (Full Bills Management)**:
- `CreateBillUseCase`
- `UpdateBillUseCase`
- `ArchiveBillUseCase`
- `ListBillsUseCase`
- `GetBillSummaryUseCase`
- Full Bills Management UI screens

---

## 12. Repository Port Interface

```typescript
export interface IBillRepository {
  save(bill: Bill): Promise<void>;
  findById(id: BillId): Promise<Bill | null>;
  findAllByUser(userId: string): Promise<Bill[]>;
  findUpcoming(userId: string, windowDays: number, asOf: Date): Promise<Bill[]>;
  savePayment(payment: BillPayment): Promise<void>;
  findPaymentsByBill(billId: BillId): Promise<BillPayment[]>;
  findPaymentByOccurrence(billId: BillId, occurrenceKey: string): Promise<BillPayment | null>;
  delete(id: BillId): Promise<void>;
}
```

Resides in `src/features/bills/application/ports/IBillRepository.ts`.

---

## 13. Infrastructure & Persistence Schema (Supabase)

```sql
-- Migration: 202608210001_bills_bounded_context.sql

CREATE TABLE IF NOT EXISTS public.bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID NULL REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    amount NUMERIC(19, 4) NOT NULL,
    currency_code TEXT NOT NULL DEFAULT 'INR',
    recurrence_kind TEXT NOT NULL, -- 'NONE', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'
    anchor_day_of_month INTEGER NOT NULL DEFAULT 1,
    next_due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    archived_at TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT chk_bills_amount_positive CHECK (amount > 0),
    CONSTRAINT chk_bills_currency_code_length CHECK (length(currency_code) = 3),
    CONSTRAINT chk_bills_anchor_day CHECK (anchor_day_of_month >= 1 AND anchor_day_of_month <= 31)
);

CREATE TABLE IF NOT EXISTS public.bill_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id UUID NOT NULL REFERENCES public.bills(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    occurrence_key TEXT NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    amount NUMERIC(19, 4) NOT NULL,
    currency_code TEXT NOT NULL DEFAULT 'INR',
    linked_transaction_id UUID NULL REFERENCES public.transactions(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_bill_payment_occurrence UNIQUE (bill_id, occurrence_key),
    CONSTRAINT uq_bill_payment_transaction UNIQUE (linked_transaction_id)
);

CREATE INDEX idx_bills_user_upcoming 
ON public.bills(user_id, next_due_date) 
WHERE archived_at IS NULL;

CREATE INDEX idx_bill_payments_bill 
ON public.bill_payments(bill_id, paid_at);
```

---

## 14. Dashboard Integration & Period Independence

### Mandatory Architectural Boundary Rule
> **Upcoming Bills MUST NOT depend on or be re-filtered by the Dashboard Reporting Period selector (`This Month`, `Last Month`, `YTD`).**

#### Rationale:
- Reporting periods filter historical analytical metrics (`Income`, `Expenses`, `Net Cash Flow`).
- Upcoming bills represent absolute future calendar commitments relative to `today` (e.g. "due in 5 days").
- Re-filtering bills when a user views "Last Month" history would incorrectly clear or distort future commitments.

### Dashboard Projection DTO (`UpcomingBillsReadModel`)

```typescript
export interface UpcomingBillsReadModel {
  readonly billId: string;
  readonly billName: string;
  readonly formattedAmount: string;
  readonly currency: string;
  readonly nextDueDate: string; // ISO string
  readonly dueDateLabel: string; // 'Due Today', 'Tomorrow', 'In 5 days', 'Overdue by 2 days'
  readonly status: 'Upcoming' | 'DueToday' | 'Overdue' | 'Archived';
  readonly urgency: 'critical' | 'high' | 'medium' | 'low';
  readonly categoryName: string | null;
}
```

---

## 15. Security & Multi-Tenancy

1. **Row Level Security (RLS)**: Enforced via Supabase RLS policies matching `ADR-010`:
   - `CREATE POLICY bills_user_isolation ON public.bills FOR ALL USING (auth.uid() = user_id);`
   - `CREATE POLICY bill_payments_user_isolation ON public.bill_payments FOR ALL USING (auth.uid() = user_id);`
2. **Repository Isolation**: `SupabaseBillRepository` appends `.eq('user_id', userId)` to every query execution.

---

## 16. Testing Requirements

### Domain Layer Tests
- `BillName`: Rejects empty string, whitespace-only, >100 chars.
- `BillDueDate`: Verifies `isToday()`, `isOverdue()`, and `daysUntilDue()` calculation across midnight boundaries.
- `RecurrenceRule`: Verifies `nextOccurrence()` calendar anchoring (e.g. Jan 31 → Feb 28 → March 31 anchor restoration).
- `Bill`: Verifies derived status (`Upcoming`, `DueToday`, `Overdue`, `Archived`) and advancement logic.

### Application Layer Tests
- `GetUpcomingBillsUseCase`: Verifies window filtering (30 days), sorting by due date, urgency mapping.
- `MarkBillPaidUseCase`: Verifies `BillPayment` record creation, recurrence advancement, transaction mode execution via `IBillTransactionPort`, and occurrence idempotency.

### Infrastructure & Integration Tests
- `SupabaseBillRepository`: Round-trip symmetry tests, `uq_bill_payment_occurrence` and `uq_bill_payment_transaction` unique constraint enforcement.
- `BillTransactionAdapter`: Verifies boundary translation between Bills port and Transactions context.

---

## 17. Consequences & Risk Evaluation

### Positive Consequences
- **Zero Ledger Contamination**: Transactions context remains 100% authoritative for actual money movement and account balances.
- **Bounded Context Isolation**: Dependency inversion via `IBillTransactionPort` prevents Bills application layer from directly depending on Transactions implementation classes.
- **Guaranteed Idempotency**: Dual unique constraints (`uq_bill_payment_occurrence` and `uq_bill_payment_transaction`) prevent double-payment of the same cycle occurrence and double-linking of transactions.
- **Unbounded History Scalability**: Separate `BillPayment` entity prevents aggregate root memory bloat over years of recurring payments.
- **No Day-Drift**: Calendar-based recurrence anchoring preserves original schedule day-of-month across variable-length months.
- **Strict Scope Control**: Deferring CRUD and analytics use cases to Phase 4.3 prevents Phase 4.2 timeline creep.

### Identified Risks & Mitigations
1. **Accidental Double-Payment**: Mitigated by `ALREADY_PAID_FOR_PERIOD` domain check and database unique constraints `uq_bill_payment_occurrence` and `uq_bill_payment_transaction`.
2. **Timezone Off-By-One Errors**: Mitigated by strict UTC midnight normalisation (`00:00:00.000Z`).
3. **Period Selector Coupling**: Mitigated by explicit isolation of `GetUpcomingBillsUseCase` from `ChangeReportingPeriodCommand`.

---

## 18. Alternatives Considered

1. **Option 1: Direct import of `CreateTransactionUseCase` in Bills Application (Rejected)**
   - *Reason*: Violates bounded context isolation and Dependency Inversion. Replaced with `IBillTransactionPort` + `BillTransactionAdapter`.
2. **Option 2: Store `Paid` as a persistent Bill state (Rejected)**
   - *Reason*: Causes state conflicts when recurring bills advance to the next cycle. Payment belongs strictly to `BillPayment`.
3. **Option 3: Embedded Payment Array inside `Bill` (Rejected)**
   - *Reason*: Unbounded aggregate growth, memory overhead, concurrency lock contention.
4. **Option 4: Filter Bills by Dashboard Reporting Period (Rejected)**
   - *Reason*: Distorts future obligations when viewing historical reporting periods.

---

## 19. Open Questions

1. Should `BillTransactionAdapter` auto-select a default payment account if `AUTO_CREATE` is invoked without an explicit `accountId`? (Recommended: Default account from `Accounts` context).

---

STATUS: ADR-022 APPROVED & FROZEN — READY FOR BILLS IMPLEMENTATION
