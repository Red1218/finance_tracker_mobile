# Dashboard: Stage 0.3.5 Visual Inspiration Review

**Status**: Approved (Frozen)
**Stage**: 0.3.5

---

## 1. Purpose

The purpose of this document is to review and evaluate existing dashboard designs to establish a definitive visual direction for the Finance Tracker Dashboard before creating the Design System (Stage 0.4). 

This document is not intended to copy existing products. Instead, it identifies proven design patterns, analyzes why they work, rejects patterns that conflict with the Finance Tracker Product Vision, and produces a set of permanent visual design decisions. Every visual decision must support the approved Product Vision, Information Architecture, and Layout principles.

---

## 2. Review Methodology

We evaluated 10 industry-leading dashboards across four distinct categories to gather a diverse set of patterns:
- **Finance Dashboards**: Monarch Money, Copilot Money, YNAB
- **SaaS Dashboards**: shadcn/ui Dashboard, Vercel Dashboard, Linear Dashboard
- **Analytics Dashboards**: Grafana, Metabase
- **Enterprise Dashboards**: Stripe Dashboard, GitHub Insights

Each dashboard was reviewed objectively against the Finance Tracker requirements for information hierarchy, cognitive load, layout, typography, data visualization, and navigation.

---

## 3. Dashboard Reviews

### Monarch Money

#### Overall Impression
A clean, consumer-friendly personal finance dashboard that balances aesthetics with data density.

#### Information Hierarchy
- Prioritization: Excellent focus on net worth and cash flow.
- Scanning speed: High.
- Readability: Strong use of whitespace.
- Cognitive load: Low; metrics are well isolated.

#### Layout
- Page structure: Modular widget-based grid.
- Grid usage: 2-3 column layout on desktop.
- Spacing: Generous padding between widgets.
- Balance: Good balance between text and charts.

#### Cards
- Card sizing: Consistent modular sizes.
- Grouping: Logical separation of accounts, cash flow, and budgets.
- Consistency: Uniform corner radii and drop shadows.
- Density: Medium.

#### Typography
- Hierarchy: Clear distinction between aggregate totals and line items.
- Readability: High.
- Emphasis: Bold weights for primary monetary values.

#### Charts & Data Visualization
- Usefulness: Highly relevant to personal finance.
- Readability: Simple bar and line charts.
- Visual noise: Minimal.
- Comparison ability: Easy period-over-period comparisons.

#### Tables & Lists
- Readability: High, with distinct row boundaries.
- Density: Comfortable.
- Actionability: Clear drill-down targets.

#### Navigation
- Discoverability: Persistent sidebar on desktop.
- Clarity: Simple categorization.
- Consistency: Standard icon + text patterns.

#### Mobile Experience
- Responsiveness: Shifts to vertical feed elegantly.
- Information preservation: Primary metrics remain at the top.
- Usability: Thumb-friendly tap targets.

#### Strengths
- Unintimidating visual language.
- Excellent progressive disclosure of detailed transactions.

#### Weaknesses
- Widget customization can lead to inconsistent hierarchies if mismanaged.

#### Ideas Worth Reusing
- Large primary KPI numbers.
- Unified card styling.

#### Ideas to Reject
- Highly customizable layouts (violates the "Non-Goals" constraint of the Product Vision).

#### Finance Tracker Suitability
- Product Vision: High alignment.
- Information Architecture: High alignment.
- Layout & Wireframes: High alignment.
- Score: 9/10

---

### Copilot Money

#### Overall Impression
A highly modern, dark-mode-first, visually striking dashboard emphasizing aesthetics and micro-interactions.

#### Information Hierarchy
- Prioritization: Focuses heavily on daily spending momentum.
- Scanning speed: Medium (aesthetic flourishes occasionally distract).
- Readability: Good contrast.
- Cognitive load: Medium.

#### Layout
- Page structure: Card-heavy, vertical feed approach.
- Grid usage: Fluid.
- Spacing: Tight padding inside cards, generous margins between them.
- Balance: Heavily weighted toward visual charts over tables.

#### Cards
- Card sizing: Highly varied depending on content.
- Grouping: Thematic.
- Consistency: Consistent visual language but inconsistent sizing.
- Density: Medium.

#### Typography
- Hierarchy: Strong, using extreme size contrasts.
- Readability: Good, though stylized fonts occasionally reduce scannability of dense data.
- Emphasis: Uses color highlights aggressively.

