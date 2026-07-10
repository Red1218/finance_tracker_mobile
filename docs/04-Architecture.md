# Finance Tracker v2: Architecture Handbook

## Status and Authority

This document defines the required architecture for Finance Tracker v2. It refines, but does not alter, the product and domain decisions in 01-Vision.md, 02-Requirements.md, and 03-Domain-Model.md. Those documents take precedence if a conflict is found. This architecture is framework- and transport-agnostic.

The architecture organizes user-owned financial facts into feature boundaries, exposes explicit cross-feature contracts, and produces deterministic read models from authoritative facts.

## 1. Architectural Goals

1. **Correctness.** Every persisted financial fact satisfies its domain invariants before it is observable. Financial calculations are deterministic and precise.
2. **Predictability.** Every command has one owner, explicit inputs, a defined outcome, and a recoverable failure mode.
3. **Maintainability.** Feature changes remain local unless they intentionally alter a published contract or architectural rule.
4. **Strict user isolation.** Every read, write, cache entry, queued operation, and projection is scoped to one authenticated user.
5. **Reliable operation.** Confirmed user input is not discarded because connectivity changes. Every attempted change reaches an explicit, recoverable outcome.
6. **Scope discipline.** The architecture must not introduce excluded Version 1 concepts, including bank sync, investments, recurring expenses, multi-currency, category budgets, search, or shared households.

## 2. Architectural Principles

1. **Facts before views.** Expenses, budgets, categories, credit cards, borrowings, repayments, settings, and user identity are authoritative facts. Dashboard and History are read-only projections and cannot own mutable financial state.
2. **Commands change facts; queries describe facts.** A change uses a named command. A query cannot create, edit, archive, delete, or repair a financial record.
3. **One owner per invariant.** The feature owning an aggregate enforces its invariants. Screens, hooks, shared components, and coordinators cannot redefine them.
4. **Explicit consistency.** A multi-record change is accepted only when all affected invariants are preserved together. Category reassignment and deletion, and repayment-bound enforcement, are indivisible business operations.
5. **Derived values are disposable.** A projection, cache, warning, or display model may be rebuilt from authoritative facts. It cannot be the sole record of a financial result.
6. **Dependencies point inward.** Components and external adapters depend on feature services and domain contracts; domain rules never depend on presentation, persistence, transport, or device concerns.
7. **No hidden cross-feature access.** A feature accesses another feature only through the root-level contracts directory or an approved service workflow.
8. **One definition per business term.** Terms such as Expense, Repayment, Available Credit, Remaining Budget, Archived, and Current Month use the Domain Model definitions. Parallel definitions are prohibited.

## 3. Complete Folder Structure

The rebuild must use the following production structure. A directory may be absent only when it has no owned artefacts. No alternative production source root is permitted.

~~~text
/
├── docs/
│   ├── 01-Vision.md
│   ├── 02-Requirements.md
│   ├── 03-Domain-Model.md
│   ├── 04-Architecture.md
│   └── adr/
│       └── ADR-NNNN-short-title.md
├── src/
│   ├── app/
│   │   ├── bootstrap/             # start-up and composition only
│   │   ├── navigation/            # route-to-feature mapping only
│   │   └── session/               # authenticated-user boundary
│   ├── contracts/
│   │   ├── identity/
│   │   ├── expenses/
│   │   ├── categories/
│   │   ├── budgets/
│   │   ├── credit-cards/
│   │   ├── borrowings/
│   │   ├── dashboard/
│   │   ├── history/
│   │   └── settings/
│   ├── features/
│   │   ├── identity/
│   │   ├── expenses/
│   │   ├── categories/
│   │   ├── budgets/
│   │   ├── credit-cards/
│   │   ├── borrowings/
│   │   ├── dashboard/
│   │   ├── history/
│   │   └── settings/
│   │       ├── domain/            # feature entities, value objects, rules
│   │       ├── components/        # feature-specific UI components
│   │       ├── hooks/             # feature interaction and read hooks
│   │       ├── services/          # commands, queries, and workflows
│   │       ├── repository/        # feature-owned persistence boundary
│   │       ├── read-models/       # projections and selectors
│   │       └── types/             # feature-private types only
│   ├── shared/
│   │   ├── components/            # feature-neutral reusable UI
│   │   ├── theme/
│   │   │   ├── tokens/            # canonical design-token definitions
│   │   │   ├── colors/            # semantic colour definitions
│   │   │   ├── typography/        # type roles and scale
│   │   │   ├── spacing/           # spacing scale
│   │   │   └── icons/             # approved icon assets and names
│   │   ├── kernel/                # stable feature-neutral domain primitives
│   │   ├── errors/                # cross-feature error classification
│   │   └── utilities/             # non-business, non-feature helpers
│   └── platform/
│       ├── persistence/           # storage and synchronization adapters
│       ├── authentication/        # authentication adapters
│       ├── connectivity/          # connectivity observation only
│       └── observability/         # privacy-safe diagnostics only
├── tests/
│   ├── unit/                      # isolated rule and component behaviour
│   ├── integration/               # feature and adapter collaboration
│   ├── contract/                  # root-level contract compatibility
│   ├── architecture/              # dependency and ownership checks
│   └── e2e/                       # documented user-flow verification
└── tooling/                       # build and repository verification tools
~~~

