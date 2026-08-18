# Finance Tracker — Motion Architecture

> [!IMPORTANT]
> **Status**: Approved & Frozen
> **Version**: 1.0
> 
> In accordance with the UI Governance Constitution (`00-ui-governance.md`), this document is the **Single Source of Truth** for all motion, transitions, and animations across the application.

## 1. Introduction
The Finance Tracker Motion Architecture defines how elements move, transition, and behave over time. Motion is not an afterthought or a decorative layer; it is the connective tissue that explains state changes, enforces spatial hierarchy, and provides tactile feedback.

## 2. Motion Philosophy
Motion is architecture. In Finance Tracker, motion is used exclusively to explain changes in state, guide user focus, and provide immediate validation. It transforms discrete, static UI components into a cohesive, physical environment that users can trust. **Motion is never decorative.**

## 3. Motion Principles
- **Continuity**: Motion must connect states smoothly, preventing the user from losing their spatial orientation.
- **Hierarchy**: Motion must guide the user's eye to the most critical information.
- **Feedback**: Every interactive element must yield an immediate, deterministic physical response.
- **Trust**: In a financial application, motion must feel grounded, accurate, and serious.

## 4. Motion Architecture & Ownership
Motion must be entirely decoupled from business logic and component structure. 

To prevent duplicated responsibilities, motion ownership is strictly defined:

| Concern | Owner |
|---------|-------|
| Motion Tokens | Design System |
| Screen Transitions | Navigation |
| Component Motion | Component System |
| Gesture Physics | Motion |
| Implementation | Presentation Layer |

## 5. Motion Governance
Before any new animation is introduced into the application, it must pass the Motion Governance checklist. If any answer is "no," the animation is rejected.
- [ ] Why does it exist? (Must explain a state change or provide feedback).
- [ ] What user question does it answer?
- [ ] Which predefined motion token does it use?
- [ ] Does it properly support reduced motion?
- [ ] Does it meet the 60fps performance budget?
- [ ] Does it preserve the user's spatial context?

## 6. Motion Tokens
Motion is standardized through a strict set of design tokens. Hardcoding is prohibited.
- **Durations**:
  - `duration-fast` (100ms): Micro-interactions (hover, press).
  - `duration-base` (200ms): Component state changes, collapses.
  - `duration-slow` (300ms): Screen transitions, modal entrances.
- **Easings**:
  - `ease-standard`: Point-to-point movement within the screen.
  - `ease-entrance`: Decelerating (easing out) for elements entering the screen.
  - `ease-exit`: Accelerating (easing in) for elements leaving the screen.

## 7. Motion Decision Matrix
Developers must never guess how a component should animate. The following matrix makes motion deterministic:

| Interaction | Motion |
|-------------|--------|
| Screen Push | Slide from Trailing Edge |
| Screen Pop | Reverse Slide |
| Modal | Fade + Scale Up |
| Bottom Sheet | Vertical Slide Up |
| Snackbar | Slide Up + Fade |
| Tooltip | Fade In |
| Dialog | Fade + Scale Up |
| FAB Press | Scale Down |
| Card Press | Elevation Drop + Scale Down |

## 8. Transition Matrix
Navigation transitions are directly tied to the Navigation Architecture.

| From | To | Motion |
|------|----|--------|
| Dashboard | Transaction Details | Push (Slide) |
| Transaction Details | Dashboard | Pop (Reverse Slide) |
| Dashboard | Add Transaction | Full Screen Modal (Slide Up) |
| Dashboard | Filter | Bottom Sheet (Slide Up) |
| Dashboard | Delete Transaction | Dialog (Fade + Scale) |

## 9. Shared Element Governance
Shared element transitions (hero elements smoothly interpolating across screens) are powerful but must be used strictly where context is preserved.

**Allowed:**
- Transaction List → Transaction Details
- Account Card → Account Details
- Budget Summary → Budget Details

**Not Allowed:**
- Cross-module unrelated screens (e.g., Dashboard → Settings)
- Authentication flows (Security boundary must feel absolute)
- Modal wizard steps

## 10. Financial Motion Rules
Finance applications require trust. Financial data must animate under specific rules to reinforce stability.
- **Balance Updates**: Should never "jump" abruptly. Use a ticking/rolling animation for numeric changes.
- **Profit/Loss Indicators**: Should animate subtly (e.g., a soft color fade or slight chevron lift).
- **Currency Values**: Should never bounce, spring, or wobble. Physics must be heavily dampened.
- **Large Changes**: Major financial shifts (e.g., clearing a huge debt) should not flash or strobe the screen.

