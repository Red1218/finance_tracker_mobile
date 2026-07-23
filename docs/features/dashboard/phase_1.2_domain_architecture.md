# Dashboard: Phase 1.2 Domain Architecture

**Status**: Approved (Frozen)
**Phase**: 1.2

---

## 1. Objectives

This document defines the business domain model for the Finance Tracker Dashboard. It establishes the entities, value objects, relationships, services, invariants, and events that constitute the Dashboard's conceptual foundation.

This document is implementation-agnostic. It does not prescribe database schemas, persistence strategies, API contracts, or framework-specific patterns. Its purpose is to define *what the business domain is*, not *how it is built*.

All future architectural and implementation decisions must trace back to and remain consistent with this model.

*(Reference: Phase 1.1 Requirements, Stage 0.7 Dashboard Specification)*

---

## 2. Domain Overview

The Dashboard domain is responsible for aggregating and presenting a user's financial position at a point in time, scoped to a chosen reporting period. It is a read-oriented domain: its primary concern is deriving meaningful summaries from financial data produced by other domains (Transactions, Budgets, Categories).

The Dashboard domain does not own financial data — it observes and presents it.

---

## 3. Bounded Context

The Dashboard exists within its own bounded context: **Dashboard Context**.

It communicates with adjacent bounded contexts exclusively through published domain events and well-defined domain service inputs. The Dashboard Context does not reach into the internal models of other contexts.

### Adjacent Contexts

| Context | Relationship | Direction |
|---|---|---|
| **Transaction Context** | Provides transaction records for activity and KPI aggregation | Transaction → Dashboard |
| **Budget Context** | Provides budget definitions and consumption data for Budget Health | Budget → Dashboard |
| **Category Context** | Provides category metadata for breakdown and activity labeling | Category → Dashboard |
| **User Preferences Context** | Provides localization, currency, and display settings | Preferences → Dashboard |

---

## 4. Domain Entities

Entities are domain objects with a distinct identity that persists across state changes.

---

### 4.1 Dashboard

**Purpose**: The root entity representing the user's current Dashboard view. It is the aggregate root of the Dashboard Context.

**Responsibilities**:
- Coordinates and owns the presentation of all financial summaries.
- Enforces that all sections are scoped to the same active Reporting Period.
- Delegates data concerns to its child aggregates and domain services.

**Core Attributes** *(conceptual)*:
- Active Reporting Period
- Financial Summary (derived)
- Collection of Dashboard Sections

**Relationships**:
- Owns one active Reporting Period
- Contains one or more Dashboard Sections
- Populated by the Dashboard Assembly Service

**Lifecycle**:
- Created when the user navigates to the Dashboard.
- Refreshed when the Reporting Period changes or a relevant Domain Event is received.
- Torn down when the user navigates away.

---

### 4.2 Dashboard Section

**Purpose**: Represents a distinct, independently loadable area of the Dashboard (e.g., KPI Summary, Budget Health, Recent Activity). Each section is self-contained and independently failable.

**Responsibilities**:
- Encapsulates the data and state for a single logical area of the Dashboard.
- Manages its own loading, empty, and error states.
- Exposes a status that indicates whether it is ready, loading, empty, or in error.

**Core Attributes** *(conceptual)*:
- Section Type (KPI, BudgetHealth, CategoryBreakdown, RecentActivity, QuickActions)
- Load Status (Loading, Loaded, Empty, Error)
- Content (derived data relevant to section type)

**Relationships**:
- Belongs to one Dashboard aggregate.
- References data produced by domain services.

**Lifecycle**:
- Initialized in a Loading state when the Dashboard loads.
- Transitions to Loaded, Empty, or Error based on data retrieval results.
- Can be independently re-triggered (e.g., on Retry).

---

### 4.3 Transaction

**Purpose**: A record of a single financial event (income or expense) made by the user.

**Responsibilities**:
- Represents the atomic unit of financial activity.
- Provides the raw data from which all KPIs and summaries are derived.