### Folder rules

- src/features/<feature> is the only home for feature-specific source. A feature cannot create a top-level source directory.
- Each feature must use the same set of directories listed above. A new feature directory requires an accepted ADR.
- src/contracts is a first-class architectural boundary, not a shared directory. It contains only published cross-feature contracts.
- A contract is semantically owned by the feature that publishes it, but physically resides in src/contracts/<feature>. No feature may publish from an internal directory.
- dashboard and history own projections and presentation only. They cannot contain a financial aggregate or persistence implementation.
- identity owns authentication-facing behaviour; it does not own financial data or financial aggregate authorization.
- shared/kernel contains only stable concepts used by at least two features. It cannot contain a business entity, business rule, feature query, or feature component.
- shared/utilities contains only stateless, non-financial helpers. It cannot contain feature policy, I/O, state, or repositories.
- platform contains replaceable external-facing adapters. It cannot contain product policy, financial calculations, or UI behaviour.
- app composes features and controls session transitions. It cannot contain feature rules, feature persistence, or dashboard calculations.
- Every source artefact belongs to exactly one directory in this tree. A new top-level directory requires an accepted ADR.

## 4. Dependency Rules

Within a feature, components and hooks may depend on services, read models, feature-private types, and domain definitions. Services may depend on domain, repository contracts, read models, and published contracts. Repository implementations may depend on their feature's repository contract and platform. Domain depends only on domain definitions and shared/kernel. A root-level contract is the only externally importable surface of a feature.

A means allowed, C means allowed only through a root-level published contract, and — means prohibited. No allowed dependency authorizes a cycle.

| From \ To | Domain | Services | Repository | Read models | Hooks | Components | Contracts | Shared | Platform |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Domain | A | — | — | — | — | — | — | A | — |
| Services | A | A | A | A | — | — | C | A | — |
| Repository | A | A | A | — | — | — | — | A | A |
| Read models | A | A | — | A | — | — | C | A | — |
| Hooks | A | A | — | A | A | — | C | A | — |
| Components | A | — | — | — | — | A | — | A | — |
| Contracts | A | A | — | — | — | — | A | A | — |
| Shared | — | — | — | — | — | — | — | A | — |
| Platform | — | — | A | — | — | — | — | A | A |

- A feature may depend on another feature only through src/contracts/<feature>. All other cross-feature imports are prohibited.
- Contracts expose named commands, queries, notifications, and stable data shapes. They cannot expose screen state, storage representations, repository implementations, or private types.
- Cross-feature calls must be acyclic. When coordination is necessary, one owning feature service executes the workflow through published contracts.
- Components cannot access repositories, platform adapters, or contracts directly.
- Hooks cannot access platform adapters or another feature's internal source.
- Domain, services, read models, hooks, and components cannot import from platform.
- Architecture tests must reject prohibited imports and cycles. A violation is release-blocking.

## 5. Layer Responsibilities

| Layer | Must do | Must not do |
| --- | --- | --- |
| Domain | Define financial concepts, aggregate invariants, value semantics, and deterministic rules. | Perform I/O, retain interaction state, know routes, or infer the user. |
| Services | Accept commands and queries, authorize user scope, coordinate feature workflows, and return explicit outcomes. | Render UI, redefine domain calculations, or reach into another feature's internals. |
| Repository | Define the feature persistence boundary and isolate persistence-specific representations. | Decide business policy, calculate financial read models, or render UI. |
| Read models | Build user-scoped, read-only projections for Dashboard, History, and feature views. | Persist independent financial facts or accept mutation commands. |
| Hooks | Bind components to named service queries and commands, and own feature interaction state. | Enforce final business rules, access platform adapters, or implement persistence. |
| Components | Render supplied state and emit explicit user intent. | Issue commands, execute queries, access session data, or calculate financial measures. |
| Contracts | Publish the stable cross-feature API of a feature. | Contain feature implementation, storage details, or UI behaviour. |
| Shared and platform | Provide reusable UI, design rules, primitive types, and external adapters. | Bypass feature ownership or retain feature business state. |

