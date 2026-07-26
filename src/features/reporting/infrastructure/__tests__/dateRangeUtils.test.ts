import { describe, it, expect } from 'vitest';
import {
  resolveDateRange,
  resolvePreviousDateRange,
  resolveAggregationGranularity,
} from '../utils/dateRangeUtils';
import { ReportingPeriod } from '../../domain';

describe('dateRangeUtils Unit Tests', () => {
  describe('resolveDateRange', () => {
    it('✓ resolves TODAY range', () => {
      const range = resolveDateRange(ReportingPeriod.TODAY);
      expect(range.start).toBeDefined();
      expect(range.end).toBeDefined();
      expect(range.start.getTime()).toBeLessThanOrEqual(range.end.getTime());
    });

    it('✓ resolves WEEK range', () => {
      const range = resolveDateRange(ReportingPeriod.WEEK);
      expect(range.start).toBeDefined();
      expect(range.end).toBeDefined();
      expect(range.start.getTime()).toBeLessThanOrEqual(range.end.getTime());
    });

    it('✓ resolves MONTH range', () => {
      const range = resolveDateRange(ReportingPeriod.MONTH);
      expect(range.start).toBeDefined();
      expect(range.end).toBeDefined();
    });

    it('✓ resolves QUARTER range', () => {
      const range = resolveDateRange(ReportingPeriod.QUARTER);
      expect(range.start).toBeDefined();
      expect(range.end).toBeDefined();
    });

    it('✓ resolves YEAR range', () => {
      const range = resolveDateRange(ReportingPeriod.YEAR);
      expect(range.start).toBeDefined();
      expect(range.end).toBeDefined();
    });
  });

  describe('resolvePreviousDateRange', () => {
    it('✓ resolves previous period for TODAY', () => {
      const current = resolveDateRange(ReportingPeriod.TODAY);
      const prev = resolvePreviousDateRange(ReportingPeriod.TODAY);
      expect(prev.end.getTime()).toBeLessThan(current.start.getTime());
    });

    it('✓ resolves previous period for MONTH', () => {
      const current = resolveDateRange(ReportingPeriod.MONTH);
      const prev = resolvePreviousDateRange(ReportingPeriod.MONTH);
      expect(prev.start.getTime()).toBeLessThan(current.start.getTime());
    });

    it('✓ resolves previous period for YEAR', () => {
      const current = resolveDateRange(ReportingPeriod.YEAR);
      const prev = resolvePreviousDateRange(ReportingPeriod.YEAR);
      expect(prev.start.getFullYear()).toBe(current.start.getFullYear() - 1);
    });
  });

  describe('resolveAggregationGranularity', () => {
    it('✓ returns DAILY for short periods', () => {
      expect(resolveAggregationGranularity(ReportingPeriod.TODAY)).toBe('DAILY');
      expect(resolveAggregationGranularity(ReportingPeriod.WEEK)).toBe('DAILY');
      expect(resolveAggregationGranularity(ReportingPeriod.MONTH)).toBe('DAILY');
    });

    it('✓ returns MONTHLY for long periods', () => {
      expect(resolveAggregationGranularity(ReportingPeriod.QUARTER)).toBe('MONTHLY');
      expect(resolveAggregationGranularity(ReportingPeriod.YEAR)).toBe('MONTHLY');
    });

    it('✓ resolves CUSTOM granularity based on range', () => {
      const startShort = new Date('2026-01-01');
      const endShort = new Date('2026-01-15');
      expect(resolveAggregationGranularity(ReportingPeriod.CUSTOM, startShort, endShort)).toBe('DAILY');

      const startLong = new Date('2026-01-01');
      const endLong = new Date('2026-05-01');
      expect(resolveAggregationGranularity(ReportingPeriod.CUSTOM, startLong, endLong)).toBe('MONTHLY');
    });
  });
});
