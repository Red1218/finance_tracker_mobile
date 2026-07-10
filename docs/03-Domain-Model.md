# Finance Tracker v2: Domain Model

## Entities

### User
**Purpose:** To uniquely identify the individual utilizing the finance tracker and securely isolate their financial data.
**Responsibilities:** Owns all financial entities, configurations, and historical data associated with an account.
**Attributes:**
- Email Address
- Display Name (Optional)
**Relationships:**
- Root owner of all Expenses, Categories, Budgets, Credit Cards, Borrowings, and Settings.
**Invariants:**
- A User must have a valid Email Address.
- A User's data cannot be accessed by or merged with another User.
**Lifecycle:**
- *Creation:* When a person successfully registers an account.
- *Updates:* When the user modifies their email or display name.
- *Deletion:* When a user explicitly requests account deletion, triggering a cascading wipe of all owned data.

### Expense
**Purpose:** To represent a single instance of money leaving the user's possession.
**Responsibilities:** Records the exact amount, time, classification, and funding source of a purchase.
**Attributes:**
- Amount (Money)
- Date (Timestamp)
- Note (Optional text)
**Relationships:**
- Belongs to exactly one User.
- Belongs to exactly one Category.
- Belongs to exactly one Payment Method.
- May belong to exactly one Credit Card (if Payment Method is Credit).
**Invariants:**
- Amount must be strictly greater than zero.
- Date must be a valid calendar date not exceeding the current future threshold.
- If Payment Method is Credit, a Credit Card must be assigned.
**Lifecycle:**
- *Creation:* Explicitly logged by the user.
- *Updates:* User modifies the amount, category, date, payment method, or note.
- *Deletion:* Explicitly removed by the user.

### Category
**Purpose:** To classify expenses into logical, meaningful groups for analysis and budget tracking.
**Responsibilities:** Provides the taxonomy for all financial outflow.
**Attributes:**
- Name
- Type (System/Protected or Custom)
**Relationships:**
- Belongs to a User.
- Has many Expenses.
**Invariants:**
- Name cannot be empty and must be unique per user (case-insensitive).
- System/Protected categories cannot be modified or deleted.
**Lifecycle:**
- *Creation:* System generates default protected categories upon user registration; user creates custom categories.
- *Updates:* User renames a custom category.
- *Deletion:* User removes a custom category. All associated expenses must be explicitly reassigned.

### Budget
**Purpose:** To establish a financial boundary for a specific time period.
**Responsibilities:** Acts as the ceiling against which total aggregated expenses are measured.
**Attributes:**
- Limit (Money)
- Target Month (DateRange)
**Relationships:**
- Belongs to a User.
- Evaluates many Expenses.
**Invariants:**
- Limit must be greater than or equal to zero.
- Only one Budget can exist per Target Month per User.
**Lifecycle:**
- *Creation:* User defines a limit for a month.
- *Updates:* User modifies the limit for the month.
- *Deletion:* Reverting the limit to zero or falling back to a default empty state.

### CreditCard
**Purpose:** To track a revolving line of credit and monitor its utilization.
**Responsibilities:** Maintains the credit boundary and aggregates the expenses charged to it.
**Attributes:**
- Name
- Credit Limit (Money)
- Status (Active or Archived)
- Is Default (Boolean)
**Relationships:**
- Belongs to a User.
- Has many Expenses (where Payment Method is Credit).
**Invariants:**
- Credit Limit must be strictly greater than zero.
- Name must be unique per user.
- Only one Credit Card can be flagged as Default at a time.
**Lifecycle:**
- *Creation:* User adds a new card.
- *Updates:* User adjusts the name or credit limit.
- *Archival:* User archives the card to hide it from active entry without destroying historical expense links.

### Borrowing
**Purpose:** To track informal financial obligations (money owed to the user, or money the user owes others).
**Responsibilities:** Maintains the ledger of a specific debt relationship.
**Attributes:**
- Counterparty Name (Who)
- Original Amount (Money)
- Note (Optional text)
**Relationships:**
- Belongs to a User.
- Has many Repayments.
- Has a specific Borrowing Type.
**Invariants:**
- Original Amount must be strictly greater than zero.
- Counterparty Name cannot be empty.
**Lifecycle:**
- *Creation:* User logs a new debt or loan.
- *Updates:* User modifies the counterparty name, type, or original amount.
- *Deletion:* User permanently deletes the record and its associated repayments.

### Repayment
**Purpose:** To record a partial or full settlement of a specific Borrowing.
**Responsibilities:** Decreases the outstanding balance of a Borrowing.
**Attributes:**
- Amount (Money)
- Date (Timestamp)
**Relationships:**
- Belongs to exactly one Borrowing.
**Invariants:**
- Amount must be strictly greater than zero.
- The sum of all Repayment amounts cannot exceed the Original Amount of the parent Borrowing.
**Lifecycle:**
- *Creation:* User logs a payment against a Borrowing.
- *Updates:* User modifies the repayment amount or date.
- *Deletion:* User removes the repayment record.

