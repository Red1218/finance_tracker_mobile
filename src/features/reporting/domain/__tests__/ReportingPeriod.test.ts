import { describe, it, expect } from 'vitest';
import { ReportingPeriod, ReportingPeriodValue } from '../value-objects/ReportingPeriod';
import { ReportingDomainError } from '../errors/ReportingDomainError';

describe('ReportingPeriod Value Object', () => {
  const startDate = new Date('2026-06-01T00:00:00.000Z');
  const endDate = new Date('2026-06-30T23:59:59.000Z');

  it('creates valid ReportingPeriodValue instance', () => {
    const period = new ReportingPeriodValue(ReportingPeriod.MONTH, startDate, endDate);
    expect(period.kind).toBe(ReportingPeriod.MONTH);
    expect(period.startDate).toEqual(startDate);
    expect(period.endDate).toEqual(endDate);
  });

  it('rejects invalid date range (startDate > endDate)', () => {
    expect(
      () => new ReportingPeriodValue(ReportingPeriod.CUSTOM, endDate, startDate)
    ).toThrow(ReportingDomainError);
  });

  it('evaluates date containment with contains()', () => {
    const period = new ReportingPeriodValue(ReportingPeriod.MONTH, startDate, endDate);

    expect(period.contains(new Date('2026-06-15T12:00:00.000Z'))).toBe(true);
    expect(period.contains(new Date('2026-05-31T23:59:59.000Z'))).toBe(false);
    expect(period.contains(new Date('2026-07-01T00:00:00.000Z'))).toBe(false);
  });

  it('evaluates period intersections with overlaps()', () => {
    const junePeriod = new ReportingPeriodValue(ReportingPeriod.MONTH, startDate, endDate);
    const midJuneJuly = new ReportingPeriodValue(
      ReportingPeriod.CUSTOM,
      new Date('2026-06-15'),
      new Date('2026-07-15')
    );
    const augustPeriod = new ReportingPeriodValue(
      ReportingPeriod.MONTH,
      new Date('2026-08-01'),
      new Date('2026-08-31')
    );

    expect(junePeriod.overlaps(midJuneJuly)).toBe(true);
    expect(junePeriod.overlaps(augustPeriod)).toBe(false);
  });
});
