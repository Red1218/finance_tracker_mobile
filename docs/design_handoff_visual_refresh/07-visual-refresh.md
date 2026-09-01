# Finance Tracker — Visual Refresh Spec

> [!IMPORTANT]
> **Status**: Proposed — awaiting design + product sign-off
> **Version**: 0.1.0
> **Supersedes**: nothing. Extends `01-design-system.md` (Approved & Frozen 🔒) rather than replacing it.
> **Companion artifact**: the mockup board (`Finance Tracker - Design Audit.dc.html`), where every proposal here is drawn at 390×844.

This spec records the outcome of a read-only design audit of the shipped application. It changes token *values* and screen *composition*. It changes no component signature, no route, and no architectural boundary. Where this document and `01-design-system.md` disagree on a value, this document is the proposal and that one is still the law until this is approved.

---

## 1. Scope

**In scope:** the five tab destinations (Home, Transactions, Budgets, Analytics, More), Settings, the sign-in screen, the transaction-entry surfaces, both detail sheets, the four shared states, and the token files under `src/shared/theme/`.

**Out of scope:** Accounts, Categories, Finances & Reports, Bills, and Backup. These were read during the audit but not redesigned.

**Explicitly frozen** — audited, found sound, not to be changed:

- The five-destination bottom bar and the nine-route-to-five-tab mapping in `app/(tabs)/_layout.tsx`.
- The FAB → `/spends?openModal=true` single entry point for creating a transaction.
- `SectionStateContainer` — per-section skeleton / retry / empty, rather than a page-level spinner. This is a genuine strength and the states work in §6 builds on it rather than replacing it.
- Tabular numerals, the true typographic minus, the 44px minimum touch target, locale-aware Lakh/Crore formatting.
- The Clean Architecture layering. Every proposal here is implementable inside `presentation/`, with three named exceptions listed in §9.

---

## 2. Evidence-backed problems

Each item was found in shipped code, not inferred from the docs.

| # | Problem | Evidence |
|---|---|---|
| 1 | **No hierarchy on Home.** Nothing is the hero, so the eye has nowhere to land. | `DashboardView.tsx` renders two sections, both `Card variant="elevated"`, both headed at 24px/700. |
| 2 | **`surfaceElevated` does four jobs at once.** Elevation has stopped carrying meaning. | `#334155` is the card fill, the `CircularProgress` track, the row icon badge, and the active filter pill. |
| 3 | **Card-per-item lists.** Twenty transactions render as twenty bordered boxes. | `TransactionRow` — 12px radius, 1px border, 8px gap, 64px min-height, per row. Same pattern in `BudgetCard` and `more.tsx`. |
| 4 | **Built, tested, unmounted.** Three dashboard sections exist with passing tests and are not rendered. | `KPICardsSection`, `CategoryBreakdownSection`, `QuickActionsSection` are absent from `DashboardView`. |
| 5 | **The registry no longer describes the app.** | 8 of 15 approved components carry `⏳ Implementation`, including AppBar, BottomNavigation and FAB — all three of which *are* implemented. |
| 6 | **Hardcoded colors**, prohibited by `01-design-system.md` §19. | `rgba(22,163,74,0.12)` and `rgba(220,38,38,0.12)` in `KPICardsSection`; `rgba(59,130,246,0.15)` in `QuickActionsSection`; `rgba(255,255,255,0.08)` in `BudgetHealthSection.itemBorder`; `rgba(239,68,68,0.15)` in `BudgetCard` and `BudgetsScreen`. |
| 7 | **`colors.focus` is defined and never referenced.** No screen has a visible keyboard-focus state. | `colors.ts` exports `focus`; no consumer in the tree. |
| 8 | **One state, two colors.** | `BudgetHealthSection` paints the bar `error` at ≥80%; `MonthlyBudgetCard` paints the ring `warning` at the same threshold. |
| 9 | **Sub-44px targets.** | `BudgetCard`'s inline Edit and Delete are `minHeight: 32`. |
| 10 | **A label promising something the domain does not do.** | `BudgetCard`'s **Delete** calls `archiveBudgetUseCase`; the confirm dialog then admits the record "remains in historical reporting". |
| 11 | **Deferred features shipped as live UI.** | `LoginScreen` renders "Forgot Password? (Coming soon)" and "Sign Up (Coming soon)". |
| 12 | **Boxes nested three deep.** Analytics is the heaviest screen in the app. | `ReportingScreen`: `savingsBox` and `metricTile` each carry their own border and radius *inside* an already-bordered `Card`. |
| 13 | **`lightColors` is fully defined and never exercised.** | `colors.ts`; no light-mode screen exists to have been reviewed. |
| 14 | **The offline banner omits the two facts that make offline tolerable.** | `OfflineStatusBanner` shows visibility only — no "as of" time, no queued-change count, though the sync feature tracks both. |

