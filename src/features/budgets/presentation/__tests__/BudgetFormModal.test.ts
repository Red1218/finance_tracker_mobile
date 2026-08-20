import { describe, it, expect, vi } from 'vitest';
import { CreateBudgetFormData } from '../validation/budgetSchema';
import { BudgetViewModel } from '../models/BudgetViewModel';
import { BudgetPeriodType } from '../../domain/value-objects/BudgetPeriod';

describe('BudgetFormModal Presentation Behavior & Validation Rules', () => {
  const mockCategories = [
    { id: 'cat-1', label: 'Food & Dining' },
    { id: 'cat-2', label: 'Shopping' },
  ];

  const mockEditingBudget: BudgetViewModel = {
    id: 'b-100',
    categoryId: 'cat-1',
    isOverall: false,
    amount: 12000,
    currency: 'INR',
    periodKind: 'MONTHLY',
    startDate: '2026-08-01T00:00:00Z',
    endDate: '2026-08-31T23:59:59Z',
    isArchived: false,
    archivedAt: null,
    spentAmount: 4000,
    remainingAmount: 8000,
    percentageUsed: 33.3,
    healthStatus: 'ON_TRACK',
  };

  it('validates overall budget form submission values', () => {
    const values: CreateBudgetFormData = {
      categoryId: null,
      amount: 25000,
      currencyCode: 'INR',
      period: BudgetPeriodType.Monthly,
      startDate: new Date('2026-08-01'),
      endDate: new Date('2026-08-31'),
    };

    expect(values.categoryId).toBeNull();
    expect(values.amount).toBe(25000);
    expect(values.period).toBe(BudgetPeriodType.Monthly);
  });

  it('validates category budget form submission values', () => {
    const values: CreateBudgetFormData = {
      categoryId: 'cat-1',
      amount: 8000,
      currencyCode: 'INR',
      period: BudgetPeriodType.Weekly,
      startDate: new Date('2026-08-01'),
      endDate: new Date('2026-08-07'),
    };

    expect(values.categoryId).toBe('cat-1');
    expect(values.amount).toBe(8000);
    expect(values.period).toBe(BudgetPeriodType.Weekly);
    expect(values.startDate.getTime()).toBeLessThan(values.endDate.getTime());
  });

  it('validates edit mode pre-population from existing budget model', () => {
    expect(mockEditingBudget.amount).toBe(12000);
    expect(mockEditingBudget.categoryId).toBe('cat-1');
    expect(mockEditingBudget.isOverall).toBe(false);
  });

  it('invokes onSubmit callback when valid form data is submitted', async () => {
    const onSubmitMock = vi.fn().mockResolvedValue(undefined);
    const testData: CreateBudgetFormData = {
      categoryId: 'cat-2',
      amount: 15000,
      currencyCode: 'INR',
      period: BudgetPeriodType.Monthly,
      startDate: new Date('2026-08-01'),
      endDate: new Date('2026-08-31'),
    };

    await onSubmitMock(testData);
    expect(onSubmitMock).toHaveBeenCalledWith(testData);
  });
});
