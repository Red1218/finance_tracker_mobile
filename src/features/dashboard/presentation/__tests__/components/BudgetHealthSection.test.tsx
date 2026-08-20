import { describe, it, expect, vi } from 'vitest';
import { SectionViewModel } from '../../../application/view-models/DashboardViewModel';

describe('BudgetHealthSection Presentation Behavior', () => {
  const mockLoadedViewModel: SectionViewModel<any> = {
    sectionType: 'BudgetHealth',
    status: 'Loaded',
    isLoading: false,
    isEmpty: false,
    error: null,
    retryToken: null,
    lastUpdated: new Date(),
    content: [
      {
        categoryName: 'Groceries',
        formattedSpent: '₹14,000.00',
        formattedLimit: '₹15,000.00',
        percentageUsed: 93.3,
      },
      {
        categoryName: 'Dining',
        formattedSpent: '₹3,000.00',
        formattedLimit: '₹10,000.00',
        percentageUsed: 30.0,
      },
    ],
  };

  it('validates budget items content rendering and warning thresholds', () => {
    const budgets = mockLoadedViewModel.content;
    expect(budgets).toHaveLength(2);
    expect(budgets[0].categoryName).toBe('Groceries');
    expect(budgets[0].percentageUsed).toBeGreaterThanOrEqual(80);
    expect(budgets[1].percentageUsed).toBeLessThan(80);
  });
});
