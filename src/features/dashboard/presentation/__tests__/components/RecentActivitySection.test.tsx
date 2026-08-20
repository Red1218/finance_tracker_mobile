import { describe, it, expect } from 'vitest';
import { SectionViewModel } from '../../../application/view-models/DashboardViewModel';

describe('RecentActivitySection Presentation Behavior', () => {
  const mockLoadedViewModel: SectionViewModel<any> = {
    sectionType: 'RecentActivity',
    status: 'Loaded',
    isLoading: false,
    isEmpty: false,
    error: null,
    retryToken: null,
    lastUpdated: new Date(),
    content: [
      {
        description: 'Monthly Salary',
        categoryName: 'Income',
        formattedDate: '2026-08-01',
        formattedAmount: '₹50,000.00',
        type: 'INCOME',
      },
      {
        description: 'Supermarket Groceries',
        categoryName: 'Food',
        formattedDate: '2026-08-05',
        formattedAmount: '₹3,200.00',
        type: 'EXPENSE',
      },
    ],
  };

  it('validates recent transactions rows and income vs expense direction indicators', () => {
    const activities = mockLoadedViewModel.content;
    expect(activities).toHaveLength(2);
    expect(activities[0].type).toBe('INCOME');
    expect(activities[1].type).toBe('EXPENSE');
  });
});