#### Charts & Data Visualization
- Usefulness: Great for quick trend spotting.
- Readability: Highly stylized (e.g., glowing lines).
- Visual noise: High.
- Comparison ability: Sometimes obscured by styling.

#### Tables & Lists
- Readability: Clean.
- Density: Low.
- Actionability: High (swipe gestures).

#### Navigation
- Discoverability: Bottom tab bar on mobile.
- Clarity: High.
- Consistency: High.

#### Mobile Experience
- Responsiveness: Native mobile-first design.
- Information preservation: Excellent.
- Usability: Highly tactile.

#### Strengths
- Premium, engaging aesthetic that drives daily habits.

#### Weaknesses
- Over-stylized charts can obscure exact data points.

#### Ideas Worth Reusing
- High contrast typography for primary metrics.

#### Ideas to Reject
- Glassmorphism, glowing charts, excessive gradients (too much visual noise for our trust/clarity principles).

#### Finance Tracker Suitability
- Product Vision: Medium alignment.
- Information Architecture: Medium alignment.
- Layout & Wireframes: High alignment.
- Score: 7/10

---

### YNAB (You Need A Budget)

#### Overall Impression
A utilitarian, highly functional dashboard focused entirely on zero-based budgeting and task completion.

#### Information Hierarchy
- Prioritization: Strict focus on "Ready to Assign" money.
- Scanning speed: Medium (requires reading many categories).
- Readability: High.
- Cognitive load: High (dense information).

#### Layout
- Page structure: Table-dominant.
- Grid usage: Rigid spreadsheet-style grid.
- Spacing: Tight.
- Balance: Text-heavy, minimal charts.

#### Cards
- Card sizing: N/A (mostly list-based).
- Grouping: Strict category groups.
- Consistency: High.
- Density: Very high.

#### Typography
- Hierarchy: Functional but flat.
- Readability: Excellent for numbers.
- Emphasis: Uses color (red/green) to indicate budget health.

#### Charts & Data Visualization
- Usefulness: Minimal on the main dashboard.
- Readability: N/A.
- Visual noise: Low.
- Comparison ability: Relies on numbers rather than visuals.

#### Tables & Lists
- Readability: High.
- Density: High.
- Actionability: Direct inline editing.

#### Navigation
- Discoverability: Sidebar.
- Clarity: High.
- Consistency: High.

#### Mobile Experience
- Responsiveness: Good, but struggles with deep table hierarchies.
- Information preservation: Requires heavy collapsing/expanding.
- Usability: Good for data entry.

#### Strengths
- Absolute clarity on what action the user must take next.
- Exceptional use of semantic color (red = bad, green = good, gray = neutral).

#### Weaknesses
- Intimidating for new users; visually dry.

#### Ideas Worth Reusing
- Semantic use of color for budget health.
- High-density list views for drill-downs.

#### Ideas to Reject
- Spreadsheet-like main dashboard (violates our "Overview" product vision).

#### Finance Tracker Suitability
- Product Vision: Medium alignment.
- Information Architecture: Medium alignment.
- Layout & Wireframes: Low alignment.
- Score: 6/10

---

### shadcn/ui Dashboard

#### Overall Impression
A quintessential modern web dashboard: minimalist, monochrome-heavy, with precise typography and subtle borders.

#### Information Hierarchy
- Prioritization: Very clear top-down flow.
- Scanning speed: Very high.
- Readability: Exceptional.
- Cognitive load: Low.

#### Layout
- Page structure: Standard header, KPI row, followed by split-column content.
- Grid usage: Strict 12-column foundation.
- Spacing: Consistent, mathematical spacing scale.
- Balance: Perfect balance of whitespace and content borders.

#### Cards
- Card sizing: Uniform heights within rows.
- Grouping: Logical.
- Consistency: Absolute.
- Density: Medium-low.

#### Typography
- Hierarchy: Masterful use of font weights and muted colors for secondary text.
- Readability: Excellent.
- Emphasis: Clean, sparse.

#### Charts & Data Visualization
- Usefulness: Good for generic data.
- Readability: High (often uses Recharts).
- Visual noise: Almost zero.
- Comparison ability: High.

#### Tables & Lists
- Readability: Clean, well-padded.
- Density: Comfortable.
- Actionability: Clear hover states and actions.

#### Navigation
- Discoverability: Top nav or clean sidebar.
- Clarity: High.
- Consistency: High.

#### Mobile Experience
- Responsiveness: Stacks cleanly.
- Information preservation: Good.
- Usability: High.

