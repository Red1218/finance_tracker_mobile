# Dashboard: Stage 0.4 Design System

**Status**: Approved (Frozen)
**Stage**: 0.4

---

## 1. Objectives

This document establishes the reusable visual language and foundational design system for the Finance Tracker Dashboard. Based on the "Trustworthy Minimalism" direction defined in Stage 0.3.5, this system translates abstract visual principles into concrete, reusable design tokens and standards.

The goal is to ensure absolute visual consistency, predictable hierarchy, and a premium user experience across all Dashboard surfaces, serving as the blueprint for eventual component implementation.

---

## 2. Design Philosophy

- **Trustworthy Minimalism**: The interface must project reliability, stability, and precision. We achieve this through rigorous alignment, constrained color palettes, and deliberate whitespace.
- **Content is the Interface**: The financial data is the primary UI element. Containers, borders, and backgrounds exist only to support the reading of this data.
- **Typography Over Color**: Hierarchy is established first through font size and weight. Color is reserved for semantic meaning (good vs. bad) and interactive states.
- **Predictable Rhythm**: A strict mathematical spacing system eliminates visual tension and reduces cognitive load.

---

## 3. Color System

### Semantic Colors
Color is used purposefully to communicate financial status and system state.
- **Success (Positive)**: Used for income, under-budget status, and positive cash flow. Must be a muted, legible green that passes WCAG AA contrast against both light and dark backgrounds.
- **Warning (Caution)**: Used for near-budget limits or unusual activity. A clear, distinct yellow/orange.
- **Error (Negative)**: Used for overspending, failed transactions, and critical alerts. A strong, accessible red.
- **Info (Neutral)**: Used for neutral system messages and non-financial data points. A calming blue.

### Neutral Palette
The foundation of the UI relies on a robust scale of neutral grays (or subtle blue-grays).
- **Backgrounds**: Pure white or extremely light off-white (for Light mode), deep charcoal or near-black (for Dark mode).
- **Surfaces/Cards**: Slightly elevated contrast against the main background to define boundaries without heavy shadows.
- **Borders**: Very subtle, low-contrast grays to separate content gently.
- **Text Primary**: High-contrast near-black (Light) or near-white (Dark). Never pure #000000 or #FFFFFF to prevent eye strain.
- **Text Secondary (Muted)**: Mid-tone grays for labels, timestamps, and contextual data.

### Accent Usage
Accent colors (brand colors) are used strictly for primary interactive elements (e.g., the "Add Transaction" button) and active navigational states. They must never compete with the semantic financial colors.

### Accessibility Considerations
All text-to-background color combinations must meet a minimum contrast ratio of 4.5:1 (WCAG AA). 

---

## 4. Typography System

### Font Families
- **Primary (UI & Data)**: A modern, highly legible sans-serif typeface (e.g., Inter, Roboto, or SF Pro) featuring tabular lining for numbers so that financial data aligns perfectly in columns.

### Type Scale
A modular scale that supports both massive KPI numbers and microscopic contextual labels.
- **Display**: Massive size for the primary Financial Summary (e.g., Net Cash Flow).
- **Heading 1**: Large, for section headers.
- **Heading 2**: Medium, for card titles.
- **Heading 3**: Small, bold, for sub-groupings.
- **Body Large**: Standard readable text.
- **Body Default**: Standard UI text.
- **Body Small**: Muted labels and secondary data.

### Font Weights
- **Regular**: For body copy and secondary labels.
- **Medium/Semibold**: For primary data points, table headers, and primary actions.
- **Bold**: Used sparingly for extreme emphasis.

### Hierarchy
Hierarchy is achieved by combining size, weight, and color. 
*Example: Primary KPI (Display size, Semibold weight, Primary text color) vs. its label (Body Small size, Regular weight, Muted text color).*

---

## 5. Spacing System

### Base Spacing Unit
The system utilizes a strict **4-point** or **8-point** mathematical grid. All margins, padding, and layout gaps must be a multiple of this base unit (e.g., 4, 8, 12, 16, 24, 32, 48, 64).

### Layout Rhythm
- **Micro Spacing**: Tight gaps (4-8pt) between highly related elements (e.g., a KPI value and its label).
- **Component Spacing**: Medium gaps (16-24pt) inside cards (padding).
- **Macro Spacing**: Large gaps (32-48pt) between distinct Layout Zones (e.g., between Summary and Analysis).

---

## 6. Grid System

### Desktop
- **Columns**: 12-column fluid grid.
- **Gutters**: Consistent 24pt gaps.
- **Max Width**: Constrained maximum width to prevent text lines from becoming unreadable on ultra-wide monitors.

### Tablet
- **Columns**: 8-column grid.
- **Gutters**: 16pt to 24pt gaps.
- **Behavior**: Two-column layouts may collapse into a single wider column depending on data density.

