# Finance Tracker — Component System

> [!IMPORTANT]
> **Status**: Approved & Frozen
> **Version**: 1.0
> 
> In accordance with the UI Governance Constitution (`00-ui-governance.md`), this document is the **Single Source of Truth** for the architecture, behavior, and lifecycle of every reusable UI component.

## 1. Introduction
The Finance Tracker Component System establishes the behavioral architecture, lifecycle, and composition rules for all reusable UI elements. While the Design System dictates *how things look*, this Component System dictates *how things are built and behave*. It ensures that every component is predictable, robust, and infinitely reusable across the product ecosystem.

## 2. Component Philosophy
Our component philosophy is built on absolute modularity and predictability:
- **Composable**: Components are designed to nest and interlock seamlessly without tight coupling.
- **Predictable**: A component's behavior must match its API contract universally.
- **Minimal**: Components only include the logic necessary for their specific function.
- **Token-Driven**: Components derive all visual styling exclusively from Design System tokens.
- **Stateless Where Possible**: Components should rely on external property injection rather than internal state management.

## 3. Component Architecture
A component in the Finance Tracker ecosystem is not just a UI fragment; it is a governed micro-architecture. Every component must strictly separate its concerns:
- **Structure**: The semantic structural markup.
- **Style**: The application of Design System tokens.
- **Behavior**: The interaction and logic state machine.
- **Accessibility**: The ARIA and focus management layers.

## 4. Component Taxonomy
To maintain a scalable component library, components are classified into strict taxonomical tiers:
- **Foundation**: Tokens, typography, iconography, and spacing.
- **Primitive**: The most basic elements (e.g., Icon, Text, Surface). No business logic.
- **Composite**: Standalone interactive components (e.g., Button, Input, Checkbox, Tag).
- **Pattern**: Compositions of Composites (e.g., SearchBar, DatePicker).
- **Template**: Large structural layouts that dictate screen flow (e.g., PageHeader, MasterDetailView) without holding screen-specific data.
- **Screen**: Feature-specific, state-aware assemblies.

## 5. Component Folder Standard
Every component must follow a strict, unified folder structure to ensure predictability across the repository.
```text
components/
    Button/
        Button.tsx
        Button.test.tsx
        Button.stories.tsx
        Button.md (Specification)
        index.ts
```

## 6. Component Composition Rules
Components must be assembled following strict composition principles:
- **Inversion of Control**: Components should accept child components (slots/children) rather than hardcoding complex internal structures.
- **Separation of Concerns**: A component must not dictate the layout of its parent. It should fill the space it is given or expose explicit sizing properties.
- **Prop Drilling Prohibition**: Deeply nested components must utilize context or slots rather than passing properties through multiple unrelated intermediate layers.

## 7. Component Dependency Rules
To prevent architectural gridlock, circular UI dependencies are strictly prohibited. The dependency graph flows unidirectionally downwards.

### Dependency Matrix
| Can Depend On | Foundation | Primitive | Composite | Pattern | Template | Screen |
| ------------- | ---------- | --------- | --------- | ------- | -------- | ------ |
| Foundation    | ❌          | ❌         | ❌         | ❌       | ❌        | ❌      |
| Primitive     | ✅          | ❌         | ❌         | ❌       | ❌        | ❌      |
| Composite     | ✅          | ✅         | ❌         | ❌       | ❌        | ❌      |
| Pattern       | ✅          | ✅         | ✅         | ❌       | ❌        | ❌      |
| Template      | ✅          | ✅         | ✅         | ✅       | ❌        | ❌      |
| Screen        | ✅          | ✅         | ✅         | ✅       | ✅        | ❌      |

## 8. Platform Mapping
The Component System architecture is platform-agnostic. Implementations map downward from a unified contract:
```text
Component Contract
   ↓
React Native
   ↓
Web
   ↓
Desktop
   ↓
Future Platforms
```

## 9. Component Lifecycle
Every reusable component must pass through a strict governance pipeline:
```text
Idea (Proposal)
   ↓
Specification (API & States Defined)
   ↓
Review (Architecture & UX Sign-off)
   ↓
L2 Stable (Implemented & Usable)
   ↓
Testing (Unit, A11y, Visual Regression)
   ↓
L3 Production (Live & Maintained)
```

## 10. Component Maturity Model
The maturity level of a component dictates its readiness for production use:
- **L1 Experimental**: Under active development. API is subject to breaking changes. Forbidden in production environments.
- **L2 Stable**: API is locked. Initial implementation is complete. Safe for integration in feature branches.
- **L3 Production**: Fully tested (Visual, Unit, Accessibility). Documentation is complete. Actively deployed in production.

## 11. Component Specification Template
Every component must formally document its contract using this exact template format:
- **Name**: 
- **Purpose**: 
- **Category**: (Primitive, Composite, Pattern, etc.)
- **Ownership**: Owner, Reviewer, Approver, Last Audit
- **Version**: 
- **Dependencies**: 
- **Uses Tokens**: Surface, Typography, Spacing, Elevation, Motion
- **Inputs (Props)**: 
- **Outputs (Events)**: 
- **Slots/Children**: 
- **States**: 
- **Variants**: 
- **Accessibility**: 
- **Motion**: 
- **Performance**: 
- **Analytics**: 
- **Anti-patterns**: 
- **Tests**: 