#### Strengths
- Timeless, distraction-free aesthetic.
- The KPI row pattern is universally understood.

#### Weaknesses
- Can feel slightly generic or "dry" without brand accents.

#### Ideas Worth Reusing
- Top KPI row pattern.
- Subtle card borders instead of heavy drop shadows.
- Muted typography for contextual information.

#### Ideas to Reject
- Overly generic empty states.

#### Finance Tracker Suitability
- Product Vision: High alignment.
- Information Architecture: High alignment.
- Layout & Wireframes: High alignment.
- Score: 9.5/10

---

### Vercel Dashboard

#### Overall Impression
A developer-focused dashboard that excels at presenting complex infrastructure data with stark simplicity and high contrast.

#### Information Hierarchy
- Prioritization: Focuses on project status and recent deployments.
- Scanning speed: High.
- Readability: Excellent contrast.
- Cognitive load: Medium.

#### Layout
- Page structure: List-heavy with prominent action buttons.
- Grid usage: Fluid.
- Spacing: Generous.
- Balance: Strong alignment to the left.

#### Cards
- Card sizing: Wide, full-width cards.
- Grouping: Project-based.
- Consistency: High.
- Density: Medium.

#### Typography
- Hierarchy: Uses varying font sizes and very distinct font weights.
- Readability: High.
- Emphasis: High-contrast buttons and badges.

#### Charts & Data Visualization
- Usefulness: Focused on sparklines for quick health checks.
- Readability: High.
- Visual noise: Low.
- Comparison ability: Limited by design (focus is on individual health).

#### Tables & Lists
- Readability: Excellent.
- Density: Medium.
- Actionability: Extremely clear primary actions.

#### Navigation
- Discoverability: Tabs are heavily utilized.
- Clarity: High.
- Consistency: High.

#### Mobile Experience
- Responsiveness: Excellent.
- Information preservation: Good.
- Usability: High.

#### Strengths
- Exceptional use of sparklines to show trends without taking up space.
- Unambiguous status indicators (success/fail).

#### Weaknesses
- Too stark for a consumer finance application.

#### Ideas Worth Reusing
- Sparklines for Trend & Momentum.
- Unambiguous status badges.

#### Ideas to Reject
- Developer-centric starkness (lacks the "trust and comfort" needed for finance).

#### Finance Tracker Suitability
- Product Vision: Medium alignment.
- Information Architecture: High alignment.
- Layout & Wireframes: Medium alignment.
- Score: 7.5/10

---

### Linear Dashboard

#### Overall Impression
A masterclass in high-density, keyboard-first productivity design.

#### Information Hierarchy
- Prioritization: Tasks and active work.
- Scanning speed: High for trained users.
- Readability: High.
- Cognitive load: High (requires learning the UI).

#### Layout
- Page structure: Multi-pane.
- Grid usage: Tight.
- Spacing: Extremely compact.
- Balance: Function over form.

#### Cards
- Card sizing: Minimal.
- Grouping: Strict list hierarchies.
- Consistency: Absolute.
- Density: Very high.

#### Typography
- Hierarchy: Relies heavily on icons and muted text.
- Readability: Requires focus.
- Emphasis: Current active item.

#### Charts & Data Visualization
- Usefulness: Burndown charts are highly effective.
- Readability: Simple and clean.
- Visual noise: Low.
- Comparison ability: High.

#### Tables & Lists
- Readability: Dense but scannable via icons.
- Density: Very high.
- Actionability: Extreme (everything is actionable).

#### Navigation
- Discoverability: Command palette driven.
- Clarity: Moderate (relies on user knowledge).
- Consistency: High.

#### Mobile Experience
- Responsiveness: Good, but loses the power of the desktop layout.
- Information preservation: Medium.
- Usability: Medium.

#### Strengths
- Information density is unmatched.
- Impeccable iconography.

#### Weaknesses
- Overwhelming for casual users.

#### Ideas Worth Reusing
- High-quality, consistent iconography to aid scanning speed.
- Compact list layouts for Recent Activity.

#### Ideas to Reject
- Extreme density; command-palette reliance (violates "Overview" simplicity).

#### Finance Tracker Suitability
- Product Vision: Low alignment (too complex).
- Information Architecture: Medium alignment.
- Layout & Wireframes: Low alignment.
- Score: 5/10

---

### Grafana

#### Overall Impression
A deeply technical, infinitely customizable analytics workspace.

