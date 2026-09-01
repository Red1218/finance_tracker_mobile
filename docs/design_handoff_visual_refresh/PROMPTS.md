# Prompts for Claude Code

One session per PR. Do not paste the whole refresh at once — scope is what keeps the work reviewable.

---

## PR 1 — tokens

```
This repo is an Expo / React Native app following Clean Architecture. I'm applying an
approved visual refresh. Read design_handoff_visual_refresh/README.md, then
design_handoff_visual_refresh/07-visual-refresh.md, before writing any code.

Scope for this session: §4 and §5 of the spec ONLY — token values in src/shared/theme/.
No screen changes, no component changes.

- Apply the color table in §4 to colors.ts, both darkColors and lightColors. The spec
  gives OKLCH; React Native StyleSheet can't parse oklch(), so convert to hex and keep
  the OKLCH value in a comment beside each token.
- brandSecondary collapses into brandPrimary. Leave the key in place with the accent
  value rather than removing it, so nothing breaks; flag every consumer you find.
- Apply §5: the 400-weight display ramp in typography.ts, radius.medium as default,
  space20 as the page gutter, retire shadows.small and shadows.medium.
- Split surfaceElevated into the three neutral steps the spec describes. List every
  current consumer and tell me which step each should get — do not guess, show me the
  list first.

Run the existing theme tests. Show me a summary of what changed before you touch
anything outside src/shared/theme/.
```

---

## PR 2 — the standalone fixes

```
Read design_handoff_visual_refresh/07-visual-refresh.md, §2 (problems) and §11
(readiness) before starting.

Scope: only the items under "Ready for implementation" in §11 that are standalone
fixes — not the screen work. Specifically problems #6, #7, #8, #9, #10 from §2:

- #6 Replace every hardcoded rgba()/hex in KPICardsSection, QuickActionsSection,
  BudgetHealthSection.itemBorder, BudgetCard and BudgetsScreen with tokens.
- #7 Wire colors.focus — 2px accent ring at 2px offset on every interactive element.
- #8 BudgetHealthSection and MonthlyBudgetCard disagree on the color for the same
  >=80% state. Pick warning, apply to both, and put the threshold in one place.
- #9 Remove BudgetCard's inline Edit/Delete (they're 32px, under the 44px floor).
  Those actions move to BudgetDetailSheet, which already accepts onEdit and onArchive.
- #10 Rename the budget "Delete" action to "Archive" everywhere, including
  DeleteBudgetDialog's copy. It calls archiveBudgetUseCase; the label is wrong.

One commit per numbered problem. Run the test suite.
```

---

## PR 3+ — one screen per session

Substitute the screen and its ids:

```
Read design_handoff_visual_refresh/README.md and 07-visual-refresh.md first.
Look at design_handoff_visual_refresh/screenshots/2a-transactions.png.

Scope: the Transactions screen only, per §6.2 of the spec.

The PNG is a design reference, not code to port — recreate it in React Native using
the components already in this repo. The spec's "Reuse" line for this screen tells you
which ones; do not create new components.

Before writing code, tell me:
1. Which existing components you'll change and how
2. Anything in the spec you can't implement without a new component or a new prop
3. Anything the spec asks for that would cross a feature boundary

Then implement. §9 of the spec names three places where an application-layer field is
needed and spells out the wrong answer beside each — read it. The boundary test at
src/features/dashboard/presentation/__tests__/architecture/Boundary.test.ts must pass.
```

Screen order, lowest risk first: `2a` Transactions → `4a` More/Settings → `4b` + `4c` detail sheets → `1d` sign in → `1c` Home → `2c` Analytics → `3b`/`3c` add-transaction → `3d` light theme.

---

## If it starts drifting

```
Stop. You're implementing the HTML rather than the design. The HTML in this bundle is
a browser mockup — inline styles, conic-gradient, unicode glyphs standing in for icons.
Recreate the design in React Native with this repo's existing components and
lucide-react-native icons. Re-read the "About the design files" section of the README.
```

```
That crosses a feature boundary. Read §9 of the spec and tell me which of the three
patterns this is, then propose the application-layer version instead.
```
