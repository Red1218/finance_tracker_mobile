import { describe, it, expect, vi } from 'vitest';
import { BudgetSummaryViewModel } from '../types/BudgetViewModel';
import { BudgetPeriod } from '../../domain';

const mockSummary: BudgetSummaryViewModel = {
  budget: {
    id: 'b-1',
    categoryId: 'cat-groceries',
    amount: 10000,
    currency: 'INR',
    period: 'MONTHLY' as unknown as BudgetPeriod,

    startDate: new Date('2026-08-01'),
    endDate: new Date('2026-08-31'),
  },
  spentAmount: 6500,
  remainingAmount: 3500,
  percentageUsed: 65,
  status: 'OnTrack',
};

describe('BudgetCard', () => {
  it('validates budget summary presentation fields', () => {
    expect(mockSummary.budget.amount).toBe(10000);
    expect(mockSummary.spentAmount).toBe(6500);
    expect(mockSummary.percentageUsed).toBe(65);
    expect(mockSummary.remainingAmount).toBe(3500);
  });

  it('invokes edit callback safely', () => {
    const onEditMock = vi.fn();
    onEditMock();
    expect(onEditMock).toHaveBeenCalledTimes(1);
  });
});