**Core Attributes** *(conceptual)*:
- Unique Identifier
- Amount (monetary value)
- Direction (Income / Expense)
- Date
- Category reference
- Description / Merchant label

**Relationships**:
- Belongs to exactly one Category.
- Observed by the Dashboard domain via the Transaction Context.

**Lifecycle**:
- Owned and managed by the Transaction Context.
- Observed (not owned) by the Dashboard Context.

---

### 4.4 Budget

**Purpose**: A user-defined financial limit for a category or overall spending within a given period.

**Responsibilities**:
- Defines the threshold against which actual spending is compared.
- Drives the Budget Health Section of the Dashboard.

**Core Attributes** *(conceptual)*:
- Unique Identifier
- Budget Limit (monetary value)
- Associated Category (or global)
- Associated Reporting Period

**Relationships**:
- May be associated with one Category or be a global budget.
- Observed by the Dashboard domain via the Budget Context.

**Lifecycle**:
- Owned and managed by the Budget Context.
- Observed (not owned) by the Dashboard Context.

---

### 4.5 Category

**Purpose**: A named grouping used to classify transactions (e.g., Food & Dining, Transport, Utilities).

**Responsibilities**:
- Provides the organizational taxonomy for the Category Breakdown Section.
- Supplies display metadata (name, icon) for Activity Rows.

**Core Attributes** *(conceptual)*:
- Unique Identifier
- Name
- Display Icon reference

**Relationships**:
- Referenced by many Transactions.
- Referenced by zero or more Budgets.
- Observed by the Dashboard domain via the Category Context.

**Lifecycle**:
- Owned and managed by the Category Context.
- Observed (not owned) by the Dashboard Context.

---

## 5. Value Objects

Value objects have no identity of their own; they are defined entirely by their attributes and are immutable.

---

### 5.1 ReportingPeriod

**Purpose**: Represents the selected financial timeframe that scopes all Dashboard data.

**Attributes**:
- Period Type (e.g., CurrentMonth, LastMonth, CurrentYear, CustomRange)
- Start Date
- End Date

**Rules**:
- Start Date must be before or equal to End Date.
- All Dashboard sections must be simultaneously scoped to the same ReportingPeriod.
- Changing the ReportingPeriod invalidates all currently loaded Dashboard section data.

---

### 5.2 MonetaryAmount

**Purpose**: Represents a financial amount with currency context.

**Attributes**:
- Numeric value
- Currency code (e.g., USD, INR, EUR)

**Rules**:
- Currency must always be present; a bare numeric value is not a valid MonetaryAmount.
- Arithmetic operations between MonetaryAmounts of different currencies are not permitted without explicit conversion.
- Display formatting is determined by User Preferences (localization).

---

### 5.3 FinancialSummary

**Purpose**: A derived, read-only snapshot of the user's financial position for the active ReportingPeriod.

**Attributes**:
- Total Balance (MonetaryAmount)
- Period Income (MonetaryAmount)
- Period Expenses (MonetaryAmount)
- Net for Period (MonetaryAmount, derived: Income − Expenses)

**Rules**:
- All attributes are computed values. They are never stored independently.
- Must be recalculated whenever the ReportingPeriod changes or a new Transaction is confirmed.

---

### 5.4 TrendIndicator

**Purpose**: Represents the directional change of a metric relative to the previous comparable period.

**Attributes**:
- Direction (Positive / Negative / Neutral)
- Magnitude (percentage or fixed amount)

**Rules**:
- Requires at least two comparable periods to calculate.
- If a previous period has no data, the TrendIndicator must represent a Neutral state (not an error).

---

### 5.5 BudgetHealthStatus

**Purpose**: A classification of budget consumption relative to the defined limit.

**Attributes**:
- Status (OnTrack / AtRisk / OverBudget)
- Amount Consumed (MonetaryAmount)
- Limit (MonetaryAmount)
- Consumption Ratio (percentage, derived)

**Rules**:
- OnTrack: Consumption Ratio ≤ 80%.
- AtRisk: Consumption Ratio > 80% and ≤ 100%.
- OverBudget: Consumption Ratio > 100%.

