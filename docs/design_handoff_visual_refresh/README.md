# Handoff: Finance Tracker visual refresh

## Overview

A design refresh of the shipped Finance Tracker Mobile app (`Red1218/finance_tracker_mobile@main`), covering the five tab destinations, Settings, sign-in, both transaction-entry surfaces, both detail sheets, the four shared states, and the light theme. It changes token *values* and screen *composition*. It changes no component signature, no route, and no architectural boundary.

The problem it solves: the app has good bones — clean layering, per-section state handling, a real token system — but on screen everything is the same card at the same weight, so no screen has a hero and nothing reads as more important than anything else. The refresh moves hierarchy from boxes and font-weight to size and space.

## About the design files

**`Finance Tracker - Design Audit.dc.html` is a design reference, not production code.** It is a single HTML file containing every mockup at 390×844, each annotated with the evidence behind it and the components it reuses. It exists to be *looked at*. Do not port its markup, its inline styles, or its structure.

The target is the existing app: **Expo + Expo Router + React Native**, with the component library in `src/shared/components/` and the token files in `src/shared/theme/`. Every proposal in this package was written specifically against those files. Implementation means changing token values and recomposing existing components — not building new ones (three exceptions, listed below).

Open the HTML in a browser. `support.js` must sit beside it.

## Fidelity

**High-fidelity.** Final colors (as OKLCH), type sizes, spacing, radii and copy. Two caveats:

- The mocks are drawn in HTML/CSS, so they use `conic-gradient` for rings, CSS `oklch()` for colors, and unicode glyphs as icon placeholders. In the app these become `CircularProgress` (which already exists, using `react-native-svg`), token values in `colors.ts`, and **lucide-react-native** icons — the pack the app already uses. Do not add a second icon pack.
- The mock data (₹ amounts, merchant names, dates) is illustrative and internally consistent, but it is not real. Use it to check your layout under realistic string lengths, not as fixtures.

## Read this first

**`07-visual-refresh.md` is the specification.** It is the authoritative document and it is self-sufficient: 14 evidence-cited problems, the full color and token tables, the ten-point spec per screen, new components, architecture impact, risk, and a readiness classification. This README orients you; that file tells you what to build.

Suggested order of work, lowest risk first:

1. **Tokens** — §4 and §5 of the spec. Values only, in `src/shared/theme/`.
2. **The eight standalone fixes** — the "Ready for implementation" list in §11. Each is independent and small; several are outright bugs (a sub-44px touch target, a button labelled Delete that archives, one state painted two different colors, a defined-but-unused focus token).
3. **Screens** — Transactions, More/Settings, both detail sheets, sign-in (all low risk), then Home, then Analytics.
4. **Add-transaction and light theme** last. Both are medium risk for reasons §10 explains.

## Screens

Board ids map to the spec's §6 sections. Each is drawn in the HTML file; find it by its id badge (`1c`, `2a`, …). Newest turn is at the top of the file.

| Id | Screen | Spec | Risk |
|---|---|---|---|
| `1a` | Home **as built today** — reference only, not a proposal | — | — |
| `1c` | Home — ring hero, period rail, category breakdown | §6.1 | Medium |
| `2a` | Transactions — hairline rows, group totals, outlined filter pills | §6.2 | Low |
| `2b` | Budgets — period ring hero, category rows | §6.3 | Low–medium |
| `2c` | Analytics — segmented control, savings hero, paired trend bars | §6.4 | Medium |
| `4a` | More + Settings — rows with live subtitles, group headers | §6.5 | Low |
| `3b` | Add transaction, amount-first (from the FAB) | §6.6 | Medium |
| `3c` | Add transaction, full form (from Edit) | §6.6 | Low |
| `4b` | Transaction detail sheet | §6.7 | Low |
| `4c` | Budget detail sheet | §6.7 | Low |
| `1d` | Sign in | §6.8 | Low |
| `3a` | Loading / empty / error / offline | §8 | Low |
| `3d` | Home in the light theme | §4 | Medium to ship |

`1b` is a rejected alternative for Home, kept for context. Do not build it.

## Design tokens

Full tables are in the spec (§4 color, §5 everything else). The short version:

