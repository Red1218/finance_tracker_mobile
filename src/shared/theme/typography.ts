export const typography = {
  // 400-weight display ramp (docs §5) — hero figures on Home, Budgets,
  // Analytics. Additive only: existing `display`/`heading` below are
  // untouched since 22 files consume them directly at weight 700.
  // Line-heights follow this file's existing +8 pattern (not spec-given).
  displayXLarge: {
    fontSize: 44,
    fontWeight: '400' as const,
    lineHeight: 52,
  },
  displayLarge: {
    fontSize: 38,
    fontWeight: '400' as const,
    lineHeight: 46,
  },
  displayMedium: {
    fontSize: 32,
    fontWeight: '400' as const,
    lineHeight: 40,
  },
  displaySmall: {
    fontSize: 26,
    fontWeight: '400' as const,
    lineHeight: 34,
  },
  display: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  numeric: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
    fontVariant: ['tabular-nums'] as const,
  },
  numericLarge: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
    fontVariant: ['tabular-nums'] as const,
  },
} as const;