### Mobile
- **Columns**: 4-column grid.
- **Gutters**: 16pt gaps.
- **Margins**: Consistent 16pt outer margins to ensure edge-to-edge content feels contained.

---

## 7. Elevation & Surfaces

### Card Treatments
In adherence to the Visual Inspiration Review, cards represent the primary container for information.
- **Style**: Flat design. Background color matches the primary surface token.
- **Borders**: A 1px solid, low-contrast border defines the edge.
- **Border Radius**: Consistent, medium rounding (e.g., 8pt or 12pt) to soften the interface without looking overly playful.

### Shadows
- **Resting State**: No drop shadows for static cards to reduce visual noise.
- **Hover/Active State**: A subtle, highly diffused shadow may be introduced on interactive cards to indicate clickability.
- **Modals/Popovers**: Deep, soft shadows to indicate z-index elevation above the main dashboard.

---

## 8. Iconography

### Style
- Minimalist, stroke-based (outline) icons.
- Consistent stroke width (e.g., 1.5pt or 2pt) that harmonizes with the Regular font weight.

### Sizing
- **Small (16x16)**: Inline with body text or inside dense lists.
- **Medium (24x24)**: Standard UI controls and action buttons.
- **Large (32x32+)**: Empty state illustrations or category headers.

### Usage Rules
Icons must serve a functional purpose (e.g., navigation, category identification, or status indication) rather than acting as pure decoration.

---

## 9. Data Visualization Principles

### Charts
- **Utilitarian Aesthetic**: Charts are tools for trend identification, not art.
- **Clean Mode**: Axes, gridlines, and legends should be invisible or heavily muted by default.
- **Interaction**: Detailed data points are revealed via hover (desktop) or press-and-hold (mobile) tooltips.

### KPIs
- Massive typography for the primary number.
- Adjacent directional indicator (arrow/triangle) paired with a semantic color (green/red) to denote period-over-period momentum.

### Sparklines
- Used inside lists or small cards to show trend trajectory without requiring axes or labels.

### Tables
- No vertical grid lines.
- Subtle horizontal borders to separate rows.
- Right-aligned for monetary values; left-aligned for text.

---

## 10. Motion Principles

### Purpose
Motion is used exclusively to orient the user, provide feedback, or smooth transitions. It is never used for decoration.

### Duration
- **Snappy**: Interactions (button clicks, hovers, toggles) should respond instantly (100ms - 200ms).
- **Transitions**: Page transitions or modal reveals should be smooth but fast (200ms - 300ms).

### Easing
- Use standard ease-out curves so UI elements feel responsive immediately and settle smoothly into place.

### Reduced Motion Support
- The system must respect OS-level "prefers-reduced-motion" settings, replacing slides and scales with simple crossfades or instant state changes.

---

## 11. Accessibility Standards

### Contrast
- Strict adherence to WCAG AA standards (4.5:1 for normal text, 3:1 for large text and UI components).

### Focus States
- Keyboard navigation must be supported natively.
- Focus rings must be highly visible, utilizing the primary brand accent color, and never disabled via CSS `outline: none` without a superior fallback.

### Screen Reader Considerations
- Semantic HTML (when implemented) is required.
- Complex charts must provide a visually hidden tabular data alternative or a descriptive summary.

---

## 12. Design Tokens (Conceptual)

The following conceptual tokens form the vocabulary of the design system:

- **Color Tokens**: `color-semantic-success`, `color-semantic-error`, `color-surface-base`, `color-surface-card`, `color-text-primary`, `color-text-muted`, `color-border-subtle`.
- **Typography Tokens**: `font-size-display`, `font-size-body`, `font-weight-medium`, `line-height-relaxed`.
- **Spacing Tokens**: `space-micro`, `space-component-padding`, `space-section-gap`.
- **Radii Tokens**: `radius-card`, `radius-button`, `radius-pill`.

---

## 13. Global Design Rules

Derived from Stage 0.3.5, these permanent constraints govern all future Dashboard design:

1. **Typography-First Hierarchy**: Establish at least 4 distinct levels of text hierarchy before relying on color.
2. **Semantic Color Limitation**: Accent/Brand colors must never conflict with Success (Green), Warning (Yellow), or Error (Red).
3. **Flat Card Containers**: Use subtle borders instead of heavy drop shadows for static containers.
4. **Rigid Spacing Scale**: All spacing must map to the base grid (e.g., multiples of 4 or 8).
5. **Chart Minimalization**: Data visualizations must default to a clean, decluttered state.
6. **Action Prominence**: Primary buttons must be the most visually distinct elements in their layout zone.
7. **Standardized Empty States**: Must include an icon, heading, muted description, and primary action.