- **Accent** `oklch(0.66 0.095 290)` ≈ `#9184d9`, replacing `#2563EB`. `brandSecondary` (`#6366F1`) collapses into it.
- **Semantics desaturate, hues unchanged**: success `oklch(0.72 0.105 162)`, warning `oklch(0.78 0.105 75)`, error `oklch(0.64 0.13 22)`. All clear 4.5:1 on `backgroundPrimary`.
- **Light theme is not a value swap**: accent darkens to `oklch(0.52 0.13 290)`, warning darkens to `oklch(0.62 0.12 75)`, the FAB inverts to a filled accent. Reasons and measured ratios in §4.
- **`surfaceElevated` stops being one fill doing four jobs** and becomes three steps of a neutral ramp. This single change is most of the fix for the flat-hierarchy problem.
- **Type**: add a 400-weight display ramp (44/38/32/26). Nothing on a heading above 500. Existing 700 weights stay for numerals and labels.
- **Radius** 8 becomes the default; **gutter** moves from 16 to 20; `shadows.small`/`medium` retire.

React Native's `StyleSheet` does not accept `oklch()`. Convert to hex at the token layer — the spec lists the hex approximations — and keep the OKLCH values in a comment so the ramp stays legible to the next person.

## New components

Three, and one of those is a promotion:

| Component | Note |
|---|---|
| Segmented control | **Promote** the existing `AnalyticsSegmentedControl` to `src/shared/components/`. Do not write a second one. Needs a registry entry. |
| Numeric keypad | New. Only `3b` uses it. Keys 58px. |
| Category chip row | New. A radio group over categories, distinct from the existing dropdown. |

## Architecture

The project follows Clean Architecture / DDD and the design was written to respect it. §9 of the spec names the three places that need an application-layer field, **with the wrong answer spelled out beside each** — those three are where an implementer is most likely to reach sideways across a feature boundary. Read that section before writing any code for Home, add-transaction, or the budget detail sheet.

The boundary test at `src/features/dashboard/presentation/__tests__/architecture/Boundary.test.ts` should pass unchanged throughout. If it fails, the design is not asking you to do what you just did.

## Decisions still open

Do not guess these; they are listed in §11 with who owns them.

- Whether Recent Activity leaves Home (product).
- Whether both add-transaction doors ship or only one (product).
- Whether "Forgot password" ships or the affordance is removed (product).
- Whether the soft accent field behind the Home ring is permitted under `01-design-system.md` §19's gradient prohibition (design).
- Real read models behind Analytics' month-over-month and forecast cards, which currently render from mock domain data and `forecast={null}` (architecture).

## Assets

None. The mocks use unicode glyphs as icon placeholders — substitute **lucide-react-native**, which the app already depends on. No new images, fonts or icon packs are introduced.

## Files in this bundle

- `07-visual-refresh.md` — the specification. Authoritative. Drop it into `docs/ui/` as-is; it is numbered and formatted to follow your 00–06 series.
- `Finance Tracker - Design Audit.dc.html` — the annotated mockup board. Open in a browser.
- `support.js` — runtime required by the HTML file. Keep it alongside.
- `screenshots/` — each mockup captured at 2x with its annotation, for reading without a browser:

| File | Contents |
|---|---|
| `1a-home-as-built.png` | Home as it ships today — the reference the rest is measured against |
| `1c-home-ring-hero.png` | Home, proposed |
| `1d-sign-in.png` | Sign in |
| `2a-transactions.png` | Transactions |
| `2b-budgets.png` | Budgets |
| `2c-analytics.png` | Analytics |
| `3a-states.png` | Loading, empty, error, offline — four content regions side by side |
| `3b-add-amount-first.png` | Add transaction, amount-first (from the FAB) |
| `3c-add-full-form.png` | Add transaction, full form (from Edit) |
| `3d-home-light.png` | Home in the light theme |
| `4a-more-settings.png` | More and Settings |
| `4b-transaction-detail.png` | Transaction detail sheet |
| `4c-budget-detail.png` | Budget detail sheet |
| `palette-and-token-spec.png` | The token spec table |

The annotation under each mockup carries its evidence, the components it reuses, and its risk — the same text as the spec's §6, in situ.

## Provenance

Read-only audit of `Red1218/finance_tracker_mobile@main`, 30 August 2026, conducted over the GitHub API into a separate workspace. **No file in the repository was written, renamed, or committed.** Findings are cited to shipped source throughout; where `docs/` and the code disagree, the spec follows the code.
