import { describe, it, expect, vi } from 'vitest';

vi.mock('expo-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

import { formatAccountsSubtitle, formatCategoriesSubtitle } from '../screens/MoreScreen';

describe('formatAccountsSubtitle', () => {
  it('shows the linked count and Lakh/Crore-grouped total, matching the spec mockup', () => {
    // 07-visual-refresh.md §6.5 / 4a-more-settings.png: "3 linked · ₹1,24,860 total"
    expect(formatAccountsSubtitle(3, 124860, false)).toBe('3 linked · ₹1,24,860 total');
  });

  it('shows a loading placeholder instead of a stale count while loading', () => {
    expect(formatAccountsSubtitle(0, 0, true)).toBe('Loading…');
  });

  it('handles zero linked accounts', () => {
    expect(formatAccountsSubtitle(0, 0, false)).toBe('0 linked · ₹0 total');
  });
});

describe('formatCategoriesSubtitle', () => {
  it('shows active and archived counts, matching the spec mockup', () => {
    // 07-visual-refresh.md §6.5 / 4a-more-settings.png: "14 active, 2 archived"
    expect(formatCategoriesSubtitle(14, 2, false)).toBe('14 active, 2 archived');
  });

  it('shows a loading placeholder instead of stale counts while loading', () => {
    expect(formatCategoriesSubtitle(0, 0, true)).toBe('Loading…');
  });

  it('handles zero archived categories', () => {
    expect(formatCategoriesSubtitle(9, 0, false)).toBe('9 active, 0 archived');
  });
});
