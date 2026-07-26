import { describe, it, expect } from 'vitest';
import { ReportingViewModelMapper } from '../mappers/ReportingViewModelMapper';

describe('ReportingViewModelMapper', () => {
  it('maps FinancialSummaryDTO into presentation-ready ViewModel', () => {
    const vm = ReportingViewModelMapper.toFinancialSummaryViewModel({
      totalIncome: 100000,
      totalExpense: 40000,
      netSavings: 60000,
      savingsRatePercentage: 60,
    });

    expect(vm.formattedIncome).toContain('1,00,000');
    expect(vm.formattedExpense).toContain('40,000');
    expect(vm.formattedNetSavings).toContain('60,000');
    expect(vm.savingsRatePercentage).toBe(60);
    expect(vm.isPositiveSavings).toBe(true);
  });

  it('maps CategoryBreakdown array into presentation-ready items', () => {
    const items = ReportingViewModelMapper.toCategoryBreakdownViewModel([
      {
        categoryId: 'c1',
        categoryName: 'Dining',
        amount: 5000,
        percentage: 20,
        transactionCount: 2,
      },
    ]);

    expect(items[0].categoryName).toBe('Dining');
    expect(items[0].formattedAmount).toContain('5,000');
    expect(items[0].percentage).toBe(20);
  });
});