## 6. Feature Boundary Rules

| Feature | Owns | May publish |
| --- | --- | --- |
| Identity | authenticated-user context and account lifecycle requests | authenticated-user identity and session state |
| Expenses | Expense facts and commands | expense commands, queries, and change notifications |
| Categories | Category facts, protected/custom status, and reassignment workflow | eligible-category queries and change notifications |
| Budgets | Budget facts for target months | budget-summary inputs and change notifications |
| Credit cards | CreditCard facts, default selection, and archival policy | active-card queries and change notifications |
| Borrowings | Borrowing and Repayment facts and repayment-bound enforcement | balance queries and change notifications |
| Dashboard | current-month financial-health projection | dashboard query only |
| History | chronological Expense and Repayment projection | history query only |
| Settings | user preference facts and defaults | settings query and change notifications |

- Only the owning feature may create, update, archive, or delete its facts.
- An Expense may reference a Category and, for Credit payment method, a CreditCard only through validated published contracts. It cannot duplicate category or card attributes as a substitute relationship.
- Category deletion is one category-owned workflow: every affected expense is reassigned to the chosen category or protected Uncategorized category before deletion. Partial completion is prohibited.
- Credit-card archival retains historic expense links and prevents the card appearing in active-entry choices.
- Repayment creation, amendment, and deletion are evaluated against the parent Borrowing's total repayments as one borrowing-owned operation.
- Dashboard and History may read published queries but cannot request a mutation as a rendering side effect.
- A new feature, cross-feature workflow, published contract, or ownership change requires an ADR before introduction.

## 7. Error Handling Strategy

All failures returned across a feature boundary have exactly one class.

| Class | Meaning | Required user outcome | Retry rule |
| --- | --- | --- | --- |
| Validation | Input is missing, malformed, or violates a field constraint. | Retain input and identify the affected field. | Only after user changes input. |
| Business-rule rejection | Validly shaped input would violate a domain invariant. | Retain input and explain the rejected condition. | Only after input or relevant facts change. |
| Authorization/session | No valid user scope exists or a fact is outside it. | Stop the operation and restore a valid session flow. | Never automatically. |
| Conflict | Facts changed so the command cannot safely apply. | Refresh facts and require an explicit decision. | Never silently overwrite. |
| Transient availability | Connectivity or an external capability is temporarily unavailable. | Mark pending when safe; otherwise report incomplete. | Only through the durable operation record. |
| Permanent infrastructure | The operation cannot succeed without corrective action. | Report a safe non-sensitive failure and retain no false success. | Never automatically. |
| Unknown | The cause is unclassified. | Report a safe generic failure and record privacy-safe diagnostics. | Never automatically. |

- A command outcome is exactly one of accepted, rejected, pending, or failed. Success cannot be shown for pending or failed commands.
- A rejected or failed command cannot leave a partially applied financial change.
- User-facing errors identify the action and recovery path without exposing credentials, session material, another user's data, or internal details.
- Invalid data is never silently corrected. The only exception is an explicit domain default, such as Settings defaults or protected Uncategorized during approved reassignment.
- Every boundary failure carries a stable error code. Display text is not a machine contract.

## 8. State Strategy

State is classified before introduction. Mixing classifications is prohibited.

| State class | Authoritative owner | Permitted lifetime | Rules |
| --- | --- | --- | --- |
| Domain state | Owning feature | Persistent | Contains only Domain Model facts and is scoped to one user. |
| Operation state | Owning feature service | Until terminal outcome | Represents one command attempt, including pending synchronization; it is not a financial fact. |
| Read state | Read-model owner | Rebuildable | Derived from user-scoped facts and invalidated by relevant accepted changes. |
| Interaction state | Owning feature hook | Current interaction only | Includes drafts, selection, focus, and confirmation; it cannot become a source of truth. |
| Session state | Identity/app boundary | Valid session only | Contains current user scope and is cleared at logout. |

