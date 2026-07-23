import { describe, it, expect } from 'vitest';
import { canActivateDashboard } from '../DashboardRoute';

describe('DashboardRoute', () => {
  it('should prevent activation if userId is missing', () => {
    expect(canActivateDashboard({})).toBe(false);
    expect(canActivateDashboard({ userId: '' })).toBe(false);
  });

  it('should allow activation if userId is provided', () => {
    expect(canActivateDashboard({ userId: '12345' })).toBe(true);
  });
});
