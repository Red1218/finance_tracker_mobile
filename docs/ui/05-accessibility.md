# Finance Tracker — Accessibility Architecture

> [!IMPORTANT]
> **Status**: Approved & Frozen
> **Version**: 1.0
> 
> In accordance with the UI Governance Constitution (`00-ui-governance.md`), this document is the **Single Source of Truth** for the application's accessibility architecture.

## 1. Introduction
The Finance Tracker Accessibility Architecture ensures that the application is universally usable, regardless of physical, visual, or cognitive ability. This document dictates the structural requirements for rendering, navigation, and feedback, treating accessibility as a foundational architectural constraint rather than an afterthought or a final QA checklist.

## 2. Accessibility Philosophy
Accessibility is architecture. In a financial application, access to information and the ability to execute transactions is a fundamental requirement of trust. If a user cannot perceive, operate, or understand the interface, the architecture has failed. We build for everyone by default.

## 3. Accessibility Principles
- **Perceivability**: Information must be presented in ways all users can perceive (e.g., text alternatives, sufficient contrast).
- **Operability**: The interface must be fully operable via diverse inputs (touch, keyboard, voice).
- **Understandability**: Content and interactions must be predictable, deterministic, and clearly communicated.
- **Robustness**: The underlying structure must be strictly semantic, ensuring compatibility with current and future assistive technologies.

## 4. Accessibility Architecture & Ownership
Accessibility logic sits at the intersection of the Component System and the Navigation Architecture. To prevent gaps in coverage, ownership is strictly defined:

| Concern | Owner |
|---------|-------|
| Color Contrast | Design System |
| Semantics | Component System |
| Focus | Navigation |
| Motion Reduction | Motion |
| Testing | QA |

## 5. Accessibility Lifecycle
For consistency with other governance models, accessibility is verified throughout the entire lifecycle:

```text
Design
   ↓
Specification
   ↓
Implementation
   ↓
Automated Audit
   ↓
Manual Audit
   ↓
Production
```

## 6. Accessibility Decision Matrix
Developers must not guess the required accessibility solution. The following matrix makes implementation deterministic:

| Scenario | Required Solution |
|----------|-------------------|
| Icon-only button | Visually hidden accessible label |
| Chart | Expandable data table or textual summary |
| Dialog / Modal | Absolute focus trap |
| Snackbar | ARIA live region (polite) |
| Infinite list | Mechanism to bypass or reach footer |
| Gesture-only action | Alternate single-tap or button action |

## 7. Semantic Structure
Every screen must be built upon a robust, semantic foundation.
- **Document Outline**: Every screen must have a single `h1` equivalent representing the primary context. Headings (`h2`-`h6`) must strictly follow a logical hierarchy without skipping levels.
- **Landmarks**: Core structural regions (Navigation, Main Content, Search) must be explicitly defined using standard semantic landmarks to allow rapid navigation by assistive technology.

## 8. Screen Reader Support
The application must provide a first-class experience for screen reader users (e.g., VoiceOver, TalkBack).
- **Alt Text**: Non-decorative imagery must have concise, descriptive alternative text.
- **Hidden Text**: Information conveyed purely through visual layout (e.g., color-coding for profit/loss) must have visually hidden, screen-reader-accessible equivalents.
- **State Announcements**: Components must dynamically broadcast their states (e.g., `expanded`, `selected`, `disabled`) explicitly via ARIA or native platform traits.

## 9. Focus Management
Focus is the primary indicator of context for non-mouse users.
- **Visible Focus**: Every interactive element must display a highly visible focus ring derived from Design System tokens when receiving keyboard focus.
- **Focus Trapping**: Modals, Dialogs, and Bottom Sheets must trap focus entirely. The user must not be able to tab into the background while an overlay is active.
- **Focus Restoration**: When a modal or dialog closes, focus must reliably return to the exact element that originally triggered it.

## 10. Keyboard Navigation
The entire application must be operable without a pointing device.
- **Logical Tab Order**: The focus order must follow the visual and logical reading order (left-to-right, top-to-bottom). Tab indexes must not be manipulated to force artificial orders.
- **Standard Interactions**: Components must respond to expected keyboard inputs (e.g., `Space` / `Enter` for buttons, `Arrows` for tabs/radios, `Escape` to dismiss overlays).

## 11. Touch Accessibility
Mobile and touch environments must accommodate varying degrees of physical precision.
- **Hit Targets**: All interactive elements must have a minimum touch target size of 44x44 CSS pixels (or equivalent platform metric), regardless of their visual size.
- **Spacing**: Adequate spacing must exist between touch targets to prevent accidental activations.
- **Gestures**: Complex gestures (e.g., multi-finger swipes, drag-and-drop) must always provide a simple, single-tap alternative.

## 12. Dynamic Type
Financial data must remain legible for all users.
- **Scaling**: All text must seamlessly support OS-level text scaling (Dynamic Type on iOS, Font Size on Android) up to 200% without breaking layouts or truncating critical financial data.
- **Fluid Layouts**: Containers must grow vertically to accommodate scaled text rather than horizontally overflowing or clipping content.

