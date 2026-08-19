# Finance Tracker — Design System

> [!IMPORTANT]
> **Status**: Approved & Frozen 🔒
> **Version**: 2.1.0 (Phase 2 Design System Reconciliation & Stitch Integration)
>
> In accordance with the UI Governance Constitution (`00-ui-governance.md`), this document is the **Single Source of Truth** for all visual design tokens and design language. No visual design decision may exist outside of this system.


## 1. Introduction
The Finance Tracker Design System provides the foundational visual language that powers the product experience. It establishes a unified aesthetic and functional vocabulary that guarantees consistency, accessibility, and high perceived quality across all platforms. Every UI component and screen must derive its visual attributes exclusively from the tokens defined within this system.

## 2. Design Philosophy
Our design language is rooted in three core tenets:
- **Clarity Above All**: Financial data is complex. The design system must relentlessly prioritize legibility, clear hierarchy, and cognitive ease.
- **Premium Utility**: The interface must feel highly polished and trustworthy without sacrificing utilitarian efficiency.
- **Systematic Scalability**: Design decisions are expressed as scalable tokens, ensuring the visual language evolves predictably and coherently across engineering platforms.

## 3. Component Design Philosophy
Components bridge the design system and application logic. From a visual standpoint, components must be:
- **Composable**: Designed to fit together seamlessly without overriding base tokens.
- **Predictable**: Visual behavior matches established conventions across all screens.
- **Minimal**: Devoid of unnecessary decoration or complexity.
- **Token Driven**: Hardcoded values are strictly prohibited.
- **Accessible**: Born with a11y compliance, not added later.
- **Reusable**: Truly agnostic to the specific business context of a screen.
- **Stateless (where possible)**: Relying on passed visual properties rather than internal layout logic.

## 4. Brand Identity
The Finance Tracker brand identity projects precision, security, and insight. The visual language utilizes a restrained, neutral foundation punctuated by deliberate, semantic accents to draw attention to critical insights. It avoids superfluous decoration, relying instead on deliberate typography, spacing, and subtle elevation to establish character.

## 5. Token Theme Strategy
Our theming strategy scales seamlessly across platforms and contexts by abstracting values through a strict mapping hierarchy. This ensures long-term scalability without structural rewrites:
```text
Core Tokens (e.g., Blue 500)
   ↓
Semantic Tokens (e.g., Brand Primary)
   ↓
Theme Mapping (e.g., Light / Dark Context)
   ↓
Platform Mapping (e.g., Web / iOS / Android)
```