#### Information Hierarchy
- Prioritization: Entirely user-defined.
- Scanning speed: Varies wildly based on user configuration.
- Readability: Often poor due to dark mode contrast issues.
- Cognitive load: Extreme.

#### Layout
- Page structure: Freeform grid.
- Grid usage: Snap-to-grid.
- Spacing: Variable.
- Balance: Chaotic.

#### Cards
- Card sizing: Variable.
- Grouping: Variable.
- Consistency: Low.
- Density: Extreme.

#### Typography
- Hierarchy: Flat.
- Readability: Medium.
- Emphasis: Driven by chart colors.

#### Charts & Data Visualization
- Usefulness: Comprehensive.
- Readability: Complex.
- Visual noise: Extremely high.
- Comparison ability: High.

#### Tables & Lists
- Readability: Poor.
- Density: Extreme.
- Actionability: Low.

#### Navigation
- Discoverability: Poor.
- Clarity: Low.
- Consistency: Medium.

#### Mobile Experience
- Responsiveness: Very poor.
- Information preservation: Poor.
- Usability: Frustrating.

#### Strengths
- Handles massive volumes of data.

#### Weaknesses
- Violates every principle of curated, consumer-friendly product design.

#### Ideas Worth Reusing
- None.

#### Ideas to Reject
- Everything (customizable grids, overwhelming data, raw analytical dumps).

#### Finance Tracker Suitability
- Product Vision: Zero alignment.
- Information Architecture: Zero alignment.
- Layout & Wireframes: Zero alignment.
- Score: 1/10

---

### Metabase

#### Overall Impression
A friendly, accessible approach to Business Intelligence.

#### Information Hierarchy
- Prioritization: Dashboard-specific.
- Scanning speed: Medium.
- Readability: High.
- Cognitive load: Medium.

#### Layout
- Page structure: Grid-based dashboard.
- Grid usage: Clean.
- Spacing: Generous.
- Balance: Good.

#### Cards
- Card sizing: Standardized widgets.
- Grouping: Logical.
- Consistency: High.
- Density: Medium.

#### Typography
- Hierarchy: Clear.
- Readability: Excellent.
- Emphasis: Good use of large numbers.

#### Charts & Data Visualization
- Usefulness: High.
- Readability: Friendly, rounded chart styles.
- Visual noise: Low.
- Comparison ability: Good.

#### Tables & Lists
- Readability: Good.
- Density: Comfortable.
- Actionability: Medium (drill-downs).

#### Navigation
- Discoverability: Good.
- Clarity: High.
- Consistency: High.

#### Mobile Experience
- Responsiveness: Stacks well.
- Information preservation: Good.
- Usability: Good.

#### Strengths
- Makes complex data look friendly and approachable.

#### Weaknesses
- Dashboards can still become long scrolling lists of disconnected charts.

#### Ideas Worth Reusing
- Approachable, rounded chart visual styles.

#### Ideas to Reject
- Over-reliance on charts where simple numbers would suffice.

#### Finance Tracker Suitability
- Product Vision: Medium alignment.
- Information Architecture: Medium alignment.
- Layout & Wireframes: Medium alignment.
- Score: 6.5/10

---

### Stripe Dashboard

#### Overall Impression
The gold standard of B2B fintech design. Highly trustworthy, meticulously crafted, and exceptionally clear.

#### Information Hierarchy
- Prioritization: Perfect balance of gross volume vs. granular events.
- Scanning speed: Very high.
- Readability: Exceptional.
- Cognitive load: Low, despite high data volume.

#### Layout
- Page structure: Logical top-to-bottom flow.
- Grid usage: Sophisticated.
- Spacing: Impeccable rhythm.
- Balance: Perfect.

#### Cards
- Card sizing: Consistent.
- Grouping: By business domain.
- Consistency: Absolute.
- Density: Medium.

#### Typography
- Hierarchy: Nuanced use of grays and font weights.
- Readability: Perfect.
- Emphasis: Uses typography rather than heavy colors for emphasis.

#### Charts & Data Visualization
- Usefulness: Extremely high.
- Readability: Clear, interactive, and uncluttered.
- Visual noise: Zero.
- Comparison ability: Excellent hover states for period comparisons.

#### Tables & Lists
- Readability: High.
- Density: Comfortable.
- Actionability: Excellent.

#### Navigation
- Discoverability: Clear sidebar and top nav.
- Clarity: High.
- Consistency: High.

