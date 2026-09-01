# STRICT IMPLEMENTATION INSTRUCTIONS

A previous attempt at this work was reverted or never landed. This file exists to stop that happening again. Read it fully before writing any code.

---

## THE RULES

These are not preferences. Breaking any one of them means the work gets rejected.

1. **Read before writing.** `README.md`, then `07-visual-refresh.md`. No edits until both are read.
2. **The `.dc.html` file is a picture.** It is a browser mockup — inline styles, `conic-gradient` rings, unicode glyphs standing in for icons. You are recreating what it *shows* in React Native. You are not porting its markup, its CSS, or its structure. If you find yourself copying a `style="..."` string, stop.
3. **One PR per session.** The scope stated in the prompt is the whole scope. Do not "while I'm here" anything.
4. **No new components** except the three named in §7 of the spec. If you believe you need a fourth, stop and ask.
5. **No new dependencies.** No icon pack, no chart library, no animation library. Icons are `lucide-react-native`, already installed.
6. **No new colors, sizes, or spacing values.** Every value comes from `src/shared/theme/`. If a value you need is not a token, that is a finding to report, not a number to type.
7. **Never cross a feature boundary.** §9 of the spec names the three places this design needs data from another layer, and spells out the wrong answer beside each. `Boundary.test.ts` must pass at every commit.
8. **Do not touch** `package.json`, `app.json`, lockfiles, CI config, or any migration.
9. **Do not delete tests.** If a test fails, either the code is wrong or the test needs updating with a stated reason. Deleting it is neither.
10. **Show your plan before you edit.** Every session: list the files you intend to change and what you will do to each. Wait for approval.
11. **Commit in small, labelled steps** so any single change can be reverted without losing the rest.
12. **When the spec and the code disagree, say so.** Do not silently pick one. The spec was written on 30 August 2026 against `main`; the code may have moved.

---

## THE PROMPT

Paste this at the start of the session. Replace the scope block for each PR.

```
STRICT MODE. Read design_handoff_visual_refresh/INSTRUCTIONS.md first and follow
every rule in it. Then read design_handoff_visual_refresh/README.md and
design_handoff_visual_refresh/07-visual-refresh.md.

Context: this is an Expo / React Native app on Clean Architecture / DDD. I am applying
an approved visual refresh. A previous attempt was reverted, so I am being strict about
scope and process this time.

Hard constraints, no exceptions:
- The .dc.html in that folder is a BROWSER MOCKUP. Recreate the design in React Native
  with the components already in this repo. Do not port HTML, CSS, or inline styles.
- No new components beyond the three in §7 of the spec. No new dependencies. Icons are
  lucide-react-native, already installed.
- Every color, size, radius and spacing value comes from src/shared/theme/. If you need
  a value that isn't a token, report it — don't type a number.
- Do not cross a feature boundary. Read §9 of the spec; it names the three risky spots
  and the wrong answer for each.
- src/features/dashboard/presentation/__tests__/architecture/Boundary.test.ts must pass
  at every commit.
- Do not modify package.json, app.json, lockfiles, CI config, or migrations.
- Do not delete or skip tests.

SCOPE FOR THIS SESSION — nothing outside this:
<<< paste one scope block from PROMPTS.md here >>>

Process, in this order:
1. Read the three files above.
2. Tell me, in your own words, what this session's scope is and is not.
3. List every file you intend to change and what you'll do to each.
4. WAIT for my approval. Do not edit before I reply.
5. Implement in small commits, one logical change each.
6. Run the test suite. Report what passed, what failed, and what you changed to fix it.
7. Summarise what changed and what you deliberately left alone.

If anything in the spec conflicts with what you find in the code, or you think a
decision is wrong, say so before implementing — do not work around it silently.
```

---

## SESSION ORDER

Do not skip ahead. Each session ends with a merged PR before the next begins.

| # | Scope | Source |
|---|---|---|
| 1 | Tokens only — §4 and §5 | `PROMPTS.md` → PR 1 |
| 2 | The eight standalone fixes — §11 ready list | `PROMPTS.md` → PR 2 |
| 3 | Transactions (`2a`) | `PROMPTS.md` → PR 3+ |
| 4 | More + Settings (`4a`) | " |
| 5 | Detail sheets (`4b`, `4c`) | " |
| 6 | Sign in (`1d`) | " |
| 7 | Home (`1c`) | " |
| 8 | Analytics (`2c`) | " |
| 9 | Add transaction (`3b`, `3c`) | " |
| 10 | Light theme (`3d`) | " |

Sessions 1 and 2 change no layout. If the app looks broken after either, something is wrong — stop and diagnose rather than continuing.

---

## WHY THE LAST ATTEMPT PROBABLY FAILED

Worth knowing, so you can spot it happening again:

- **Too much scope in one session.** A whole refresh in one pass produces a diff nobody can review, so it gets reverted wholesale.
- **Porting the HTML.** Produces React Native that looks approximately right and shares nothing with the existing component library — every subsequent change then fights it.
- **Skipping the token layer.** If §4 and §5 don't land first, every screen hardcodes its own values and the refresh has to be redone.
- **No approval gate.** Without step 4, the model edits thirty files before you see the plan.

---

## CORRECTION PROMPTS

Keep these to hand.

**It's porting the mockup:**
```
Stop. You're implementing the HTML instead of the design. That file is a browser
mockup — inline styles, conic-gradient, unicode glyphs. Recreate the design in React
Native using this repo's existing components and lucide-react-native. Re-read rule 2
of INSTRUCTIONS.md and the "About the design files" section of the README.
```

**It's drifting out of scope:**
```
That's outside this session's scope. Revert it. The scope is exactly what I pasted —
nothing else, however tempting. Re-read rule 3.
```

**It's reaching across a boundary:**
```
That crosses a feature boundary. Read §9 of the spec, tell me which of the three
patterns this is, and propose the application-layer version instead.
```

**It invented a value:**
```
Where did that value come from? Every color, size and spacing value comes from
src/shared/theme/. If the token doesn't exist, tell me — don't type a number.
```

**It edited before approval:**
```
You edited before I approved the plan. Revert and start again at step 3.
```
