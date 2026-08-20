# Finance Tracker — UI Governance Constitution

> [!IMPORTANT]
> This document is the highest authority for every UI decision within the Finance Tracker project. Every future design, component, screen, interaction, and implementation **must comply** with this governance document.

## 1. Vision
The Finance Tracker UI Governance Constitution establishes the foundational architectural principles, standards, and workflows for all user interface design and implementation. Just as the application's core adheres to Clean Architecture, Domain-Driven Design, and SOLID principles, our user interface demands the same rigorous architectural discipline. This document ensures that every interaction, screen, and component delivers a consistent, accessible, performant, and premium experience.

## 2. Governance Hierarchy
This document dictates the architectural rigor for all UI decisions across the Finance Tracker ecosystem. To remove any ambiguity about precedence, the UI documentation hierarchy strictly follows this order of authority:

```text
00-ui-governance.md (Highest Authority)
        ↓
Design System
        ↓
Component System
        ↓
Navigation
        ↓
Blueprints
        ↓
Rendering Specifications
        ↓
Screen Documentation
        ↓
Implementation
```

## 3. Architecture Compliance
No documentation or implementation may contradict established architectural artifacts.

> [!WARNING]
> No documentation may contradict:
> - Product Requirements
> - Architecture Documents
> - Design System
> - Component System
>
> If a conflict exists:
> **STOP**. Escalate for review immediately.

## 4. Single Source of Truth
To ensure clear ownership and eliminate overlap, the following artifacts act as explicit single sources of truth for their respective domains:

| Artifact                | Owns                      |
| ----------------------- | ------------------------- |
| Requirements            | Product decisions         |
| Design System           | Visual tokens             |
| Component System        | Component behavior        |
| Blueprint               | Screen structure          |
| Rendering Specification | AI rendering instructions |
| Implementation          | Executable UI             |
| Tests                   | Verification              |

## 5. Principles
Our UI architecture is guided by the following principles:
- **Architectural Rigor**: UI is treated as software architecture. It must be modular, reusable, and predictable.
- **Single Source of Truth**: The Design System and Component System dictate all visual and interactive decisions.
- **Inclusivity by Default**: Accessibility is a non-negotiable requirement, integrated from inception.
- **Performance as Design**: System feedback, rendering priorities, and perceived performance are core design responsibilities.
- **Empirical Evolution**: Product decisions are driven by approved requirements, never assumed by tools, designers, or developers.

## 6. Governance Rules
The following non-negotiable rules govern the UI lifecycle.

> [!CAUTION]
> **Rule 1**: Product decisions originate from approved requirements. Never from AI tools. Never from designers. Never from developers.

- **Rule 2**: Every screen must pass through the defined Screen Lifecycle (see Lifecycle Governance). No screen may skip any phase.
- **Rule 3**: Only approved Design System tokens may be used. No hardcoded colors, spacing, typography, shadows, radius, elevation, or animation values.
- **Rule 4**: Every screen must be composed only from approved reusable components. No one-off components. No duplicated components.
- **Rule 5**: Every component must have specification, states, accessibility, motion, documentation, and testing requirements before implementation.
- **Rule 6**: AI tools may improve visual presentation. AI tools may NOT invent features, rename navigation, change hierarchy, remove sections, add widgets, simplify workflows, or redesign interactions.
- **Rule 7**: Every AI-generated design must pass Design Review AND Engineering Review before approval.
- **Rule 8**: Design System is the single source of truth. Every UI decision must reference it.
- **Rule 9**: Component System is the single source of truth for reusable UI. No component may exist outside the Component System.
- **Rule 10**: Blueprint is the single source of truth for screen structure. Visual tools may not change it.

> [!WARNING]
> **Rule 11**: Rendering Specification is the only instruction AI design tools receive. AI tools must never infer missing requirements. If information is missing, STOP and request clarification. Never assume.