#### Mobile Experience
- Responsiveness: World-class.
- Information preservation: Excellent.
- Usability: Excellent.

#### Strengths
- Projects absolute trust and reliability through visual precision.
- Excellent use of muted colors to prevent fatigue.

#### Weaknesses
- None relevant to our use case.

#### Ideas Worth Reusing
- Nuanced gray scales for secondary text.
- Interactive but clean hover states on charts.
- Separation of primary KPIs into a distinct top row.

#### Ideas to Reject
- Deeply nested enterprise settings menus (out of scope for us).

#### Finance Tracker Suitability
- Product Vision: High alignment (Trust and Clarity).
- Information Architecture: High alignment.
- Layout & Wireframes: High alignment.
- Score: 10/10

---

### GitHub Insights

#### Overall Impression
Data-dense, highly analytical, but visually unified with the rest of a complex platform.

#### Information Hierarchy
- Prioritization: Activity and frequency over time.
- Scanning speed: Medium.
- Readability: Good.
- Cognitive load: Medium.

#### Layout
- Page structure: Split panes and large spanning charts.
- Grid usage: Rigid.
- Spacing: Comfortable.
- Balance: Good.

#### Cards
- Card sizing: Large.
- Grouping: By metric type.
- Consistency: High.
- Density: Medium.

#### Typography
- Hierarchy: Standard platform typography.
- Readability: Good.
- Emphasis: Minimal.

#### Charts & Data Visualization
- Usefulness: Heatmaps are iconic and highly effective.
- Readability: High.
- Visual noise: Low.
- Comparison ability: High.

#### Tables & Lists
- Readability: Functional.
- Density: Medium.
- Actionability: Medium.

#### Navigation
- Discoverability: Sub-navigation tabs.
- Clarity: Good.
- Consistency: High.

#### Mobile Experience
- Responsiveness: Functional, but charts can become cramped.
- Information preservation: Medium.
- Usability: Medium.

#### Strengths
- The contribution heatmap is an incredible tool for showing momentum/activity over time.

#### Weaknesses
- Utilitarian visual style lacks the polish of consumer apps.

#### Ideas Worth Reusing
- Heatmaps or density charts for tracking habit building (e.g., spending frequency).

#### Ideas to Reject
- Cluttered sub-navigation tabs.

#### Finance Tracker Suitability
- Product Vision: Medium alignment.
- Information Architecture: Medium alignment.
- Layout & Wireframes: Medium alignment.
- Score: 7/10

---

## 4. Cross-Dashboard Analysis

By evaluating these diverse dashboards, several recurring best practices emerged that are directly applicable to Finance Tracker:

1. **Common Layout Patterns**: The most successful dashboards (shadcn, Stripe) use a top "KPI Row" of identically sized cards to anchor the page, followed by a split-column layout for deeper analysis.
2. **Common Navigation Patterns**: Quick actions are kept contextual, while global navigation sits in a persistent, low-distraction sidebar or top bar.
3. **Common Card Designs**: Subtle borders with very light (or no) drop shadows project modernity and cleanliness. Grouping related metrics within a single card reduces visual clutter.
4. **Common KPI Presentation**: Large, bold typography for the primary number, immediately followed by a smaller, colored delta indicator (trend) and a muted label.
5. **Common Chart Usage**: Charts are kept incredibly simple (bar or line) with axes muted or removed. Hover states provide the exact data points, keeping the default view clean. Sparklines are highly effective for dense lists.
6. **Common Empty State Patterns**: The best products use empty states as onboarding opportunities, featuring illustrations and prominent primary action buttons.
7. **Common Responsive Patterns**: Multi-column grids elegantly collapse into a single vertical feed, always preserving the top KPI row.
8. **Common Accessibility Practices**: Strong contrast on primary text, reliance on font-weight (not just color) to denote hierarchy, and clear focus states.

---

## 5. Approved Design Patterns

The following patterns are permanently approved for use in the Finance Tracker Dashboard:

- **Top-Row KPI Cards**
  - *Reason for Approval*: Ensures the "5-Second Rule" is met instantly.
  - *Related Product Principle*: Clarity.
  - *Related Layout Principle*: Hierarchy via Position.
- **Sparklines in Lists**
  - *Reason for Approval*: Provides trend context without taking up the space of a full chart.
  - *Related Product Principle*: Decision Support.
  - *Related Layout Principle*: Scanability.