- Persistent and cached financial state includes owning user scope. State for one user is cleared before another becomes observable.
- Each write command has a unique operation identity. Retrying the same operation cannot create duplicate financial facts.
- A locally accepted operation survives restart until terminal or explicitly resolved by the user.
- Pending operations are visible as pending, never represented as completed synchronized results.
- Logout clears session, interaction, read, and pending-operation runtime state. It does not delete server-authoritative user data.
- Cache loss cannot alter a fact's meaning or create a new fact.

## 9. Read Model Strategy

Read models answer product questions without becoming a second ledger. They are immutable outputs of named queries over authoritative, user-scoped facts.

### Required projections

- **Dashboard (current calendar month):** total spending; budget remaining and usage; aggregate and per-card credit information; borrowing and lending totals; highest spending category; largest expense; and recent transactions.
- **History (selected viewing period):** newest-first chronological Expense and Repayment feed, grouped by transaction date with stable ordering for equal timestamps.
- **Feature entry projections:** active cards, default card, eligible categories, category assignments, borrowing balances, and monthly budgets needed by documented flows.

- Dashboard always requests the current calendar month. It cannot retain a user-editable period in Version 1.
- Every read model declares its viewing period, user scope, source facts, and invalidating commands. A projection without all four is prohibited.
- Financial measures use only Domain Model definitions. A display cannot maintain an independent running total.
- An accepted fact change invalidates every affected projection before that projection is next presented as current. Pending changes may be shown only with explicit pending status.
- Empty projections are explicit product states with documented calls to action. Fabricated metrics or charts are prohibited.
- Query results are bounded to the required period and deterministically ordered. Unrelated historical data cannot be loaded.

## 10. Shared Component and Design System Rules

The shared directory provides reusable presentation building blocks and the design system. It is not a second feature layer.

- A component belongs in shared/components only when it has two current feature consumers and no financial business meaning.
- A shared component accepts display data and emits user intent only. It cannot issue commands, execute queries, interpret feature error codes, access session data, or know feature entity identities.
- A business component, including ExpenseCard, ExpenseForm, credit-limit warning, RepaymentForm, or category-reassignment flow, remains in its owning feature even when visually reused.
- shared/theme/tokens is the canonical source for all design tokens. A feature cannot define a local competing token.
- shared/theme/colors contains semantic colour names only. Features cannot reference raw colours outside the theme.
- shared/theme/typography contains named type roles only. Features cannot define ad hoc font size, weight, or line-height values.
- shared/theme/spacing contains the approved spacing scale only. Features cannot use arbitrary spacing values.
- shared/theme/icons contains the approved icon inventory. Features cannot introduce an unregistered icon name.
- All destructive-action confirmations use the shared confirmation behaviour and identify the exact action. Confirmation occurs before dispatching a command.
- Promotion to shared/components requires evidence of two consumers and architecture review. An ADR is required if promotion adds a public interaction contract.

## 11. Naming Rules

Names are architectural interfaces and must be consistent.

| Artefact | Required pattern | Example |
| --- | --- | --- |
| Feature directory | lower-case plural noun; kebab case when needed | expenses, credit-cards |
| Component | singular business noun; PascalCase | ExpenseCard, ExpenseForm |
| Hook | use + verb or use + singular noun; PascalCase after use | useExpenseForm, useExpenses |
| Service | singular business noun + Service | ExpenseService |
| Repository | singular business noun + Repository | ExpenseRepository |
| Query | singular or plural business noun + Query | ExpenseQuery, DashboardQuery |
| Command | verb + singular business noun + Command | CreateExpenseCommand |
| Read model | business noun + View or Summary | BudgetSummary, HistoryView |
| Contract | feature noun + Contract | ExpensesContract |
| Error code | upper snake case | REPAYMENT_EXCEEDS_BALANCE |

- One artefact cannot use more than one role suffix. For example, ExpenseService cannot also be a repository or component.
- A name must state the business subject it owns. Generic names such as Manager, Helper, Common, Data, Utils, Handler, or Service are prohibited for feature artefacts.
- Plural names are reserved for collections, lists, or features. Singular names are required for a single entity, command, repository, service, or component.
- A public contract name is stable. Renaming it requires an ADR and a transition plan.
- Acronyms use the product spelling defined by the Domain Model, such as IOU in user-visible names and Borrowing in domain names.

## 12. File Ownership Rules

The file structure must make ownership and review scope obvious.