---

## 3. Direction

One sentence: **hierarchy comes from size and space, not from boxes and weight.**

- Grounds stay desaturated. The accent appears as a line, a mark, or an outline — never as a large fill.
- A hero figure per screen, set large at weight 400. Nothing on a heading goes above 500.
- Discrete items (a listing, a card in a feed) may be boxed. Layout is never boxed.
- Semantic color is a reinforcement, never the sole signal. A sign, a word, or a position always rides with it.

---

## 4. Color

Replaces §6 of `01-design-system.md` if approved. Same hues, same semantic roles, lower chroma, so the accent stays the loudest thing on screen.

| Token | Today | Proposed (dark) | Notes |
|---|---|---|---|
| `brandPrimary` | `#2563EB` | `oklch(0.66 0.095 290)` ≈ `#9184d9` | Lines, marks, active tab, FAB outline. |
| `brandSecondary` | `#6366F1` | *collapses into `brandPrimary`* | Mono scheme; the indigo had no distinct job. |
| `success` | `#10B981` | `oklch(0.72 0.105 162)` | Income, transfer-in, on-track. 7.4:1 on `backgroundPrimary`. |
| `warning` | `#F59E0B` | `oklch(0.78 0.105 75)` | Near-limit. 8.7:1 on `backgroundPrimary`. |
| `error` | `#EF4444` | `oklch(0.64 0.13 22)` | Retains the most chroma of the three — it has to alarm. 4.9:1. |

**Light theme.** Not a value swap. Three additional rules:

- Accent darkens to `oklch(0.52 0.13 290)` ≈ `#6b5cc4`, measuring 5.1:1 on `#F8FAFC`. The dark-ground blurple manages only 3.1:1 there and fails for text.
- Warning **darkens** to `oklch(0.62 0.12 75)` (3.6:1), clearing the 3:1 that §18 requires of graphical objects. The dark-theme value fails that bar on white.
- The FAB inverts to a **filled** accent with a white glyph. A 1px outline has no presence on white.

**Surfaces.** `surfaceElevated` stops being a single fill and becomes three steps of one neutral ramp: `rgba(255,255,255,.045)` for surfaces, `.07` for hairlines, `.05` for icon badges. This is the fix for problem #2 and, indirectly, for #1.

---

## 5. Other tokens

| Token | File | Change |
|---|---|---|
| `radius.medium` (8) | `radius.ts` | Becomes the card and sheet default. `radius.large` (12) narrows to bottom sheets. `radius.extraLarge` (24) is unused — remove. |
| `typography.display` / `heading` | `typography.ts` | Add a 400-weight display ramp: 44 / 38 / 32 / 26. Existing 700 weights stay for numerals and labels. |
| `typography.numericLarge` | `typography.ts` | Unchanged, used far more: it is the hero figure on Home, Budgets and Analytics, at 400 rather than 700. |
| `spacing.space20` | `spacing.ts` | Becomes the page gutter, replacing `space16`. Already on the 4pt sub-grid. |
| `colors.focus` | `colors.ts` | Wire it up. 2px accent ring at 2px offset on every interactive element. No exceptions, no removals. |
| `shadows.small` / `medium` | `shadows.ts` | Retire. On a dark ground, elevation is an edge plus ambient darkness. Only sheets, dialogs and the FAB keep `shadows.large`. |

