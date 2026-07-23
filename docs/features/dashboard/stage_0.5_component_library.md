# Dashboard: Stage 0.5 Component Library

**Status**: Approved (Frozen)
**Stage**: 0.5

---

## 1. Objectives

This document defines the reusable UI component architecture for the Finance Tracker Dashboard. Based on the approved Design System (Stage 0.4), this document specifies the responsibilities, anatomy, variants, states, composition rules, and usage guidelines for every Dashboard component. 

The goal is to establish a rigorous, implementation-agnostic blueprint that ensures all Dashboard components are built consistently, predictably, and with accessibility by default, before any code is written.

---

## 2. Component Philosophy

The Dashboard Component Library is governed by the following principles:

- **Single Responsibility**: Each component does exactly one thing well. A KPI card displays a single metric; it does not also try to be a chart.
- **Consistency**: Components must adhere strictly to the Design System tokens (typography, color, spacing). Custom overrides are prohibited.
- **Composability**: Complex interfaces are built by assembling smaller, simpler components (e.g., a Section Card containing a Chart Container and an Empty State).
- **Accessibility by Default**: Every component must natively support keyboard navigation, screen reader announcements, and focus states.
- **Predictability**: Components must behave in the exact same way across all contexts. A primary button always triggers a primary action.
- **Progressive Disclosure**: Components should display only the most critical information by default, revealing secondary data only upon user interaction (hover/press).

---

## 3. Dashboard Component Inventory

### Foundational Layout Components
- **Page Header**: Contextualizes the view. Contains the page title and global actions.
- **Period Selector**: Allows the user to change the active financial timeframe.
- **Section Card**: The primary container for grouped information. 

### Data Display Components
- **KPI Card**: Displays a single, highly emphasized primary metric and an optional trend indicator.
- **Budget Health Card**: Displays a budget consumption metric paired with a progress visual.
- **Category Breakdown Card**: Contains the ranked list of spending categories.
- **Trend Card**: Displays period-over-period momentum.
- **Sparkline**: A miniature, axis-free line or bar chart used to show trajectory.
- **Chart Container**: A dedicated wrapper for data visualizations, handling loading/empty states and tooltips.

### Action & Navigation Components
- **Quick Action Card**: A compact container triggering a high-priority user flow (e.g., Add Transaction).
- **Primary Button**: Used for the single most important action in a view.
- **Secondary Button**: Used for alternative actions.
- **Filter Bar**: Contains controls to manipulate the data displayed in a section.

### List Components
- **Recent Activity List**: The container for a feed of transactions.
- **Activity Row**: A single item within the Activity List.

### Feedback & Status Components
- **Metric Badge**: A small indicator showing a percentage or fixed amount change.
- **Status Badge**: A visual indicator of health (e.g., "On Track", "Over Budget").
- **Empty State**: Replaces content when no data is available.
- **Loading State**: A skeleton or spinner indicating data retrieval.
- **Error State**: A fallback UI when a component fails to render or fetch data.

---

## 4. Component Anatomy

Major components share a predictable anatomy:

**Section Card Anatomy:**
- **Header**: Contains the Title (H2) and optional contextual actions (e.g., a filter icon).
- **Body**: The primary content area (charts, lists, or text).
- **Footer**: Optional. Contains drill-down actions (e.g., "View All").
- **Supporting Content**: Optional subtitles or tooltips explaining the data.

**Activity Row Anatomy:**
- **Leading Element**: An icon or avatar representing the category or merchant.
- **Body**: The primary label (Merchant) and secondary label (Date/Category).
- **Trailing Element**: The monetary amount, formatted appropriately.

---

## 5. Component States

Every interactive and data-driven component must account for the following states:

- **Default**: The resting state.
- **Hover**: Cursor is over the component (Desktop only).
- **Focus**: Navigated to via keyboard (must show a highly visible focus ring).
- **Active**: Currently being clicked or tapped.
- **Selected**: The active item in a list or group.
- **Disabled**: Non-interactive. Must remain legible but visually muted.
- **Loading**: Data is being fetched. Often represented by a skeleton loader matching the component's default dimensions.
- **Empty**: A zero-data scenario. Displays the standardized Empty State layout.
- **Error**: A failure scenario. Displays an inline Error State allowing the user to retry.