## 11. Component Motion
- **Expansion/Collapse**: Accordions and dropdowns must reveal their content smoothly over `duration-base` without instant layout shifts.
- **Toggles/Switches**: Must simulate physical toggles with a rapid `duration-fast` transition.

## 12. State Transitions
- **List Additions**: Expand vertically and fade in over `duration-base`.
- **List Deletions**: Shrink and fade out, allowing surrounding items to slide into place.

## 13. Feedback Motion
- **Press States**: Buttons and cards must scale down (`scale(0.98)`) or shift shadow elevation within a 100ms budget.
- **Hover States**: Desktop platforms utilize subtle background/elevation shifts on hover.

## 14. Gesture Motion
- **Swipe to Dismiss**: Must track the user's finger exactly (1:1 tracking) and utilize spring physics for release.
- **Overscroll**: Scrollable lists exhibit standard platform-native overscroll (rubber-banding).

## 15. Motion Lifecycle
For consistency and implementation accuracy, every orchestrated animation follows a strict lifecycle:

```text
Trigger (User input or state change)
   ↓
Prepare (Measure DOM/Layout, calculate bounds)
   ↓
Animate (Execute motion via compositor)
   ↓
Settle (Animation completes, state locks)
   ↓
Focus Restore (Screen reader focus is updated)
```

## 16. Animation Interruption Rules
Motion must be robust enough to handle unpredictable user behavior.
- **Rapid Double Taps**: Re-triggering an animation before it settles must seamlessly reverse or accelerate the current physics state, never jumping to 0.
- **Navigating Away**: If a user navigates away during an animation, the animation is immediately aborted and garbage collected.
- **Device Rotation**: Animations in progress during a screen rotation must instantly snap to their final settled state to prevent calculated bounds errors.
- **Backgrounding**: If the app is sent to the background, all active compositor animations pause and instantly settle upon foregrounding.

## 17. Platform Adaptation
While architectural intent remains the same, motion adapts to platform expectations.
- **iOS**: Favors spring physics, deep spatial blurring, and heavy reliance on overscroll.
- **Android**: Favors rigid elevation changes (Material Z-axis), ripple effects for touch feedback, and standard easings.
- **Web/Desktop**: Favors instant feedback, hover states, and rapid opacity transitions over heavy spatial sliding.

## 18. Reduced Motion & Battery Saver
Accessibility and hardware constraints override standard motion rules.
- **Reduced Motion**: When `prefers-reduced-motion` is true, all spatial transitions (slides, scales) convert to instant cuts or simple crossfades.
- **Battery Saver**: When the OS enters Low Power Mode, the application should automatically disable non-essential ambient animations (e.g., subtle charting loops or background shimmers) to conserve CPU cycles.

## 19. Motion Accessibility
- **Flash/Strobe**: Absolutely no flashing or strobing effects that cycle faster than 3 times per second (WCAG compliance).
- **Contrast**: Elements must maintain WCAG contrast ratios throughout the transition.

## 20. Performance Budget
- **Frame Rate**: Target 60fps (or 120fps on supported ProMotion devices).
- **Main Thread**: Layout thrashing (`width`, `height`, `margin`) is prohibited. Target `transform` and `opacity`.
- **Degradation**: Gracefully degrade to instant transitions if the device cannot maintain 60fps.

## 21. Motion Anti-Patterns
To preserve the premium feel, avoid these common mistakes:

> [!WARNING]
> **Never:**
> ❌ **Simultaneous Chaos**: Animating a drawer opening, a list loading, and a FAB appearing at the exact same time.
> ❌ **Linear Movement**: Using `ease-linear` for a bottom sheet makes it feel like a robotic PowerPoint slide.
> ❌ **Sluggishness**: Using `duration-slow` for a simple toggle switch.
> ❌ **The Rubber Band UI**: Using spring physics on standard modal dialogs or financial currency numbers.

## 22. Motion Registry
Similar to the Component Registry, all approved animations are tracked.

| Motion | Token | Used By |
|--------|-------|---------|
| Screen Push | `motion.screen.push` | Navigation |
| Button Press | `motion.button.press` | Button Component |
| Dialog Open | `motion.dialog.open` | Dialog Component |
| Ticker Update| `motion.data.ticker` | Financial Text |

## 23. Testing Standards
- **Automated Profiling**: CI pipelines must catch layout-thrashing animations.
- **Manual QA**: Transitions must be verified on baseline devices.

## 24. Versioning
Changes to motion tokens or global transition behaviors fall under Semantic Versioning.
- **Major**: Global overhaul of transition matrices.
- **Minor**: Adding new component animations or gesture logic.
- **Patch**: Tweaking token durations.