---

### 5.6 CategorySpendSummary

**Purpose**: A summary of spending within a single Category for the active ReportingPeriod.

**Attributes**:
- Category reference
- Total Amount Spent (MonetaryAmount)
- Proportion of Total Spending (percentage, derived)
- Rank (integer, derived by descending spend)

**Rules**:
- Proportion is calculated relative to total period expenses across all categories.
- Categories with zero spend must be excluded from the breakdown.

---

## 6. Domain Relationships

```
Dashboard (Aggregate Root)
├── has one active ReportingPeriod (Value Object)
├── contains one FinancialSummary (Value Object, derived)
├── contains one or more DashboardSections (Entity)
│   ├── KPI Section  → derives from FinancialSummary
│   ├── Budget Health Section → derives from BudgetHealthStatus (per Budget)
│   ├── Category Breakdown Section → derives from CategorySpendSummary list
│   └── Recent Activity Section → derives from Transaction list
│
Transaction (external, observed)
├── belongs to one Category
└── contributes to FinancialSummary and CategorySpendSummary

Budget (external, observed)
└── produces BudgetHealthStatus

Category (external, observed)
└── provides metadata for CategorySpendSummary and Activity Rows
```

---

## 7. Domain Services

Domain Services encapsulate business logic that does not naturally belong to a single entity or value object.

---

### 7.1 Dashboard Assembly Service

**Responsibility**: Orchestrates the construction of the complete Dashboard state by coordinating all data retrieval and derivation steps for a given user and ReportingPeriod.

**Inputs**:
- User identity reference
- Active ReportingPeriod

**Outputs**:
- Fully populated Dashboard aggregate (with all sections in their initial state)

**Rules**:
- Must trigger all Dashboard Sections to begin loading simultaneously, not sequentially.
- A failure in one Section must not prevent other Sections from loading.
- Must emit a `DashboardLoaded` event upon full resolution.

---

### 7.2 Financial Summary Service

**Responsibility**: Derives the FinancialSummary value object for a given user and ReportingPeriod.

**Inputs**:
- User identity reference
- ReportingPeriod

**Outputs**:
- FinancialSummary (Total Balance, Period Income, Period Expenses, Net)
- TrendIndicator per metric (compared to previous comparable period)

**Rules**:
- Total Balance is the sum of all-time confirmed income minus all-time confirmed expenses, regardless of ReportingPeriod.
- Period Income and Period Expenses are scoped strictly to the ReportingPeriod.
- Must handle the case where no prior period exists (TrendIndicator is Neutral).

---

### 7.3 Budget Health Service

**Responsibility**: Calculates the BudgetHealthStatus for all active budgets within the ReportingPeriod.

**Inputs**:
- Active Budgets for the user
- Transaction totals per Category for the ReportingPeriod

**Outputs**:
- A BudgetHealthStatus per Budget

**Rules**:
- Consumption Ratio = (Amount Spent ÷ Budget Limit) × 100.
- Status thresholds are as defined in the BudgetHealthStatus value object.
- If no Budget exists for the period, the Budget Health Section enters an Empty state.

---

### 7.4 Category Breakdown Service

**Responsibility**: Derives the ranked list of CategorySpendSummary objects for the active ReportingPeriod.

**Inputs**:
- All Transactions for the user within the ReportingPeriod
- All Categories

**Outputs**:
- A ranked, ordered list of CategorySpendSummary objects (descending by spend)

**Rules**:
- Only Expense-direction Transactions contribute to category spend.
- Categories with zero spend are excluded.
- Proportion is calculated relative to the total of all period expenses.

---

### 7.5 Recent Activity Service

**Responsibility**: Retrieves the most recent Transactions for display in the Recent Activity Section.

**Inputs**:
- User identity reference
- ReportingPeriod
- Display limit (e.g., 5 rows)

**Outputs**:
- Ordered list of Transactions (descending by date, up to the display limit)