- **Semantic Status Colors (Green/Red/Muted)**
  - *Reason for Approval*: Instantly communicates budget health and trend direction.
  - *Related Product Principle*: Confidence.
  - *Related Layout Principle*: Scanability.
- **Subtle Card Borders (Minimal Shadows)**
  - *Reason for Approval*: Reduces visual noise and creates a flat, modern, trustworthy aesthetic (like Stripe/shadcn).
  - *Related Product Principle*: Trust.
  - *Related Layout Principle*: Balance.
- **Progressive Disclosure via Hover/Tap**
  - *Reason for Approval*: Keeps default charts clean while allowing data exploration.
  - *Related Product Principle*: Simplicity.
  - *Related Layout Principle*: Hierarchy.
- **Action-Oriented Empty States**
  - *Reason for Approval*: Turns zero-data scenarios into onboarding wins.
  - *Related Product Principle*: Decision Support.
  - *Related Layout Principle*: Balance.
- **Muted Contextual Typography**
  - *Reason for Approval*: Highlights the primary numbers by visually suppressing the labels.
  - *Related Product Principle*: Clarity.
  - *Related Layout Principle*: Hierarchy.

---

## 6. Rejected Design Patterns

The following patterns conflict with the Finance Tracker Product Vision and must never be used:

- **Fully Customizable Widget Grids (Grafana style)**
  - *Conflict*: Violates the "Non-Goals" of the Product Vision; introduces extreme cognitive load and breaks curated information hierarchy.
- **Glassmorphism & Glowing Effects (Copilot style)**
  - *Conflict*: Increases visual noise and reduces the "Trust" principle required for a serious financial application.
- **Spreadsheet-Density Data Dumps (YNAB style)**
  - *Conflict*: Fails the "5-Second Rule"; requires too much mental processing for an overview screen.
- **Decorative Charts**
  - *Conflict*: Violates the "Justified Presence" philosophy. If a chart does not help the user make a decision, it should be a number or removed.
- **Deep Nested Navigation on Dashboard**
  - *Conflict*: The dashboard must be a hub, not a maze. Actions should be one click away.
- **Competing Accent Colors**
  - *Conflict*: If everything is highlighted, nothing is. Overuse of color destroys the semantic value of positive/negative financial indicators.

---

## 7. Finance Tracker Visual Direction

Based on this review, the visual identity of the Finance Tracker Dashboard is defined as **"Trustworthy Minimalism."**

- **Overall Personality**: Professional, calm, and highly reliable. It should feel like a premium tool (akin to Stripe or shadcn/ui), not a video game.
- **Information Density**: Medium-Low. We prioritize whitespace to give the financial numbers room to breathe.
- **Visual Hierarchy**: Typography-driven. Size and weight dictate importance, not bright colors or boxes.
- **Whitespace Philosophy**: Generous padding inside cards, consistent gaps between cards.
- **Card Philosophy**: Flat, bordered containers that group related thoughts quietly.
- **Dashboard Composition**: Anchored heavily at the top with critical KPIs, flowing downward into supporting charts and lists.
- **Navigation Philosophy**: Flat and visible. Quick actions are explicitly stated, not hidden behind hamburger menus.
- **Chart Philosophy**: Utilitarian. Charts exist to show trends quickly. Axes and gridlines should be invisible or heavily muted.
- **Mobile Philosophy**: A clean, vertical feed of information that never requires horizontal scrolling to understand primary metrics.

---

## 8. Design Constraints for Stage 0.4

When creating the Design System (Stage 0.4), the following constraints must be strictly adhered to:

1. **Typography-First Hierarchy**: The Design System must establish at least 4 distinct levels of text hierarchy using size, weight, and a muted text color, before relying on accent colors.
2. **Semantic Color Limitation**: The system must define clear, accessible semantic colors for "Good/Positive", "Bad/Warning", and "Neutral". Accent colors must not conflict with these.
3. **Card Container Definition**: Define a single, universal card container style (border, background, radius) that relies on borders rather than heavy drop shadows.
4. **Spacing System**: Establish a rigid spacing scale (e.g., 4pt/8pt grid) to enforce the "consistent rhythm" pattern identified in the review.
5. **Chart Minimalization**: All chart components must support a "clean mode" where axes, grids, and legends can be hidden.
6. **Action Prominence**: Primary buttons (like "Add Transaction") must be visually distinct from all other elements on the screen. 
7. **Empty State Templates**: The system must include a standardized layout for empty states featuring an icon/illustration, a heading, a muted description, and a primary action button.
