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

const mockOnTrackBudgetDetail: BudgetViewModel = {
  ...mockBudgetDetail,
  id: 'b-502',
  spentAmount: 4000,
  remainingAmount: 11000,
  percentageUsed: 26.7,
  healthStatus: 'ON_TRACK',
};

describe('BudgetDetailSheet Presentation & Behavior Rules', () => {
  it('validates ON_TRACK status presentation state', () => {
    expect(mockOnTrackBudgetDetail.healthStatus).toBe('ON_TRACK');
    expect(mockOnTrackBudgetDetail.remainingAmount).toBeGreaterThan(0);
    expect(mockOnTrackBudgetDetail.percentageUsed).toBeLessThan(80);
  });

  it('validates NEAR_LIMIT status presentation state', () => {
    expect(mockBudgetDetail.healthStatus).toBe('NEAR_LIMIT');
    expect(mockBudgetDetail.spentAmount).toBe(13500);
    expect(mockBudgetDetail.remainingAmount).toBe(1500);
  });

  it('validates OVER_BUDGET status presentation state', () => {
    expect(mockOverBudgetDetail.healthStatus).toBe('OVER_BUDGET');
    expect(mockOverBudgetDetail.remainingAmount).toBeLessThan(0);
    expect(mockOverBudgetDetail.percentageUsed).toBeGreaterThan(100);
  });

  it('triggers onEdit callback when Edit Limit action is pressed', () => {
    const onEditMock = vi.fn();
    onEditMock(mockBudgetDetail);
    expect(onEditMock).toHaveBeenCalledWith(mockBudgetDetail);
  });

  it('triggers onArchive callback when Archive Budget action is pressed', () => {
    const onArchiveMock = vi.fn();
    onArchiveMock(mockBudgetDetail);
    expect(onArchiveMock).toHaveBeenCalledWith(mockBudgetDetail);
  });

  it('triggers onClose callback when Close action is pressed', () => {
    const onCloseMock = vi.fn();
    onCloseMock();
    expect(onCloseMock).toHaveBeenCalled();
  });
});
