# Dashboard: Stage 0.3 Layout & Wireframes

**Status**: Approved (Frozen)
**Stage**: 0.3

---

## 1. Objectives

This document defines the structural layout and wireframe organization for the Finance Tracker Dashboard. 

Using the frozen **Stage 0.1 Product Vision** and **Stage 0.2 Information Architecture** as foundational inputs, this stage transforms abstract information hierarchy and cognitive grouping into concrete spatial organization. The goal is to define how the information is physically arranged on the screen to maximize comprehension and minimize cognitive friction, without committing to specific visual styles or implementation technologies.

## 2. Layout Principles

The spatial organization of the Dashboard is governed by the following layout principles:
- **Scanability**: The user's eye must naturally glide across the most important numbers without getting caught on dense text or complex graphics.
- **Hierarchy via Scale and Position**: Larger areas and top-left positioning (in LTR languages) are reserved exclusively for Primary Information.
- **Balance**: Dense analytical data is balanced with generous whitespace to prevent the user from feeling overwhelmed.
- **Responsiveness**: The layout is fundamentally fluid. Information structures reflow based on available screen real estate rather than shrinking proportionally.
- **Consistency**: Structural patterns (such as where contextual menus live relative to the data they control) remain identical across all layout zones.

## 3. Layout Zones

To preserve the cognitive groupings established in Stage 0.2, the layout is divided into distinct spatial zones:

- **Zone A: Context & Alerts (Top)**: Hosts the Header, Period Context, and any High-Priority Messages. This zone spans the full width of the layout.
- **Zone B: State & Summary (Upper Region)**: Houses the Financial Summary (Income, Expenses, Net Flow) and Budget Health. This is the heaviest visual anchor.
- **Zone C: Quick Actions (Upper/Mid Region)**: Positioned adjacent to or immediately below Zone B, providing instant pathways to intervention.
- **Zone D: Analysis (Mid/Lower Region)**: Contains the Category Breakdown and Trend & Momentum summaries. This zone handles complex data visualizations.
- **Zone E: Evidence (Bottom Region)**: A list-based region for Recent Activity Highlights, naturally extending below the fold.

## 4. Desktop Wireframe

**Page Structure & Content Regions:**
On a wide desktop screen, the Dashboard adopts a multi-column layout to utilize horizontal space efficiently without stretching text.

- **Top Row (Full Width)**: Zone A (Context & Alerts).
- **Upper Grid**:
  - **Main Column (Left, wider)**: Zone B (State & Summary).
  - **Sidebar Column (Right, narrower)**: Zone C (Quick Actions).
- **Lower Grid**:
  - **Main Column (Left)**: Zone D (Analysis - Category Breakdown and Trends sitting side-by-side or stacked).
  - **Sidebar Column (Right)**: Zone E (Evidence - Recent Activity Highlights).

**Reading Order:**
The user's eye naturally starts at the top left (Context), moves to the large numbers (Summary), scans right for immediate capabilities (Actions), then drops down to understand the breakdown (Analysis), and finally lands on the transaction list (Evidence).

**Above the Fold:**
On standard desktop resolutions, Zones A, B, C, and the top half of Zones D and E must remain completely visible without scrolling.

## 5. Tablet Layout

**Adaptation & Grouping:**
As horizontal space constricts, the layout shifts from a rigid multi-column grid to a hybrid masonry or fluid grid approach.

- **Top Row**: Zone A remains full width.
- **Upper Grid**: Zone B and Zone C may sit side-by-side if space permits, but Quick Actions (Zone C) may reorganize from a vertical stack to a horizontal row beneath the Summary.
- **Lower Grid**: The Sidebar collapses. Zone D (Analysis) and Zone E (Evidence) now stack vertically.

**Reading Order:**
The flow becomes strictly linear downward, ensuring the user reads the Summary before encountering the Analysis.

## 6. Mobile Layout

**Vertical Stacking:**
On mobile screens, the multi-column layout is entirely abandoned in favor of a single, scrolling vertical column. 

**Order of Zones:**
1. Zone A (Context & Alerts)
2. Zone B (State & Summary)
3. Zone C (Quick Actions)
4. Zone D (Analysis)
5. Zone E (Evidence)

**Preserving the 5-Second Rule:**
To ensure the 5-Second Rule is met, Zones A, B, and C must fit within the initial viewport (above the fold) on standard modern smartphones. The user immediately sees the period, their available cash, their budget health, and the buttons to act.

## 7. Responsive Behavior

The layout prioritizes the preservation of Information Architecture over fixed spatial positioning. 
- **Reflow over Shrink**: When the screen narrows, side-by-side elements do not shrink to illegible sizes; they reflow into vertical stacks.
- **Fluid Anchoring**: Quick Actions anchor to the side of the Summary on desktop, but anchor directly below it on mobile. Their conceptual relationship (Action follows Status) is preserved regardless of the physical axis.
- **Empty States**: If a zone has no data (e.g., no Recent Activity), the zone collapses entirely, and subsequent zones shift upward to fill the void, rather than leaving massive empty gaps.

## 8. Wireframe Narratives

**The User Journey:**
1. **Arrival**: The user opens the app. The screen loads instantly. The eye catches the top-left Context ("This Month") and drops to the massive Net Cash Flow number.
2. **Status Check**: The user glances right (or down on mobile) to the Budget Health indicator. They see they have plenty of safe-to-spend balance.
3. **Investigation**: Curious about what they spent money on, they scroll down. The Category Breakdown reveals a high spend in "Dining Out".
4. **Verification**: They scroll further to Recent Activity and see three large restaurant bills from the weekend. 
5. **Action**: Satisfied with the information, they scroll back up to Quick Actions and tap "Add Transaction" to log a new coffee purchase.

## 9. Future Extensibility

The spatial layout is designed to accommodate future growth without breaking the existing flow:
- **Top-Level Banner Insertions**: Zone A can seamlessly expand vertically to accommodate AI Insights or urgent system alerts without pushing the Summary out of view.
- **Horizontal Scrolling / Carousels**: On mobile, Zone D (Analysis) can adopt horizontal scrolling (swipeable cards) to introduce new analytical tools (like Investment Summaries) without drastically increasing the vertical scroll length.
- **Modular Grids**: On desktop, the rigid columns can evolve into a modular masonry grid, allowing users to eventually drag and drop new widgets into Zones D and E.
