import { describe, it, expect } from 'vitest';
import { MonthOverMonthComparison } from '../value-objects/MonthOverMonthComparison';
import { ReportingDomainError } from '../errors/ReportingDomainError';

describe('MonthOverMonthComparison', () => {
  it('calculates deltas and percentage changes when previous values > 0', () => {
    const mom = new MonthOverMonthComparison({
      currentIncome: 10000,
      currentExpense: 6000,
      currentNetSavings: 4000,
      previousIncome: 8000,
      previousExpense: 5000,
      previousNetSavings: 3000,
    });

    expect(mom.incomeDelta).toBe(2000);
    expect(mom.incomePercentageChange).toBe(25);
    expect(mom.expenseDelta).toBe(1000);
    expect(mom.expensePercentageChange).toBe(20);
    expect(mom.netSavingsDelta).toBe(1000);
    expect(mom.isZeroBaseline).toBe(false);
  });

  it('handles zero-baseline when previous expense is 0 and current expense > 0', () => {
    const mom = new MonthOverMonthComparison({
      currentIncome: 10000,
      currentExpense: 2500,
      currentNetSavings: 7500,
      previousIncome: 10000,
      previousExpense: 0,
      previousNetSavings: 10000,
    });

    expect(mom.expenseDelta).toBe(2500);
    expect(mom.isZeroBaseline).toBe(true);
    expect(mom.expensePercentageChange).toBeNull();
  });

  it('handles zero baseline when both previous and current expense are 0', () => {
    const mom = new MonthOverMonthComparison({
      currentIncome: 10000,
      currentExpense: 0,
      currentNetSavings: 10000,
      previousIncome: 10000,
      previousExpense: 0,
      previousNetSavings: 10000,
    });

    expect(mom.expenseDelta).toBe(0);
    expect(mom.isZeroBaseline).toBe(false);
    expect(mom.expensePercentageChange).toBe(0);
  });

  it('throws ReportingDomainError when invalid NaN values are passed', () => {
    expect(() => {
      new MonthOverMonthComparison({
        currentIncome: NaN,
        currentExpense: 100,
        currentNetSavings: -100,
        previousIncome: 100,
        previousExpense: 100,
        previousNetSavings: 0,
      });
    }).toThrow(ReportingDomainError);
  });
});
