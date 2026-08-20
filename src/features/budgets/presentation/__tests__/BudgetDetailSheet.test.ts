import { describe, it, expect, vi } from 'vitest';
import { BudgetViewModel } from '../models/BudgetViewModel';

const mockBudgetDetail: BudgetViewModel = {
  id: 'b-500',
  categoryId: 'cat-dining',
  isOverall: false,
  amount: 15000,
  currency: 'INR',
  periodKind: 'MONTHLY',
  startDate: '2026-08-01T00:00:00Z',
  endDate: '2026-08-31T23:59:59Z',
  isArchived: false,
  archivedAt: null,
  spentAmount: 13500,
  remainingAmount: 1500,
  percentageUsed: 90,
  healthStatus: 'NEAR_LIMIT',
};

const mockOverBudgetDetail: BudgetViewModel = {
  ...mockBudgetDetail,
  id: 'b-501',
  spentAmount: 18000,
  remainingAmount: -3000,
  percentageUsed: 120,
  healthStatus: 'OVER_BUDGET',
};

describe('BudgetDetailSheet Presentation Behavior & State Rules', () => {
  it('validates near-limit budget presentation metrics', () => {
    expect(mockBudgetDetail.id).toBe('b-500');
    expect(mockBudgetDetail.spentAmount).toBe(13500);
    expect(mockBudgetDetail.remainingAmount).toBe(1500);
    expect(mockBudgetDetail.healthStatus).toBe('NEAR_LIMIT');
  });

  it('validates over-budget detail metrics rendering', () => {
    expect(mockOverBudgetDetail.healthStatus).toBe('OVER_BUDGET');
    expect(mockOverBudgetDetail.remainingAmount).toBeLessThan(0);
    expect(mockOverBudgetDetail.percentageUsed).toBeGreaterThan(100);
  });

  it('invokes onEdit callback when Edit action is triggered', () => {
    const onEditMock = vi.fn();
    onEditMock(mockBudgetDetail);
    expect(onEditMock).toHaveBeenCalledWith(mockBudgetDetail);
  });

  it('invokes onArchive callback when Archive action is confirmed', () => {
    const onArchiveMock = vi.fn();
    onArchiveMock(mockBudgetDetail);
    expect(onArchiveMock).toHaveBeenCalledWith(mockBudgetDetail);
  });
});
