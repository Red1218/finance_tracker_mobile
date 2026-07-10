# Finance Tracker v2: Product Requirements

## 1. Product Scope

The purpose of Version 1 is to deliver a fast, intentional, and highly focused manual finance tracker. It provides users with immediate clarity over their current financial standing by consolidating daily expenses, credit card utilization, and informal debts into a single, cohesive interface. The product must empower users to log transactions frictionlessly and monitor their monthly budget without the mental overhead of traditional accounting software. 

## 2. Functional Requirements

### Dashboard
**Purpose:** To provide an immediate, comprehensive overview of the user's financial health.
**Description:** The primary landing screen displaying aggregated financial metrics for the current month.
**Functional Requirements:**
- Display total spending this month.
- Display remaining budget.
- Display budget usage percentage.
- Display aggregate credit utilization and remaining credit across all cards.
- Display total borrowed amount and total lent amount.
- Highlight the highest spending category for the month.
- Highlight the largest single expense for the month.
- Display a brief feed of recent transactions.
**Acceptance Criteria:**
- Metrics recalculate seamlessly when a new transaction is logged.
- The dashboard accurately defaults to the current calendar month.
- **Empty State Behaviour:** Zero data states (new user with no transactions) must guide the user with clear call-to-action buttons to add data rather than showing empty charts or generic zeros.
**Edge Cases:** Budget set to zero; expenses exceeding budget.
**Out of Scope:** Custom dashboard widgets, year-over-year comparisons.

### Borrowings (IOUs)
*Decision: Option A — Keep Borrowings in V1 and support repayments.*
*Justification: Borrowings are a core reality of personal finance. Keeping IOUs in V1 but adding a repayment mechanism ensures users don't lose track of informal debts and credits, which directly impact their available cash flow and budget accuracy.*

**Purpose:** To track informal debts and loans to maintain financial relationships.
**Description:** A ledger for money borrowed from or lent to external parties, supporting partial or full repayments.
**Functional Requirements:**
- Users can log a borrowing record specifying: Type (Borrowed or Lent), Amount, Entity Name (Who), and an optional Note.
- Users can log Repayments against an active borrowing record.
- Users can edit or delete borrowing and repayment records.
- The system must calculate and display the remaining balance of the IOU.
**Acceptance Criteria:**
- Borrowings are clearly separated from standard expenses.
- The total borrowed and lent amounts aggregate correctly on the dashboard.
- Logging a repayment adjusts the outstanding balance of the specific IOU immediately.
**Edge Cases:** Repayment amount exceeds the outstanding balance.
**Out of Scope:** Automatic SMS reminders to friends, interest calculations.

### Credit Cards
**Purpose:** To monitor credit limits and prevent over-utilization.
**Description:** A management system for tracking individual credit cards and their boundaries.
**Functional Requirements:**
- Users can add a credit card specifying its Name and Credit Limit.
- Users can set a specific credit card as their "Default" for faster expense entry.
- Users can edit credit cards.
- Users can archive a credit card instead of deleting it, preserving historical expense data while hiding the card from active entry menus.
- The system calculates and displays: Available credit, Remaining credit, and Utilization percentage for each card based on logged expenses.
**Acceptance Criteria:**
- **Utilization Warning:** The system visually warns the user when utilization exceeds a safe threshold (e.g., 30%) and alerts them critically when approaching 100%.
- **Over-limit Behaviour:** The system allows logging an expense that exceeds the limit (reflecting real life), but displays a clear over-limit alert.
- Adding a card makes it immediately available in the Expense Tracking form.
**Edge Cases:** Users lowering a credit limit below the amount they have already spent.
**Out of Scope:** Statement dates, interest rate calculations, automated payment reminders.

### Categories
**Purpose:** To organize spending into meaningful groups.
**Description:** A management system for expense classification.
**Functional Requirements:**
- The system must provide a default set of protected categories (e.g., Food, Transport, Utilities) for new users.
- Users can create custom categories.
- Users can edit the names of existing custom categories.
- Users can delete custom categories.
**Acceptance Criteria:**
- **Protected Categories:** Default system categories cannot be deleted or renamed.
- **Duplicate Name Behaviour:** The system must reject the creation of a category if the name already exists (case-insensitive).
- **Delete Behaviour:** Deleting a category prompts the user to reassign existing expenses to a different category or default them to a system "Uncategorized" state.
- Category lists update immediately upon creation or edit.
**Edge Cases:** Attempting to create a category with special characters only.
**Out of Scope:** Nested sub-categories, category-specific budget limits.

### Expense Tracking
**Purpose:** To capture day-to-day spending accurately and quickly.
**Description:** A streamlined interface for logging, viewing, editing, and deleting individual expenses.
**Functional Requirements:**
- Users can log an expense with: Amount, Date, Category, Payment Method (Cash, Debit, Credit, UPI), and an optional Note.
- If Payment Method is "Credit", the user must select a specific Credit Card.
- Users can edit or delete an existing expense.
- **Merchant Field Decision: NO.** 
  *Justification: Adding a dedicated Merchant field introduces unnecessary friction to the daily logging habit. Users must either type custom text or search a growing list for every coffee or snack. The optional 'Note' field is sufficient for edge cases where the vendor name is important.*