---

## 6. Component Variants

Components are designed with specific variants to handle different contexts without requiring custom overrides.

**KPI Card Variants:**
- **Standard**: Full-size card with a large metric and trend badge.
- **Compact**: Smaller typography, horizontally aligned, used when stacking multiple KPIs.
- **Highlighted**: Uses a subtle background tint to draw extreme focus (e.g., Net Worth).

**Button Variants:**
- **Primary**: Solid background using the accent color. High emphasis.
- **Secondary**: Outline or subtle background. Medium emphasis.
- **Ghost**: Text only, no background until hovered. Low emphasis.
- **Icon**: Contains only an icon, used for compact utility actions.

**Badge Variants:**
- **Positive**: Success semantic color.
- **Negative**: Error semantic color.
- **Neutral**: Info/Muted semantic color.
- **Warning**: Caution semantic color.

---

## 7. Composition Rules

- **Nesting Limits**: To prevent visual clutter, Section Cards may not be nested inside other Section Cards. 
- **Component Containment**: KPI Cards, Charts, and Activity Lists must always be rendered *inside* a Section Card or equivalent container. They should not float freely on the page background.
- **Spacing Expectations**: Components inside a Section Card body must use the `space-component-padding` token. Components stacked vertically outside must use the `space-section-gap` token.
- **Hierarchy**: A layout may contain only one Primary Button per logical grouping.

---

## 8. Responsive Behavior

All components must adapt seamlessly to screen sizes:

- **Desktop**: Components utilize maximum padding. Section Cards may sit side-by-side. Tooltips are triggered on hover.
- **Tablet**: Components retain standard padding but may stretch to full width. Side-by-side elements may wrap.
- **Mobile**: 
  - Padding is reduced to maximize screen real estate.
  - Interactive elements (Buttons, Activity Rows) must expand to a minimum height of 44pt/48pt to ensure thumb-friendly touch targets.
  - Side-by-side layouts (e.g., KPI rows) stack vertically.
  - Hover states are disabled; tooltips require a tap.

---

## 9. Accessibility Requirements

- **Keyboard Behavior**: Every interactive component (Buttons, Filter Bars, Activity Rows) must be reachable via the `Tab` key and actionable via `Enter` or `Space`.
- **Screen Reader Expectations**: 
  - KPI Cards must read the metric and its label together logically.
  - Trend indicators (e.g., a green up arrow) must have hidden text (e.g., "Increased by 5%").
  - Chart Containers must provide an `aria-label` summarizing the chart or offer a toggle to view the data as a table.
- **Focus Management**: Focus must never be trapped inside a component. Modals and overlays must lock focus until dismissed, then return focus to the triggering element.
- **Touch Targets**: All interactive elements on touch devices must be at least 44x44 points.

---

## 10. Usage Guidelines

### KPI Card
- **When to use**: To display the single most important number for a given section.
- **When not to use**: Do not use for long lists of data or non-numeric information.
- **Best practices**: Always pair with a descriptive label.

### Activity Row
- **When to use**: Displaying a list of transactions or events.
- **When not to use**: Do not use for primary navigation menus.
- **Common mistakes**: Truncating monetary values. Amounts must always be fully visible.

### Empty State
- **When to use**: When a list, chart, or section has no data to display.
- **When not to use**: Do not use as a loading indicator.
- **Best practices**: Always include a clear call-to-action (Primary Button) explaining how the user can add data to resolve the empty state.

---

## 11. Future Expansion

The following components are identified as likely requirements for future Dashboard phases and should be accommodated in the architecture:

- **Carousel/Slider**: For swiping through multiple budget categories horizontally on mobile.
- **Date Range Picker**: A complex input for custom reporting periods.
- **Interactive Data Table**: A highly dense, sortable table for advanced analytics views.
- **Alert Banner**: A dismissible, high-priority message component spanning the top of the viewport.