### PaymentMethod
**Purpose:** To define the financial vehicle used to fund an Expense.
**Responsibilities:** Classifies the source of funds to trigger specific domain logic (e.g., requiring a Credit Card).
**Attributes:**
- Type
**Relationships:**
- Required by every Expense.
**Invariants:**
- Must be a recognized system type (Cash, Debit, Credit, UPI).
**Lifecycle:**
- *Creation/Updates/Deletion:* N/A. Handled as an immutable system enumeration.

### Dashboard
**Purpose:** To provide a read-only, aggregated projection of the user's financial health.
**Responsibilities:** Compiles Budgets, Expenses, Credit Cards, and Borrowings into immediate insights.
**Attributes:**
- Viewing Period (DateRange)
**Relationships:**
- Aggregates data from Expenses, Budgets, CreditCards, and Borrowings for a specific User.
**Invariants:**
- Must always reflect the deterministic, mathematically precise aggregation of underlying entities.
- Does not hold independent mutable state.
**Lifecycle:**
- *Creation:* Generated dynamically upon request.

### History
**Purpose:** To provide a chronological, read-only ledger of financial activity.
**Responsibilities:** Surfaces a chronological feed of Expenses and Repayments.
**Attributes:**
- Viewing Period (DateRange)
**Relationships:**
- Reads Expenses and Repayments for a specific User.
**Invariants:**
- Must accurately represent the sequence of events based on transaction dates.
**Lifecycle:**
- *Creation:* Generated dynamically upon request.

### Settings
**Purpose:** To manage user-specific application configurations and preferences.
**Responsibilities:** Holds global toggles and state for the user's environment.
**Attributes:**
- Theme Preference
- Base Currency (if defined for display purposes)
**Relationships:**
- Belongs strictly to one User.
**Invariants:**
- Cannot be empty; must always have system defaults.
**Lifecycle:**
- *Creation:* Instantiated with defaults when the User is created.
- *Updates:* Modified by the user.

---

## Value Objects

Value Objects have no conceptual identity; they describe characteristics of a thing and are immutable.

- **Money:** Encapsulates a numeric currency value. Ensures precise decimal math and prevents floating-point inaccuracies. Never exists without a parent entity.
- **DateRange:** Encapsulates a Start Date and End Date. Used by the Dashboard and History to bound queries (e.g., "Current Month").
- **CreditUtilization:** A calculated ratio derived from `CreditCard.CreditLimit` and the sum of associated `Expenses`.
- **RemainingCredit:** A calculated difference derived from `CreditCard.CreditLimit` minus the sum of associated `Expenses`.
- **BudgetSummary:** A composite object containing the Budget Limit, Total Expenses, and the calculated Remaining Budget for a specific DateRange.

---

## Enumerations

- **PaymentMethodType:** `CASH`, `DEBIT`, `CREDIT`, `UPI`
- **BorrowingType:** `BORROWED` (money owed by the user), `LENT` (money owed to the user)
- **CardStatus:** `ACTIVE`, `ARCHIVED`
- **CategoryType:** `PROTECTED` (system defaults), `CUSTOM` (user-created)

---

## Aggregates

Aggregates are clusters of domain objects that can be treated as a single unit for data changes.

- **CreditCard Aggregate:** 
  - Root: `CreditCard`
  - Children: `Expenses` (where PaymentMethod = Credit)
  - *Logic:* To calculate utilization or remaining credit, the Credit Card aggregate evaluates its own limit against the sum of its child expenses.

- **Borrowing Aggregate:**
  - Root: `Borrowing`
  - Children: `Repayments`
  - *Logic:* The Borrowing aggregate dictates its outstanding balance by evaluating its original amount against the sum of its child repayments.

- **User Aggregate:**
  - Root: `User`
  - Children: `Settings`, `Categories`, `Budget`
  - *Logic:* The boundaries of the user's universe. Deleting the User cascade-deletes the entire aggregate tree.

---

## Domain Rules

- **Budget Integrity:** A budget limit cannot be negative.
- **Expense Classification:** Every expense MUST belong to exactly one category and exactly one payment method.
- **Credit Assignment:** Any expense classified with the `CREDIT` payment method MUST be explicitly linked to an existing `CreditCard` entity.
- **Category Uniqueness:** Category names must be unique per user. Attempting to create "Food" when "food" exists must fail.
- **Repayment Bounds:** A repayment cannot be negative, and the total sum of repayments cannot exceed the parent borrowing's original amount.
- **Archival Rules:** An archived credit card cannot receive new expenses, but historical expenses tied to it remain valid and immutable.
- **Orphan Prevention:** A category cannot be deleted if expenses are currently assigned to it, unless those expenses are explicitly reassigned in the same transaction.
- **Determinism:** Financial calculations (Remaining Budget, Credit Utilization) must always be deterministic, deriving their values dynamically from the single source of truth (the logged transactions).

---

## Out of Scope

The following domain concepts are explicitly excluded from the Version 1 model to maintain strict MVP focus:

- **Investment:** Tracking stocks, bonds, or crypto assets.
- **Subscription:** Contracts representing recurring, automated expenses.
- **RecurringExpense:** Scheduled rules for auto-generating expenses.
- **NetWorth:** Aggregating liquid cash, debts, and illiquid assets.
- **Goal:** Savings targets or sinking funds attached to a specific timeline.
- **MultiCurrency:** Handling exchange rates or cross-currency transactions.