## 6. Color System
The color system operates strictly on semantic tokens managed centrally in [`src/shared/theme/colors.ts`](file:///d:/Projects/finance_tracker_mobile/src/shared/theme/colors.ts).

### Authoritative Midnight Navy Dark Theme Tokens
| Token Key | Hex Value | Purpose & Visual Intent |
|---|---|---|
| `backgroundPrimary` | `#0F172A` | Midnight Slate base background for all application screens |
| `surfacePrimary` | `#1E293B` | Elevated card surface for transactions, budgets, accounts, and summary containers |
| `surfaceSecondary` | `#18181B` / `#334155` | Secondary surface for search fields, filter pills, and input borders |
| `surfaceElevated` | `#2563EB` (tint) | Interactive focus state & elevated active pill background |
| `textPrimary` | `#F8FAFC` | Primary headings, transaction titles, and active text |
| `textSecondary` | `#94A3B8` | Subtitles, date labels, section headers, and secondary text |
| `textMuted` | `#64748B` | Placeholder text and disabled icons |
| `brandPrimary` | `#2563EB` | Primary brand accent for buttons, FAB, active tabs, and focus borders |
| `brandSecondary` | `#1D4ED8` | Pressed / active state for brand primary actions |
| `accent` | `#6366F1` | Indigo secondary accent |
| `success` | `#10B981` | Emerald green for positive income, transfer-in, and on-track budgets |
| `warning` | `#F59E0B` | Amber for near-limit budget warnings |
| `error` | `#EF4444` | Rose red for expense transactions, transfer-out, over-budget alerts, and destructive actions |
| `border` | `#334155` | Standard card and container borders |
| `borderSubtle` | `#27272A` | Subtle dividers and row separators |
| `overlay` | `rgba(0, 0, 0, 0.75)` | Dark backdrop for modal dialogs and sheets |

## 7. Typography & Content Principles
Typography in Finance Tracker is engineered for dense data consumption and high scannability, managed centrally in [`src/shared/theme/typography.ts`](file:///d:/Projects/finance_tracker_mobile/src/shared/theme/typography.ts).

### Content Principles
- **Numbers First**: Data is the primary focus of the application.
- **Actions Second**: Primary calls to action follow the data contextually.
- **Descriptions Last**: Explanatory text is supportive and visually secondary.

## 8. Financial Typography Rules & Tabular Numeric Tokens
Since this is a finance application, numbers require absolute precision and clarity.

### Tabular Numeric Tokens (`src/shared/theme/typography.ts`)
- **`typography.numeric`**: 18px font size with `fontVariant: ['tabular-nums']` and `fontWeight: '600'`. Used for list items, transaction amounts, and card totals.
- **`typography.numericLarge`**: 28px font size with `fontVariant: ['tabular-nums']` and `fontWeight: '700'`. Used for total net worth and primary header balances.

### Rules:
- **Tabular Numerals Required**: All currency and numerical data must use tabular (monospaced) font features (`fontVariant: ['tabular-nums']`) to ensure perfect vertical alignment in tables, lists, and ledgers.
- **Decimal Alignment**: Lists of currencies must align visually on the decimal point.
- **Currency Hierarchy**: The currency symbol (`$`, `₹`, `€`) scales proportionally with the amount.

- **Minus Sign Usage**: Negative numbers must use a true typographic minus sign (`−`), not a standard hyphen (`-`).
- **Abbreviations**: Follow consistent locale-aware abbreviation formats (e.g., Lakh/Crore vs. `M`/`B` international notation) depending on user settings.
- **Locale Formatting**: Thousands separators and decimal markers must strictly follow the user's explicit locale.
- **Rounding Policy**: Explicit rounding behavior is defined per context to avoid arbitrary decimal drift on UI presentation.

## 9. Density Scale
Different screens have different density needs.
- **Comfortable**: Default spacing. Used for onboarding, settings, and high-level summaries.
- **Compact**: Tighter spacing. Used for standard lists and interactive cards.
- **Dense**: Minimum spacing. Reserved for power-user views, deep data tables, and dense analytics ledgers.

## 10. Spacing & Layout System
Spacing is governed by a strict **8-point grid** (with a 4-point sub-grid for high-density micro-adjustments).
- **Tokens**: Defined as predictable, mathematical increments (e.g., `space-1` = 4, `space-2` = 8, `space-3` = 12, `space-4` = 16).
- **Application**: Used exclusively for padding, margins, and gaps. Arbitrary spacing values are strictly prohibited.

## 11. Responsive Philosophy
Instead of just raw breakpoints, design fluidly adapts to varying physical contexts.
- **Mobile First**: Core functionality and critical paths designed for the smallest viewport.
- **Tablet Adaptation**: Optimized use of horizontal space, expanding lists into master-detail views or grid structures.
- **Foldables**: Fluid adaptation to changing aspect ratios without requiring hard reloads or awkward letterboxing.
- **Desktop Expansion**: Multi-column layouts and expanded navigation for immersive, complex data analysis.

## 12. Surface & Elevation System
Surfaces define the spatial hierarchy and logical grouping of elements.
- **Background**: The lowest level, forming the base of the application.
- **Surface Level 1**: Primary cards, sections, and default content containers.
- **Surface Level 2**: Elevated elements like sticky headers, toolbars, or primary navigation.
- **Surface Level 3**: Highest elevation elements like modals, dialogs, and temporary popovers.

### Elevation Hierarchy
Elevation communicates depth, focus, and interaction state.
- **Z-Index Tokens**: Strict layering tiers (`z-base`, `z-elevated`, `z-overlay`, `z-modal`, `z-toast`).
- **Shadow Tokens**: `shadow-sm` (Buttons), `shadow-md` (Dropdowns), `shadow-lg` (Critical dialogs).

## 13. Iconography Rules
Icons must be crisp, recognizable, and strictly functional.
> [!WARNING]
> **Never:**
> - Mix different icon packs.
> - Mix filled and outline styles together.
> - Use different stroke widths across glyphs.
> - Mix different corner styles (e.g., sharp vs. rounded).

## 14. Imagery & Empty States
Imagery is used minimally, reserving user focus for core financial data. 

### Empty State Language
Empty states must guide the user, not just report a lack of data. The Design System governs this copy style.
- **Avoid**: Dead ends like "No Data" or "Empty".
- **Enforce**: Clear, actionable language (e.g., "No transactions yet. Add your first transaction.").

## 15. Loading Language
Loading states communicate system activity and manage perceived performance.
- **Skeletons**: Used for predictive content loading (e.g., lists, cards) to minimize layout shift.
- **Spinners**: Used for blocking actions or localized micro-interactions.
- **Progress Indicators**: Used for deterministic, long-running processes (e.g., bulk imports, migrations).

## 16. Motion Principles
Motion must be purposeful, emphasizing orientation and providing immediate feedback.
- **Continuity**: Smoothly connecting states and contexts to prevent disorientation.
- **Hierarchy**: Emphasizing important elements entering or leaving the viewport.
- **Feedback**: Immediate, tactile response to user interactions.
- **Delight**: Subtle refinements that elevate the premium feel without causing delay.

## 17. Chart & Data Visualization
Charts are the centerpiece of the Finance Tracker analytics experience.

### Allowed Chart Types
- Area
- Line
- Bar
- Progress Ring
- Sparkline

### Forbidden Chart Types
- 3D Charts
- Radar
- Exploded Pie
- Decorative Gauges

### Data Visualization Tokens
Charts must inherit dedicated semantic tokens instead of arbitrary colors:
- `chart.income`
- `chart.expense`
- `chart.goal`
- `chart.budget`
- `chart.warning`

## 18. Accessibility & Localization
Accessibility is permanently baked into the token system, never treated as an afterthought.
- **Contrast Ratios**: All text and critical UI elements must pass WCAG AA standards (4.5:1 for standard text, 3:1 for large text).
- **Focus Rings**: A universal `focus-ring` token ensures highly visible keyboard focus states that are never arbitrarily hidden.

### Localization
Localization is deeply embedded into the visual system.
- **Currencies & Dates**: Follow explicit user or platform locales.
- **RTL (Right-to-Left)**: Layouts and directional icons must seamlessly flip for RTL languages.
- **Long Strings**: UI surfaces must anticipate and gracefully handle text expansion (up to 300%) common in localized strings.

## 19. Design Anti-Patterns
To preserve the structural integrity of the design system, the following are strictly prohibited:
- **Multiple shadows**: No overlapping or stacked drop shadows on a single surface.
- **Mixed border radius**: No combining sharp and heavily rounded corners indiscriminately.
- **Random spacing**: No spacing values outside the 8-point/4-point grid rules.
- **Hardcoded colors**: No raw hex values declared anywhere in implementation code.
- **Decorative gradients**: Gradients are forbidden unless serving a specific, documented semantic purpose.

## 20. Token Naming Convention
Tokens follow a strict, predictable taxonomy to ensure developer experience and architectural alignment.
- **Structure**: `[Category]-[Property]-[Variant]-[State]`
- **Examples**: `color-surface-elevated-default`, `space-padding-md`, `type-body-large-semibold`.

## 21. Versioning
The Design System strictly adheres to Semantic Versioning (SemVer).
- **Major**: Breaking changes to token names or fundamental layout shifts.
- **Minor**: Addition of new tokens or non-breaking visual updates.
- **Patch**: Minor optical adjustments or documentation corrections.
