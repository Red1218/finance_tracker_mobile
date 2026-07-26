import { describe, it, expect } from 'vitest';
import { reportingKeys } from '../hooks/queryKeys';
import { isValidDateRange } from '../hooks/useDashboardSummary';
import { ReportingPeriod } from '../../domain';

describe('Reporting Presentation Layer Unit Tests', () => {
  describe('reportingKeys', () => {
    it('✓ generates distinct query keys for different categories', () => {
      const keyDefault = reportingKeys.dashboardSummary(ReportingPeriod.MONTH, undefined, undefined, null);
      const keyFood = reportingKeys.dashboardSummary(ReportingPeriod.MONTH, undefined, undefined, 'cat-food');
      const keyTransport = reportingKeys.dashboardSummary(ReportingPeriod.MONTH, undefined, undefined, 'cat-transport');

      expect(keyDefault).not.toEqual(keyFood);
      expect(keyFood).not.toEqual(keyTransport);
      expect(keyFood).toContain('cat-food');
      expect(keyTransport).toContain('cat-transport');
    });

    it('✓ generates distinct query keys for category breakdown and trend', () => {
      const keyBreakdown = reportingKeys.categoryBreakdown(ReportingPeriod.MONTH, undefined, undefined, 'cat-food');
      const keyTrend = reportingKeys.monthlyTrend(ReportingPeriod.MONTH, undefined, undefined, 'cat-food');

      expect(keyBreakdown).toContain('categoryBreakdown');
      expect(keyTrend).toContain('monthlyTrend');
      expect(keyBreakdown).toContain('cat-food');
    });
  });

  describe('isValidDateRange', () => {
    it('✓ returns true for non-CUSTOM periods', () => {
      expect(isValidDateRange(ReportingPeriod.MONTH)).toBe(true);
      expect(isValidDateRange(ReportingPeriod.QUARTER)).toBe(true);
    });

    it('✓ returns false for CUSTOM period if dates are missing', () => {
      expect(isValidDateRange(ReportingPeriod.CUSTOM, new Date('2026-01-01'), undefined)).toBe(false);
      expect(isValidDateRange(ReportingPeriod.CUSTOM, undefined, new Date('2026-01-31'))).toBe(false);
    });

    it('✓ returns false when endDate < startDate', () => {
      const start = new Date('2026-05-01');
      const end = new Date('2026-04-01');
      expect(isValidDateRange(ReportingPeriod.CUSTOM, start, end)).toBe(false);
    });

    it('✓ returns true when startDate <= endDate', () => {
      const start = new Date('2026-04-01');
      const end = new Date('2026-05-01');
      expect(isValidDateRange(ReportingPeriod.CUSTOM, start, end)).toBe(true);
    });
  });
});