## 12. Component Examples
Every specification must include concrete examples demonstrating architectural intent.

### Correct Usage
```tsx
<Button variant="primary">
    Save
</Button>
```

### Incorrect Usage
```tsx
// Anti-pattern: Hardcoded visual overrides bypass the Token System
<Button
    style={{ backgroundColor: "#FF0000" }}
>
    Save
</Button>
```

## 13. Component States
Every interactive component must explicitly define its behavioral state machine. Standard states include:
- **Default**: The resting state.
- **Hover**: Cursor interaction (where applicable).
- **Active / Pressed**: During interaction execution.
- **Focus**: Keyboard navigation focus.
- **Disabled**: Non-interactive, preserving layout.
- **Loading / Processing**: Awaiting asynchronous resolution.
- **Error**: Validation failure or critical state.

## 14. Component Variants
Variants define structural or semantic shifts in a component without altering its core API.
- **Semantic Variants**: e.g., `Primary`, `Secondary`, `Destructive`.
- **Size Variants**: e.g., `Small`, `Medium`, `Large`.
- **Structural Variants**: e.g., `Icon Only`, `Text + Icon`.

## 15. Accessibility Requirements
Accessibility is an architectural requirement, not a feature. Every component must document and implement:
- **ARIA Roles**: Semantic structural definitions.
- **State Attributes**: `aria-disabled`, `aria-expanded`, `aria-invalid`, etc.
- **Focus Management**: Trap focus for modals, ensure logical tab order, and provide visible focus rings derived from Design System tokens.
- **Keyboard Interaction**: Full support for `Enter`, `Space`, `Escape`, and arrow keys where semantically appropriate.

## 16. Motion Requirements
Motion logic is embedded in the component behavior, utilizing Design System tokens.
- **State Transitions**: Defined easing and duration for entering/exiting states (e.g., hover, focus).
- **Entrance/Exit**: Logic for mounting and unmounting animations.
- **Reduced Motion**: Every component must honor system-level `prefers-reduced-motion` settings, falling back to instant state changes or crossfades.

## 17. Performance Requirements
Components must respect rendering and execution budgets.
- **Render Optimization**: Strict avoidance of unnecessary re-renders. Component logic must be optimized where appropriate.
- **Bundle Size**: Components must be tree-shakeable. Heavy dependencies within primitive components are prohibited.
- **Initialization**: Minimal layout shift (CLS) during component mount.

## 18. Analytics Requirements
Components that trigger user journeys or critical actions must support standardized telemetry.
- **Interaction Events**: Emitting unified events for clicks, toggles, or submissions.
- **Visibility Events**: Emitting events when critical components enter the viewport.
- **Payload Standards**: Analytics payloads must remain agnostic to business logic, passing generic data like component ID, variant, and state.

## 19. Documentation Standard & Review Checklist
Documentation is considered part of the component's executable code. Every component review must answer:
- [ ] API consistent?
- [ ] Token driven?
- [ ] Accessible?
- [ ] Motion documented?
- [ ] Analytics documented?
- [ ] Anti-patterns defined?
- [ ] Tests defined?
- [ ] Dependency rules respected?

## 20. Component Health Metrics
The Component Registry actively tracks the health of all components using these metrics to ensure long-term maintainability:
- **Coverage**
- **Accessibility**
- **Bundle Size**
- **Performance**
- **Documentation**
- **Usage Count**

## 21. Testing Standard
No component reaches L3 Production without rigorous verification.
- **Unit Testing**: Verifying all logical branches, state changes, and event emissions.
- **Visual Regression Testing**: Capturing baseline images of all variants and states to prevent unintended visual drift.
- **Accessibility Testing**: Automated parsing to guarantee contrast, ARIA validity, and structural compliance.

## 22. Versioning & Breaking Change Policy
The Component System follows strict Semantic Versioning.

### Breaking Changes (Major)
- Remove a prop
- Rename a prop
- Remove a slot
- Remove a variant

### Non-Breaking Changes (Minor/Patch)
- Add an optional prop
- Improve accessibility
- Improve performance

## 23. Deprecation Policy
When a component's architecture is superseded, it enters formal deprecation:
1. **Mark as Deprecated**: The component metadata is updated, triggering warnings in development environments.
2. **Specify Removal**: A strict semantic version is declared for the component's removal.
3. **Migration Guidance**: Explicit instructions must be documented detailing how consuming screens transition to the replacement component.

## 24. Component Registry
The Component Registry is the centralized index of the UI architecture. It tracks every component's adherence to this system, exposing its maturity level, version, owner, health metrics, and documentation link. A component does not exist in the Finance Tracker ecosystem if it is not governed by the Registry.

## 25. Future Expansion
As the platform scales to new environments (e.g., Wearables, distinct Web/Native rendering engines), the Component System remains the governing blueprint. Platform-specific implementations must map exactly to this defined Component Taxonomy, ensuring architectural unity regardless of the underlying rendering technology.