- **Rule 12**: Every screen must define Loading, Empty, Error, Offline, Disabled, and Success states before implementation.
- **Rule 13**: Accessibility is mandatory. Every component must support Screen Readers, Large Text, Color Blind Accessibility, Minimum Touch Targets, Focus Order, and Keyboard Navigation where applicable.
- **Rule 14**: Performance is part of design. Every screen must define rendering priority, lazy loading, skeleton loading, scroll behaviour, and performance budget.
- **Rule 15**: Motion must communicate continuity, hierarchy, and confirmation. Never decoration.
- **Rule 16**: Every interaction must provide feedback within 100 milliseconds whenever technically feasible.
- **Rule 17**: Every component must define Analytics Events before implementation.
- **Rule 18**: Every component must define Anti Patterns to prevent misuse.
- **Rule 19**: Every screen must pass UX Review, Accessibility Review, and Engineering Review before implementation.
- **Rule 20**: Documentation must always remain synchronized with implementation. Documentation is part of the product. Not optional.

## 7. Lifecycle Governance

### Screen Lifecycle
Every screen must strictly pass through this defined pipeline:
```text
Blueprint
   ↓
Information Architecture
   ↓
Wireframe
   ↓
Rendering Specification
   ↓
Stitch
   ↓
Design Review
   ↓
Engineering Review
   ↓
Implementation
   ↓
QA
   ↓
Production
```

### Component Lifecycle
Reusable UI components must pass through this rigorous pipeline:
```text
Idea
   ↓
Specification
   ↓
Review
   ↓
L2 Stable
   ↓
Implementation
   ↓
Testing
   ↓
L3 Production
```

## 8. Maturity Levels
There is strict governance around design and implementation maturity.

### Component Maturity
- **L1 Experimental**: Under development, not for production use.
- **L2 Stable**: Approved specification, ready for implementation.
- **L3 Production**: Fully implemented, tested, and actively used.

### Screen Maturity
- **S1 Blueprint**: Structural layout defined and approved.
- **S2 Designed**: Visuals (Stitch/High-Fidelity) approved.
- **S3 Implemented**: Code complete and functionally integrated.
- **S4 Verified**: QA and Accessibility passed.
- **S5 Production**: Live in the main application.

## 9. UI Dependency Rules
To prevent circular UI dependencies and maintain structural integrity, the following strictly downward dependency chain is enforced:
```text
Foundation
   ↓
Layout
   ↓
Components
   ↓
Templates
   ↓
Screens
```
> [!CAUTION]
> Dependencies may only point downward. Circular dependencies are strictly prohibited.

## 10. Journey Governance
User journeys are first-class architectural artifacts. Because UX spans multiple screens, every major feature must formally document its journey before screen blueprints are finalized.

Every documented journey must define:
- **Start**: The trigger or motivation.
- **Goal**: The user's intended outcome.
- **Entry Point**: Where the user enters the flow.
- **Exit Point**: Where the user leaves upon completion.
- **Navigation**: The screen-to-screen routing path.
- **Success Criteria**: What defines a completed journey.
- **Failure States**: Where the journey breaks and how it recovers.

## 11. Component Governance
Components are the atomic building blocks of the UI Architecture.
- **Single Source of Truth**: No component may exist outside the documented Component System.
- **Prerequisites for Implementation**: Prior to any code being written, a component must explicitly define functional specifications, visual states, accessibility guidelines, motion parameters, testing requirements, analytics events, and anti-patterns.
- **Component Registry**: Every component must be logged in the Component Registry, explicitly documenting:
  - Owner
  - Version
  - Status (Maturity Level)
  - Last Review
  - Last Change
- **Deprecation Policy**: When replacing a component, teams must:
  1. Mark the component as deprecated.
  2. Specify the target removal version.
  3. Provide explicit migration guidance for consuming templates and screens.

## 12. Screen Governance
Screens are structured compositions of governed components.
- **Composition Rules**: Screens must be assembled exclusively using approved reusable components. No one-off or ad-hoc components are permitted.
- **State Definitions**: Before implementation, every screen must map out its complete lifecycle states: Loading, Empty, Error, Offline, Disabled, and Success.
- **Performance Budgets**: Screens must document rendering priorities, skeleton loading strategies, lazy loading boundaries, and scroll behaviour expectations.