**Rules**:
- Only Transactions within the active ReportingPeriod are returned.
- If no Transactions exist for the period, the service signals an Empty result (not an error).

---

## 8. Business Invariants

Business invariants are rules that must always be true within the domain.

- **INV-001**: All Dashboard Sections must always be scoped to the same active ReportingPeriod. A Dashboard displaying sections from mixed periods is an invalid state.
- **INV-002**: Total Balance is always an all-time calculation. It is never scoped to the active ReportingPeriod.
- **INV-003**: Period Income and Period Expenses are always scoped to the active ReportingPeriod.
- **INV-004**: A MonetaryAmount must always carry a currency code. Bare numeric values are invalid.
- **INV-005**: A TrendIndicator requires data from at least two comparable periods. With only one period of data, the indicator must be Neutral.
- **INV-006**: Categories with zero spend must never appear in the Category Breakdown.
- **INV-007**: The CategorySpendSummary proportions across all categories must sum to 100% (within acceptable rounding tolerance).
- **INV-008**: BudgetHealthStatus thresholds are fixed: OnTrack ≤ 80%, AtRisk > 80% and ≤ 100%, OverBudget > 100%. These boundaries must not be altered per-user.
- **INV-009**: The Dashboard domain must never modify Transaction, Budget, or Category data. It is a read-only observer of those domains.
- **INV-010**: A Dashboard Section in an Error state must not prevent other Sections from rendering.

---

## 9. Domain Events

Domain Events represent significant business occurrences within the domain that other parts of the system may need to react to.

---

### 9.1 Events Produced by the Dashboard Context

| Event | Trigger | Consumers |
|---|---|---|
| `DashboardLoaded` | All Dashboard Sections have resolved (success, empty, or error) | Analytics, Logging |
| `ReportingPeriodChanged` | The user selects a new ReportingPeriod | Dashboard Assembly Service (triggers re-derivation) |

---

### 9.2 Events Consumed by the Dashboard Context

| Event | Source Context | Effect on Dashboard |
|---|---|---|
| `TransactionAdded` | Transaction Context | Financial Summary, Recent Activity, and Category Breakdown Sections are marked stale and refreshed. |
| `TransactionUpdated` | Transaction Context | Same as `TransactionAdded`. |
| `TransactionDeleted` | Transaction Context | Same as `TransactionAdded`. |
| `BudgetUpdated` | Budget Context | Budget Health Section is marked stale and refreshed. |
| `BudgetDeleted` | Budget Context | Budget Health Section transitions to Empty state. |
| `CategoryUpdated` | Category Context | Category display metadata (name, icon) is refreshed. |
| `UserPreferencesUpdated` | User Preferences Context | Currency formatting and localization rules are refreshed for all Sections. |

---

## 10. Aggregate Boundaries

An aggregate is a cluster of domain entities and value objects treated as a single unit for the purpose of data consistency.

---

### 10.1 Dashboard Aggregate

**Aggregate Root**: Dashboard
**Members**: Dashboard, Dashboard Sections, FinancialSummary, ReportingPeriod (active instance)
**Ownership**: The Dashboard Context owns this aggregate entirely.
**Consistency Boundary**: All Sections within the Dashboard aggregate must always reflect the same ReportingPeriod. The Dashboard is the sole enforcer of this rule.

---

### 10.2 External Aggregates (Observed, Not Owned)

| Aggregate | Owning Context | How Observed |
|---|---|---|
| Transaction | Transaction Context | Via domain events and service queries. |
| Budget | Budget Context | Via domain events and service queries. |
| Category | Category Context | Via service queries for metadata. |

The Dashboard Context must never directly mutate or reach into the internal consistency of any external aggregate. Any cross-aggregate operation must be mediated by domain events or explicit service boundaries.

---

## 11. Domain Constraints