---

## 6. Screens

Each screen below follows the ten-point format. Board references in parentheses.

### 6.1 Home (`1c`)

1. **Purpose** — answer "can I spend today?" in under a second.
2. **Hierarchy** — budget ring (left to spend) → period rail → income/expense pair → category breakdown.
3. **Layout** — full-bleed header carrying the ring on a soft accent field; 20px gutter below.
4. **Components** — `CircularProgress`, period segmented control (see §7), `CategoryBreakdownSection`, `BottomNavigation`, `FAB`.
5. **Primary action** — FAB → add transaction.
6. **Secondary** — change period; open a category; avatar → profile; bell → notifications.
7. **States** — per-section skeleton / retry / empty via `SectionStateContainer`; global offline banner.
8. **Interactions** — pull to refresh; period change is one tap, not two.
9. **A11y** — ring keeps `progressbar` role and `accessibilityValue`; the ring's figure is also present as text, so the arc is never the only carrier.
10. **Responsive** — ring caps at 212px and centres; the breakdown list is the flexible region. On a tablet the header and list sit side by side.

**Note.** The ring is relabelled from "82% UTILIZED" to "₹8,420 left to spend". *Left* is the question a budget answers; *utilized* makes the reader do the subtraction. Recent Activity moves off Home to Transactions — **this is a product decision, not a design one** (§11).

### 6.2 Transactions (`2a`)

1. **Purpose** — find and inspect any recorded transaction.
2. **Hierarchy** — title → search → filter pills → date groups with running totals → rows.
3. **Layout** — hairline-separated rows, no per-row box.
4. **Components** — `TransactionSearch`, `TransactionDateGroup` (+ group total), `TransactionRow` (restyled, props unchanged), `FAB`.
5. **Primary action** — FAB → add transaction.
6. **Secondary** — search; filter by type; tap a row → detail sheet.
7. **States** — full-list skeleton; empty (offering the action); filtered-empty (offering **Clear filters**); error banner with retry.
8. **Interactions** — pull to refresh; the row is one 56px target.
9. **A11y** — filter pills are a radio group with `accessibilityState.selected`. The voided state is strike-through **plus** muted, never color alone.
10. **Responsive** — single column throughout; rows stretch. Master-detail on tablet, with the sheet becoming a right pane.

### 6.3 Budgets (`2b`)