## 13. AI Usage Policy & Prompt Standards
AI tools are strictly relegated to presentation refinement and production acceleration.
- **Permitted Actions**: Enhancing visual presentation and generating variations based *strictly* on the approved Rendering Specification.
- **Prohibited Actions**: AI tools must never invent features, alter navigation, change information hierarchy, add/remove UI elements, simplify workflows, or redesign interactions.
- **Strict Clarification**: AI tools must never infer missing requirements. If the Rendering Specification is ambiguous or incomplete, the AI tool must halt execution and request explicit clarification.
- **Mandatory Review**: All AI-generated outputs require both rigorous Design Review and Engineering Review.
- **AI Prompt Standards**: To ensure consistency across design tools, every AI prompt must include:
  - Approved Blueprint
  - Approved Component System
  - Rendering Specification
  - Explicit constraints

## 14. Documentation Standards & Decision Log
Documentation is a first-class citizen of the product, treated with the same severity as production code.
- **Synchronization**: Documentation must remain perfectly synchronized with implementation. Stale documentation is considered a critical defect.
- **Centralization**: All tokens, components, patterns, and anti-patterns must be documented in a central, universally accessible repository.
- **Mandatory Completeness**: Incomplete documentation blocks a component or screen from passing Engineering Review.
- **Decision Log**: Every governance or architectural change must be recorded with:
  - Reason
  - Date
  - Reviewer
  - Impact

## 15. Review Checklists

### UX & Design Review Checklist
- [ ] Uses only approved Design System tokens?
- [ ] No hardcoded values (colors, spacing, typography, shadows, radius, etc.)?
- [ ] Adheres strictly to the Blueprint layout?
- [ ] All interaction states defined?
- [ ] Motion communicates hierarchy/confirmation (no decorative motion)?

### Accessibility Review Checklist
- [ ] Compatible with Screen Readers (semantic HTML/ARIA)?
- [ ] Supports Dynamic Type / Large Text scaling?
- [ ] Meets color contrast standards (including Color Blind accessibility)?
- [ ] Minimum touch targets (e.g., 44x44pt) observed?
- [ ] Logical keyboard focus order maintained?

### Engineering Review Checklist
- [ ] Exclusively uses existing reusable components?
- [ ] Performance budget, lazy loading, and rendering priority documented?
- [ ] Analytics events properly defined?
- [ ] Feedback mechanisms ensure < 100ms response?
- [ ] All screen states (Loading, Error, Empty, Offline, Success, Disabled) accounted for?

## 16. Future Expansion Guidelines
As the Finance Tracker project scales across new form factors and platforms:
- **Agnostic Core**: The core Blueprint and Component definitions remain technology and platform-agnostic.
- **Platform Adapters**: Platform-specific nuances (e.g., native navigation paradigms on iOS vs. Web) are handled via documented adapters, never by overriding the core Design System.
- **Governance Inheritance**: All new platforms inherit this Constitution. Amendments require formal Change Management approval.

## 17. Phase 2 Reconciliation & Audit Record

> [!IMPORTANT]
> **Status**: APPROVED & FROZEN 🔒
> **Phase 2 Completion Version**: v2.1.0

### Audit Log & Verification Record
- **Step 1 — Theme Tokens**: Approved & Frozen (`src/shared/theme/colors.ts` Midnight Navy `#0F172A`, `src/shared/theme/typography.ts` tabular numerals).
- **Step 2 — Shared Primitives**: Approved & Frozen (`Card`, `Button`, `Icon`, `StatusIndicator`, `AppBar`, `BottomNavigation`, `FAB` in `src/shared/components/`).
- **Step 3 — Shell Navigation**: Approved & Frozen (5 Primary Tabs: `Home`, `Transactions`, `Budgets`, `Analytics`, `More`).
- **Step 4 — Feature Presentation Foundation**: Approved & Frozen (`TransactionRow`, `TransactionSearch`, `TransactionDateGroup`, `BudgetCard`, `BudgetProgressBar`, `BudgetStatusBadge`, `AccountCard`, `AccountMaskedBalance`).
- **Step 5 — Stitch Integration & Final QA**: Approved & Frozen.

### Final Verification Metrics
- **Visual QA Issues**: P0: 0, P1: 0, P2: 0, P3: 0 (Intentional platform adaptations only)
- **TypeScript (`npx tsc --noEmit`)**: **0 Errors**
- **Automated Tests (`npm test`)**: **159 passed test files / 469 passed tests total**
- **Accessibility**: 100% compliant with 44x44pt minimum touch targets, screen reader attributes, and AAA contrast.
- **Architecture Boundaries**: 100% compliant with Clean Architecture, DDD, ADR-011, and ADR-022.