- Each component file exports exactly one component. Supporting private types may remain in that file only when they are not used elsewhere.
- Each hook file exports exactly one hook.
- Each service file exports exactly one service.
- Each repository file exports exactly one repository.
- Each command file defines exactly one command and its result shape.
- Each query file defines exactly one query and its result shape.
- Each read-model file defines exactly one projection.
- Each domain file owns one entity, value object, enumeration, or rule group. An aggregate root may own its directly associated invariant rules.
- A file cannot contain artefacts from more than one feature.
- A file exceeding one responsibility must be split before another unrelated responsibility is added. File length alone is not a reason to split; responsibility is.
- Barrel files, if used, may re-export public artefacts only. They cannot add logic, state, aliases, or a second public API.
- Code review must name the owning feature for every new source file. Files without a clear owner are blocked.

## 13. Performance Rules

Performance is a quality attribute, not a product promise. It must be managed through explicit, measurable constraints.

- All collection queries must be bounded. An unbounded list query is prohibited.
- History and any future multi-period list use pagination by default. A feature may omit pagination only when its documented maximum result set is bounded and verified by an architecture test.
- Lists whose size can exceed a single viewport must use a virtualized rendering strategy. Rendering the full known data set is prohibited.
- A screen loads only the read models required for its visible state. It cannot pre-load unrelated features or historical periods.
- Non-critical reads are lazy-loaded after the currently visible state is available. A non-critical read must not block expense entry or an accepted command outcome.
- Recalculation must be scoped to the affected user, feature, and viewing period. Global recalculation after a single fact change is prohibited.
- Memoization is prohibited unless a measurement identifies repeat computation as the material cause of a documented performance issue. Each memoization use must state the measured input, baseline, and invalidation condition in its review record.
- Performance changes require before-and-after measurement against a defined scenario. Claims based only on intuition are not accepted.
- Architecture tests must enforce query bounds and prevent full-list rendering paths where the feature supports unbounded user data.

## 14. Module Communication

There are only three approved communication mechanisms.

1. **Published synchronous contract:** invoke a named command or query in src/contracts/<feature>.
2. **Published change notification:** announce an accepted fact-type change with user scope and operation identity, allowing dependent read models to invalidate. Notifications carry no financial calculation responsibility and do not request a response.
3. **Feature service workflow:** one owning feature service coordinates a documented multi-feature action through published contracts.

Direct access to another feature's repository, direct import of another feature's internal source, component-to-component communication across features, shared mutable global feature state, and notifications used as a hidden mutation channel are prohibited.

| Communication need | Required mechanism | Owner |
| --- | --- | --- |
| Create, edit, delete, archive, or repay | Published command | Aggregate-owning feature |
| Request current facts or a projection | Published query | Fact owner or read-model owner |
| Refresh Dashboard or History after acceptance | Notification then query | Source feature and projection owner |
| Delete category with expense reassignment | Feature service workflow using contracts | Categories feature |
| End session and remove active runtime state | Feature service workflow | Identity/app session boundary |

Every contract documents its owning feature, user-scope requirement, input, outcome classes, and change notifications. Consumers may depend only on documented elements.

## 15. Architecture Decision Records (ADR)

An ADR records a durable architecture decision, its context, and consequences. It prevents architecture drift and is required before a decision is implemented.

### ADR requirement

An ADR is mandatory for any change to:

- feature ownership, feature boundaries, or a published contract;
- a dependency rule, folder rule, layer responsibility, naming rule, ownership rule, or performance rule;
- authoritative data ownership, persistence, synchronization, or conflict strategy;
- financial calculation semantics, a domain invariant, or read-model source;
- authentication, user-isolation, privacy, or diagnostics policy;
- a new external or platform capability with access to financial data; or
- a decision that reverses or materially qualifies a previous ADR.

### ADR format and lifecycle

ADRs live at docs/adr/ADR-NNNN-short-title.md and use consecutive four-digit numbers. Each ADR contains exactly these sections:

1. Title and status: Proposed, Accepted, Superseded, or Rejected.
2. Date and decision owner.
3. Context and constraints.
4. Decision.
5. Consequences, including migration and rollback implications.
6. Alternatives considered and why rejected.
7. Supersedes or superseded-by reference, when applicable.

- An ADR is immutable after acceptance except for status and supersession reference. A changed decision requires a new ADR.
- A Proposed ADR does not authorize a source change. Only an Accepted ADR authorizes one.
- A source change that requires an ADR but lacks an accepted ADR is blocked.
- The first ADR records persistence and synchronization boundaries before any financial-data adapter is introduced.
- ADRs preserve the scope and invariants of the three final foundation documents; an ADR is not a mechanism to change them.