1. **Purpose** — see whether the period is under control, and which category is not.
2. **Hierarchy** — period ring + figure + "N over budget" → category rows.
3. **Layout** — hero band, then hairline rows with bars.
4. **Components** — `CircularProgress`, `BudgetProgressBar`, `BudgetStatusBadge` (text variant), `FAB`, `EmptyBudgetState`.
5. **Primary action** — FAB → create budget.
6. **Secondary** — tap a row → `BudgetDetailSheet`, which is now the only home for Edit and Archive.
7. **States** — skeleton; empty via `EmptyBudgetState`; error banner.
8. **Interactions** — inline Edit/Delete removed from every card (fixes #9); one tap to the sheet.
9. **A11y** — each row keeps `progressbar` semantics; status is a word, so the bar's color is redundant rather than load-bearing.
10. **Responsive** — two-column row grid above 600px.

### 6.4 Analytics (`2c`)

1. **Purpose** — explain the period, then project the next one.
2. **Hierarchy** — segmented control → net savings hero → income/expense/vs-previous → trend → forecast.
3. **Layout** — no nested boxes; the forecast is the one tinted panel on the screen.
4. **Components** — `AnalyticsSegmentedControl`, `MonthlyTrendCard`, `MonthOverMonthCard`, `CashFlowForecastCard`, `ExportModal`, `AnalyticsSkeleton`, `ChartAccessibilityFallback`.
5. **Primary action** — Export.
6. **Secondary** — switch segment; change period.
7. **States** — `AnalyticsSkeleton` (hero / card / chart); error banner; forecast-unavailable.
8. **Interactions** — Refresh moves from a header button to pull-to-refresh, matching `DashboardLayout`.
9. **A11y** — charts keep `ChartAccessibilityFallback`. Income and expense differ by position and label, not only hue. Segment labels shorten to one word each so they never truncate.
10. **Responsive** — trend chart is the flexible region; two columns above 600px.

### 6.5 More and Settings (`4a`)

1. **Purpose** — reach the four secondary destinations; change preferences.
2. **Hierarchy** — title → rows, grouped under headers on Settings.
3. **Layout** — rows, not cards. Settings gains the group headers it never had.
4. **Components** — the shared `AppBar` (with `leadingAction` on Settings — `more.tsx` currently hand-rolls its own header), the row pattern from 6.2.
5. **Primary action** — none. This is a menu.
6. **Secondary** — every row.
7. **States** — no loading state needed for More; Settings rows show their current value, or a skeleton until preferences resolve.
8. **Interactions** — subtitles become live state (account count and total, active/archived category counts) instead of static prose.
9. **A11y** — rows are `button` role with the value announced as part of the label.
10. **Responsive** — single column; centred with a max width on tablet.

**Note.** The Theme row is the first surface anywhere in the app to expose the `LIGHT / DARK / SYSTEM` preference that `AppThemeProvider` already restores at boot.

### 6.6 Add a transaction (`3b` and `3c`)

Both ship. They are not rivals; they are two doors onto one contract.

- **`3b` amount-first** — reached from the FAB. Amount on a keypad, category as chips, account and date shown as defaults behind **More details**. Of the six fields the form collects, two change every time; this screen shows only those two. Two new components: numeric keypad, category chip row. The amount is a live region so each keystroke is announced. Keys are 58px.
- **`3c` full form** — reached from Edit, and the route for transfers and anything unusual. Same six fields in one column with a fixed action bar. Adds the consequence line: *"counts against your Food & Drink budget — ₹2,740 left this month"*.

Both submit through the existing `TransactionFormValues` contract and `TransactionFormModal`'s validation. **More details must not hide anything the domain requires** — the defaults have to be genuinely reliable, or `3b` becomes a trap.

### 6.7 Detail sheets (`4b`, `4c`)

Both become definition lists — label left, value right, hairline between — instead of stacks of nested boxes. Props unchanged on both.

- **Transaction (`4b`)** adds the budget the transaction counts against, and its sync state (invisible per-record today, in an offline-first app). **Void** keeps an outline rather than a red fill: it is reversible and should not look like deletion. The consequence is stated under the actions, not in a dialog read too late.
- **Budget (`4c`)** absorbs the Edit and Archive actions removed from the cards, and earns its existence by showing the top three transactions that consumed the budget. **Delete** is relabelled **Archive** (fixes #10) and loses its red fill, because it is not destructive.

### 6.8 Sign in (`1d`)

Card dropped — on a phone the viewport *is* the card. Field group sits at thumb height. The deferred affordances become styled-as-disabled links with no parenthetical (fixes #11). The error keeps the existing banner slot but says what to do next, rather than passing the controller message through. The active field carries the focus ring, using `colors.focus` (fixes #7).

---

## 7. New components

Three, total. Everything else in this spec reuses what exists.

| Component | Why it must be new | Home |
|---|---|---|
| Period segmented control | `AnalyticsSegmentedControl` already implements this pattern and is approved. It should be **promoted** to `src/shared/components`, not duplicated. | `src/shared/components/SegmentedControl/` |
| Numeric keypad | Nothing comparable exists. Only `3b` uses it. | `src/features/transactions/presentation/components/` |
| Category chip row | A radio group over categories; distinct from the existing dropdown. | `src/features/transactions/presentation/components/` |

Registry consequence: the promotion is a shared-component addition and needs an entry. The eight `⏳ Implementation` rows should be reconciled against reality in the same pass (problem #5).

---

## 8. States

Governed by `SectionStateContainer`, `LoadingSkeleton`, `RetryButton`, `EmptyState` and `OfflineStatusBanner` — all of which already exist. Three changes:

1. **Skeletons match real geometry** — ring, tiles, bars — so nothing shifts on arrival.
2. **Copy names the next action.** "No transactions found / Your transactions will appear here" becomes "Nothing recorded yet / Add your first transaction and this list starts filling itself in", with the action attached. One section failing must never blank a screen, and the copy should say so explicitly.
3. **The offline banner gains an "as of" time and a queued-change count** (fixes #14).

---

## 9. Architecture impact

The design is implementable without violating Clean Architecture or DDD. Composition changes live in `presentation/`. Three items need an application-layer field, and are called out so they are not solved by reaching sideways from a component:

| Need | Correct home | Wrong answer |
|---|---|---|
| Spend pace, days remaining | Formatted fields on the existing budget view-model in `application/`, consumed as strings — the contract `BudgetHealthRow` already uses. | Computing dates in a component. |
| "Counts against *budget*, ₹X left" on transaction entry and detail | A prop supplied by the composition layer. | `import` from the budgets feature inside the transactions presentation layer. |
| Top three transactions per budget; queued-sync count | Projections on the budgets read model and the sync module respectively. | Querying transactions from a budgets component. |

The boundary test in `src/features/dashboard/presentation/__tests__/architecture/Boundary.test.ts` should continue to pass unchanged. No ADR is invalidated; ADR-012's flat category model is assumed throughout.

---

## 10. Risk

| Proposal | Risk | Why |
|---|---|---|
| Token changes (§4, §5) | **Low** | Values only. `themeResolution` exists and is tested. |
| Home (`1c`) | **Medium** | Drops Recent Activity from Home; the soft accent field needs a ruling against §19's gradient prohibition. |
| Transactions (`2a`) | **Low** | Restyle; props unchanged. |
| Budgets (`2b`) | **Low–medium** | Costs one tap to reach Edit. |
| Analytics (`2c`) | **Medium** | `momComparison` is currently mock domain data and `CashFlowForecastCard` renders with `forecast={null}`. Both need a real read model. |
| More / Settings (`4a`) | **Low** | Live subtitles need counts that already exist. |
| Detail sheets (`4b`, `4c`) | **Low** | Props unchanged. The Archive rename is copy. |
| Add transaction `3c` | **Low** | One new cross-layer prop. |
| Add transaction `3b` | **Medium** | New interaction model, two new components, and it depends on defaults being trustworthy. |
| Light theme | **Medium to ship** | Nothing in the app has ever been seen in light mode. Expect a long tail of one-off hardcoded colors surfacing — see problem #6 for the ones already found. |

---

## 11. Implementation readiness

**Ready for implementation** — no open questions:
- Token changes in §4 and §5, including wiring `colors.focus`.
- Replacing the hardcoded rgba values (problem #6) with tokens.
- Reconciling the ≥80% threshold color between `BudgetHealthSection` and `MonthlyBudgetCard` (#8).
- Relabelling **Delete** → **Archive** on budgets (#10).
- Removing `BudgetCard`'s sub-44px inline actions (#9).
- Sign in (`1d`), Transactions (`2a`), More and Settings (`4a`), both detail sheets (`4b`, `4c`).
- The states pass (§8), except the queued-change count.

**Needs a design decision:**
- Whether the accent field behind the Home ring is permitted under §19's gradient prohibition.
- Final light-mode ramp steps beyond the three rules in §4.

**Needs a product decision:**
- Dropping Recent Activity from Home (`1c`).
- Whether "Forgot password" ships or the affordance is removed (#11).
- Whether both entry doors (`3b` + `3c`) ship, or only one.

**Needs architecture review:**
- Promoting the segmented control to `src/shared/components` (§7).
- The three application-layer additions in §9.
- A real read model behind Analytics' month-over-month and forecast cards.

---

## 12. Audit provenance

Read-only audit of `Red1218/finance_tracker_mobile@main`, conducted 30 August 2026 over the GitHub API into a separate workspace. No file in the repository was written, renamed, or committed. Findings are cited to shipped source throughout; where `docs/` and code disagree, this document follows the code.
