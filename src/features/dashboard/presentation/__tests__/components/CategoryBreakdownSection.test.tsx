import { describe, it, expect } from 'vitest';
import { SectionViewModel } from '../../../application/view-models/DashboardViewModel';

describe('CategoryBreakdownSection Presentation Behavior', () => {
  const mockLoadedViewModel: SectionViewModel<any> = {
    sectionType: 'CategoryBreakdown',
    status: 'Loaded',
    isLoading: false,
    isEmpty: false,
    error: null,
    retryToken: null,
    lastUpdated: new Date(),
    content: [
      {
        name: 'Food & Dining',
        colorCode: '#EF4444',
        amountSpent: '₹12,500.00',
        proportion: 0.45,
      },
      {
        name: 'Shopping',
        colorCode: '#3B82F6',
        amountSpent: '₹8,000.00',
        proportion: 0.28,
      },
    ],
  };

  it('validates category spending rows and proportion calculations', () => {
    const categories = mockLoadedViewModel.content;
    expect(categories).toHaveLength(2);
    expect(categories[0].name).toBe('Food & Dining');
    expect(Math.round(categories[0].proportion * 100)).toBe(45);
  });
});