- **DC-001**: The Dashboard Context must never own or persist Transaction, Budget, or Category data. It may hold derived summaries as transient, in-memory representations.
- **DC-002**: All monetary calculations must use the MonetaryAmount value object. Floating-point arithmetic on bare numeric values is prohibited.
- **DC-003**: Domain events consumed from other contexts must be idempotent. Receiving the same event twice must not corrupt the Dashboard state.
- **DC-004**: The Dashboard Assembly Service must not impose sequential loading on Dashboard Sections. Sections must load with maximum concurrency.
- **DC-005**: The boundary between the Dashboard Context and adjacent contexts must be enforced through domain events and service interfaces, never through direct coupling to another context's internal model.
- **DC-006**: Derived values (FinancialSummary, CategorySpendSummary, BudgetHealthStatus) are computed on demand. They are not stored as source-of-truth records.

---

## 12. Future Domain Expansion

The following domain concepts are anticipated for future phases and should be considered in architectural decisions to avoid structural rework:

- **Custom ReportingPeriod**: Allowing users to define arbitrary date ranges beyond predefined period types.
- **Multi-Currency Support**: Requiring currency conversion logic as part of the Financial Summary Service when transactions exist in multiple currencies.
- **Savings Goals**: A new entity representing a user-defined savings target, requiring a new Dashboard Section and a corresponding domain service.
- **Net Worth Trend**: Extending the TrendIndicator and Financial Summary Service to track historical Total Balance snapshots over time.
- **Notifications / Alerts Domain**: A future context that subscribes to `BudgetUpdated` and `TransactionAdded` events to generate alerts (e.g., "You are nearing your budget limit"), surfaced as a new Dashboard Section.

---

## 13. Domain Glossary

A shared vocabulary for developers, designers, QA, and future contributors. All terms are used consistently throughout this document and must be used consistently in implementation discussions.

| Term | Definition |
|---|---|
| **Aggregate** | A cluster of domain entities and value objects treated as a single consistency unit, accessed through an Aggregate Root. |
| **Aggregate Root** | The single entity through which all interactions with an aggregate are mediated (e.g., Dashboard). |
| **Bounded Context** | A named boundary within which a domain model is defined and applicable. The Dashboard Context is one such boundary. |
| **Budget** | A user-defined monetary limit for a category or overall spending within a given period. Owned by the Budget Context. |
| **Budget Health** | A classification of how much of a Budget has been consumed within the active Reporting Period: OnTrack, AtRisk, or OverBudget. |
| **Category** | A named grouping that classifies Transactions (e.g., Food & Dining, Transport). Owned by the Category Context. |
| **Category Breakdown** | A ranked summary of spending by Category for the active Reporting Period, expressed as amounts and proportions. |
| **Dashboard** | The aggregate root representing the user's summarized financial view, coordinating all Dashboard Sections within a single Reporting Period. |
| **Dashboard Section** | An independently loadable and independently failable area of the Dashboard (e.g., KPI Summary, Budget Health). |
| **Domain Event** | A record of a significant business occurrence that has already happened (e.g., `TransactionAdded`, `ReportingPeriodChanged`). |
| **Domain Service** | A stateless operation that encapsulates business logic spanning multiple entities or value objects (e.g., Financial Summary Service). |
| **Entity** | A domain object with a distinct, persistent identity (e.g., Transaction, Budget). |
| **Financial Summary** | A derived, read-only snapshot of a user's Total Balance, Period Income, Period Expenses, and Net for the active Reporting Period. |
| **Invariant** | A business rule that must always hold true within the domain. Violation of an invariant represents an invalid domain state. |
| **Monetary Amount** | A value object representing a financial amount always paired with a currency code. Bare numeric values are not valid in this domain. |
| **Reporting Period** | The time interval (e.g., Current Month, Last Month, Current Year) applied consistently and simultaneously across all Dashboard summaries. |
| **Trend Indicator** | A value object describing the directional change (Positive, Negative, or Neutral) of a metric compared to a previous comparable period. |
| **Transaction** | A record of a single financial event (income or expense). The atomic unit of financial data. Owned by the Transaction Context. |
| **Value Object** | An immutable domain object with no identity of its own, defined entirely by its attributes (e.g., MonetaryAmount, ReportingPeriod). |
