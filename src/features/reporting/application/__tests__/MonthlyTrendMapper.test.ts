import { describe, it, expect } from 'vitest';
import { calculateTrendComparison, MonthlyTrendMapper } from '../mappers/MonthlyTrendMapper';

describe('MonthlyTrendMapper & calculateTrendComparison', () => {
  it('✓ computes normal percentage and absolute change', () => {
    const comp = calculateTrendComparison(1500, 1000);
    expect(comp.currentTotal).toBe(1500);
    expect(comp.previousPeriodTotal).toBe(1000);
    expect(comp.absoluteChange).toBe(500);
    expect(comp.percentageChange).toBe(50);
  });

  it('✓ computes negative percentage change when spend decreases', () => {
    const comp = calculateTrendComparison(750, 1000);
    expect(comp.absoluteChange).toBe(-250);
    expect(comp.percentageChange).toBe(-25);
  });

  it('✓ handles previousPeriodTotal == 0 gracefully (division-by-zero regression test)', () => {
    // When previous period spend was 0 and current spend is 500
    const compPositive = calculateTrendComparison(500, 0);
    expect(compPositive.previousPeriodTotal).toBe(0);
    expect(compPositive.absoluteChange).toBe(500);
    expect(compPositive.percentageChange).toBe(100);
    expect(Number.isNaN(compPositive.percentageChange)).toBe(false);

    // When both previous period spend and current spend are 0
    const compZero = calculateTrendComparison(0, 0);
    expect(compZero.previousPeriodTotal).toBe(0);
    expect(compZero.absoluteChange).toBe(0);
    expect(compZero.percentageChange).toBe(0);
    expect(Number.isNaN(compZero.percentageChange)).toBe(false);
  });

  it('✓ MonthlyTrendMapper attaches comparison when previousPeriodTotal is provided', () => {
    const response = MonthlyTrendMapper.toResponse(
      [
        { period: '2026-06-01', income: 0, expenses: 200, netCashFlow: -200 },
        { period: '2026-06-02', income: 0, expenses: 300, netCashFlow: -300 },
      ],
      400
    );

    expect(response.items).toHaveLength(2);
    expect(response.comparison).toBeDefined();
    if (response.comparison) {
      expect(response.comparison.currentTotal).toBe(500);
      expect(response.comparison.previousPeriodTotal).toBe(400);
      expect(response.comparison.absoluteChange).toBe(100);
      expect(response.comparison.percentageChange).toBe(25);
    }
  });
});
