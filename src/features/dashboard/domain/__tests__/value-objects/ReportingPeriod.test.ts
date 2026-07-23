import { describe, it, expect } from 'vitest';
import { ReportingPeriod } from '../../value-objects/ReportingPeriod';

describe('ReportingPeriod', () => {
  it('should create a valid reporting period', () => {
    const start = new Date('2026-07-01T00:00:00Z');
    const end = new Date('2026-07-31T23:59:59Z');
    const period = new ReportingPeriod('CurrentMonth', start, end);
    
    expect(period.type).toBe('CurrentMonth');
    expect(period.startDate).toEqual(start);
    expect(period.endDate).toEqual(end);
  });

  it('should be immutable against external Date mutations', () => {
    const start = new Date('2026-07-01T00:00:00Z');
    const end = new Date('2026-07-31T23:59:59Z');
    const period = new ReportingPeriod('CurrentMonth', start, end);

    // Mutate constructor input date
    start.setFullYear(2020);
    expect(period.startDate.getFullYear()).toBe(2026);

    // Mutate getter date
    const getterDate = period.startDate;
    getterDate.setFullYear(2020);
    expect(period.startDate.getFullYear()).toBe(2026);
  });

  it('should throw an error if start date is after end date', () => {
    const start = new Date('2026-07-31T00:00:00Z');
    const end = new Date('2026-07-01T23:59:59Z');
    
    expect(() => new ReportingPeriod('CurrentMonth', start, end)).toThrow('Start date must be before or equal to end date');
  });

  it('should return true for equals when periods are identical', () => {
    const p1 = new ReportingPeriod('CurrentMonth', new Date('2026-07-01'), new Date('2026-07-31'));
    const p2 = new ReportingPeriod('CurrentMonth', new Date('2026-07-01'), new Date('2026-07-31'));
    expect(p1.equals(p2)).toBe(true);
  });

  it('should return false for equals when periods differ', () => {
    const p1 = new ReportingPeriod('CurrentMonth', new Date('2026-07-01'), new Date('2026-07-31'));
    const p2 = new ReportingPeriod('LastMonth', new Date('2026-06-01'), new Date('2026-06-30'));
    expect(p1.equals(p2)).toBe(false);
  });

  it('should check if a date is contained within the period', () => {
    const period = new ReportingPeriod('CurrentMonth', new Date('2026-07-01T00:00:00Z'), new Date('2026-07-31T23:59:59Z'));
    expect(period.contains(new Date('2026-07-15T12:00:00Z'))).toBe(true);
    expect(period.contains(new Date('2026-08-01T00:00:00Z'))).toBe(false);
  });
});
