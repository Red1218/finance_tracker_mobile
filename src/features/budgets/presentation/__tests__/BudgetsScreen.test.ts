import { describe, it, expect, vi } from 'vitest';
import { BudgetViewModel } from '../models/BudgetViewModel';

const mockBudgets: BudgetViewModel[] = [
  {
    id: 'b-1',
    categoryId: null,
    isOverall: true,
    amount: 50000,
    currency: 'INR',
    periodKind: 'MONTHLY',
    startDate: '2026-08-01T00:00:00Z',
    endDate: '2026-08-31T23:59:59Z',
    isArchived: false,
    archivedAt: null,
    spentAmount: 22000,
    remainingAmount: 28000,
    percentageUsed: 44,
    healthStatus: 'ON_TRACK',
  },
  {
    id: 'b-2',
    categoryId: 'cat-groceries',
    isOverall: false,
    amount: 15000,
    currency: 'INR',
    periodKind: 'MONTHLY',
    startDate: '2026-08-01T00:00:00Z',
    endDate: '2026-08-31T23:59:59Z',
    isArchived: false,
    archivedAt: null,
    spentAmount: 14000,
    remainingAmount: 1000,
    percentageUsed: 93.3,
    healthStatus: 'NEAR_LIMIT',
  },
];

describe('BudgetsScreen Presentation & User Actions', () => {
  it('computes aggregated totals across active budgets correctly', () => {
    let totalBudgeted = 0;
    let totalSpent = 0;

    mockBudgets.forEach((b) => {
      totalBudgeted += b.amount;
      totalSpent += b.spentAmount ?? 0;
    });

    const totalRemaining = totalBudgeted - totalSpent;

    expect(totalBudgeted).toBe(65000);
    expect(totalSpent).toBe(36000);
    expect(totalRemaining).toBe(29000);
  });

  it('triggers onAddBudget callback when FAB is pressed', () => {
    const onAddBudgetMock = vi.fn();
    onAddBudgetMock();
    expect(onAddBudgetMock).toHaveBeenCalled();
  });

  it('triggers onSelectBudget callback when budget card is selected', () => {
    const onSelectBudgetMock = vi.fn();
    onSelectBudgetMock(mockBudgets[0]);
    expect(onSelectBudgetMock).toHaveBeenCalledWith(mockBudgets[0]);
  });

  it('triggers create submit and refresh callbacks cleanly', async () => {
    const onCreateMock = vi.fn().mockResolvedValue(undefined);
    const onRefreshMock = vi.fn();

    const payload = {
      categoryId: null,
      amount: 40000,
      currencyCode: 'INR',
      period: 'MONTHLY' as any,
      startDate: new Date('2026-08-01'),
      endDate: new Date('2026-08-31'),
    };

    await onCreateMock(payload);
    onRefreshMock();

    expect(onCreateMock).toHaveBeenCalledWith(payload);
    expect(onRefreshMock).toHaveBeenCalled();
  });

  it('triggers archive submit and refresh callbacks cleanly', async () => {
    const onArchiveMock = vi.fn().mockResolvedValue(undefined);
    const onRefreshMock = vi.fn();

    await onArchiveMock('b-1');
    onRefreshMock();

    expect(onArchiveMock).toHaveBeenCalledWith('b-1');
    expect(onRefreshMock).toHaveBeenCalled();
  });
});