**Acceptance Criteria:**
- Logging an expense feels instantaneous and frictionless.
**Edge Cases:** Future dates; extremely large numbers exceeding standard display limits.
**Out of Scope:** Recurring automated expenses, receipt scanning.

### Search
**Decision: NO.**
*Justification: Version 1 is strictly focused on establishing a fast, frictionless daily logging habit and managing the current month's budget. Complex querying, filtering, and search functionality across historical data adds UI clutter and engineering complexity that is better suited for Version 2, when the user has amassed enough data to require it.*

### History
**Decision: YES.**
*Justification: Users must have a way to view their chronological log of transactions to verify entries, spot mistakes, and perform edits or deletions. A tracker without a visible ledger is a black box.*

**Purpose:** To provide a transparent ledger of all financial activity.
**Description:** A chronological feed of expenses and repayments.
**Functional Requirements:**
- Display a list of all transactions for the current viewing period, sorted by date (newest first).
- Group transactions visually by day.
- Tap a transaction to view its details, edit, or delete.
**Acceptance Criteria:**
- The history feed updates immediately when new transactions are logged.
- Empty states clearly indicate no activity for the period.
**Edge Cases:** Multiple transactions logged at the exact same timestamp.

## 3. Non Functional Requirements

- **Performance:** The application must launch rapidly and be ready for input without perceived delay. Screen transitions and scrolling must feel fluid and native.
- **Reliability:** Expense inputs must never be lost. Local data integrity must be maintained during network fluctuations.
- **Usability:** The tap target size for all interactive elements must meet standard mobile accessibility guidelines. Contrast ratios must be clearly legible in varying lighting conditions.
- **Security:** User sessions must be securely tokenized. The application must never store plain-text passwords.
- **Privacy:** User data must not be accessible to any other user under any circumstance.
- **Offline behavior:** Core read/write functionality should degrade gracefully or queue changes appropriately if the network is unreliable.
- **Data integrity:** Network failures during an operation must fail gracefully, alerting the user rather than leaving the local state corrupted or out of sync.
- **Scalability:** The underlying architecture must support thousands of rows per user without performance degradation on the client.
- **Maintainability:** The product must strictly adhere to the defined internal architecture to ensure fast onboarding of new engineers.

## 5. User Flows

- **First launch:** User opens app -> Presented with Welcome/Value Prop -> Promoted to Register -> Completes Registration -> Guided to set initial Budget and Default Categories -> Lands on Dashboard.
- **Returning user:** User opens app -> Session validated in background -> Lands immediately on Dashboard.
- **Add expense:** User taps the floating action button -> Enters numeric amount -> Selects category -> Selects payment method -> Taps "Save" -> Returns to updated Dashboard.
- **Edit expense:** User navigates to History -> Taps existing expense -> Modifies Amount/Category/Note -> Taps "Save" -> Returns to History with updated values.
- **Delete expense:** User navigates to History -> Swipes or taps existing expense -> Selects "Delete" -> System prompts for confirmation -> User confirms -> Expense is permanently removed.
- **Delete category:** User navigates to Categories -> Selects custom category -> Taps "Delete" -> System prompts to reassign existing expenses -> User selects fallback category -> Category is deleted.
- **Delete (Archive) credit card:** User navigates to Credit Cards -> Selects card -> Chooses "Archive" -> System prompts for confirmation -> Card is hidden from active menus but history remains intact.
- **Logout:** User navigates to Settings -> Taps "Logout" -> System prompts for confirmation -> Local session cleared -> User routed to Login screen.
- **Empty dashboard:** New user lands on Dashboard -> Metrics display zero state -> Clear call-to-action buttons prompt user to "Add First Expense" or "Set Budget".
- **No internet:** User attempts to log expense without connection -> System alerts "No connection" or securely queues the transaction locally until connectivity is restored.

## 6. Business Rules

- An expense amount must be strictly greater than 0.
- A budget limit must be greater than or equal to 0.
- Category names must be unique (case-insensitive).
- Credit card names must be unique per user.
- Transaction dates must be valid calendar dates and cannot be set arbitrarily far into the future.
- The system must enforce confirmation modals before any destructive action (Delete, Archive).
- Deleted entities must never leave orphaned data; associated expenses must be explicitly reassigned or defaulted.
- Data access is strictly isolated; users cannot view, edit, or delete data belonging to another user ID.
- Expenses are strictly tied to the date they occurred; the dashboard filters data based on the start and end of the current calendar month.

## 9. Product Rules

- Dashboard always opens to the current calendar month.
- Every expense belongs to exactly one category.
- Every expense belongs to exactly one payment method.
- Historical transactions are immutable unless explicitly edited by the user.
- Financial calculations must always be deterministic and precise (handling currency decimals flawlessly).
- Deleted entities must never corrupt historical data.
