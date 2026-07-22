import { describe, it, expect } from 'vitest';
import { ReportingPeriod } from '../value-objects/ReportingPeriod';

describe('ReportingPeriod', () => {
  it('exposes all six frozen period values', () => {
    expect(ReportingPeriod.CURRENT_MONTH).toBe('CURRENT_MONTH');
    expect(ReportingPeriod.PREVIOUS_MONTH).toBe('PREVIOUS_MONTH');
    expect(ReportingPeriod.LAST_3_MONTHS).toBe('LAST_3_MONTHS');
    expect(ReportingPeriod.LAST_6_MONTHS).toBe('LAST_6_MONTHS');
    expect(ReportingPeriod.LAST_12_MONTHS).toBe('LAST_12_MONTHS');
    expect(ReportingPeriod.CUSTOM).toBe('CUSTOM');
  });

  it('has exactly six members', () => {
    const values = Object.values(ReportingPeriod);
    expect(values).toHaveLength(6);
  });
});