## 13. Color & Contrast
Color must never be the sole method of conveying information.
- **Contrast Ratios**: Standard text must meet a minimum 4.5:1 contrast ratio against its background. Large text and critical UI boundaries (icons, form borders) must meet 3.0:1.
- **Color Independence**: Status indicators (e.g., red for a negative balance, green for positive) must always be accompanied by semantic icons (e.g., arrows) or explicit text labels.

## 14. Motion Accessibility
Motion is governed by the rules defined in `04-motion.md`.
- **System Overrides**: The application must strictly honor the OS-level `prefers-reduced-motion` setting, stripping spatial animations in favor of instant cuts or crossfades.
- **No Strobing**: Flashing or strobing effects are entirely forbidden to prevent triggering seizures.

## 15. Forms & Input
Forms are the primary method of data mutation and must be flawless.
- **Explicit Labels**: Every input must have a programmatically associated label. Placeholder text is never a replacement for a label.
- **Error Context**: Validation errors must be programmatically linked to their corresponding inputs so screen readers announce the error when the input gains focus.
- **Input Types**: Appropriate keyboard types (e.g., numeric, email) must be invoked based on the input context to minimize friction.

## 16. Financial Accessibility
Finance applications present unique accessibility challenges that demand specific rules to ensure clarity and trust.
- **Currency**: Must be formatted so it is announced naturally by screen readers (e.g., "$1,200.50" spoken as "One thousand two hundred dollars and fifty cents").
- **Negative Values**: Must be clearly distinguished semantically to screen readers, not just visually with a red minus sign.
- **Percentages**: Must be spoken correctly and without ambiguity.
- **Large Numbers**: Must be grouped correctly according to the user's locale to aid cognitive parsing.
- **Transaction Tables**: Must preserve logical reading order so screen reader users hear the date, description, and amount in a cohesive, unified sequence.

## 17. Charts & Data Visualization
Visualizing financial data inherently poses accessibility challenges.
- **Data Alternatives**: Every chart must provide an accessible alternative, typically an expandable data table or a screen-reader-optimized summary view.
- **Pattern Fills**: When distinguishing chart lines or bars, utilize varying stroke patterns or distinct shapes alongside color to ensure legibility for color-blind users.

## 18. Error Communication
Errors in financial software cause anxiety; they must be communicated clearly and calmly.
- **Descriptive Text**: Error messages must explicitly state what went wrong and how the user can fix it, avoiding generic or overly technical jargon.
- **Focus Redirection**: When a form submission fails due to validation errors, focus must automatically move to an error summary or the first invalid input.

## 19. Notifications & Live Regions
Critical asynchronous events must reach all users.
- **Live Regions**: Toast notifications, snackbars, and dynamic status updates must utilize ARIA live regions (or platform equivalents) to announce their presence to screen readers without stealing focus.
- **Politeness**: Non-critical updates should use "polite" announcements, waiting until the screen reader finishes its current sentence. Critical alerts should use "assertive" announcements.

## 20. Accessibility Testing & Review Checklist
Before a component or screen reaches L3 Production, it must pass formal verification:
- [ ] Semantic role is correct.
- [ ] Accessible name is present.
- [ ] Focus behavior is explicitly defined and trapped where necessary.
- [ ] Dynamic type is supported without clipping.
- [ ] Contrast meets WCAG 2.2 AA targets.
- [ ] Reduced motion is respected.
- [ ] Keyboard interaction is fully operable.

## 21. Accessibility Registry
Similar to the Component Registry, accessibility support is tracked globally per component.

| Component | Screen Reader | Keyboard | Dynamic Type | Status |
|-----------|---------------|----------|--------------|--------|
| Button | ✅ | ✅ | ✅ | Compliant |
| Dialog | ✅ | ✅ | ✅ | Compliant |
| Chart | ✅ | ⚠️ | ❌ | Remediation |

## 22. Compliance Targets
Finance Tracker targets strict adherence to **WCAG 2.2 AA** guidelines globally, acting as the non-negotiable baseline for all design and implementation reviews.

## 23. Accessibility Anti-Patterns
To preserve usability, the following practices are strictly prohibited:

> [!WARNING]
> **Never:**
> ❌ **Outline Removal**: Removing focus rings (`outline: none`) without providing an accessible alternative.
> *Why: Keyboard users lose their spatial location entirely.*
> 
> ❌ **Div Buttons**: Building interactive elements out of non-semantic primitives (e.g., `div` or `View`) without applying full ARIA roles.
> *Why: Screen readers will not announce them as interactive, and they lack native keyboard event listeners.*
> 
> ❌ **Placeholder-only Labels**: Using input placeholders as the sole label for a field.
> *Why: Screen readers lose persistent field context the moment the user begins typing, causing cognitive loss.*
> 
> ❌ **Infinite Scroll Traps**: Implementing infinite scrolling without providing a bypass mechanism.
> *Why: Keyboard and screen reader users can never navigate past the list to reach the footer or subsequent content.*

## 24. Versioning
Changes to accessibility standards fall under Semantic Versioning.
- **Major**: Adopting a new global standard level (e.g., moving to WCAG 2.2 AAA).
- **Minor**: Introducing new semantic components or major automated testing integrations.
- **Patch**: Contrast tweaks and minor label corrections.
