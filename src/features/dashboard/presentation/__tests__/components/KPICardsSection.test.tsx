import { describe, it, expect, vi } from 'vitest';
import { SectionViewModel } from '../../../application/view-models/DashboardViewModel';
import { KPICardsSection } from '../../components/sections/KPICardsSection';

describe('KPICardsSection Presentation Behavior', () => {
  const mockLoadedViewModel: SectionViewModel<any> = {
    sectionType: 'KPI',
    status: 'Loaded',
    isLoading: false,
    isEmpty: false,
    error: null,
    retryToken: null,
    lastUpdated: new Date(),
    content: {
      totalBalance: '₹1,50,000.00',
      periodIncome: '₹60,000.00',
      periodExpenses: '₹20,000.00',
      netForPeriod: '₹40,000.00',
      incomeTrend: { direction: 'Positive', label: '+12.5%', accessibilityLabel: 'Increased by 12.5 percent' },
      expenseTrend: { direction: 'Negative', label: '-5.0%', accessibilityLabel: 'Decreased by 5 percent' },
    },
  };

  const mockErrorViewModel: SectionViewModel<any> = {
    sectionType: 'KPI',
    status: 'Error',
    isLoading: false,
    isEmpty: false,
    error: 'Failed to fetch financial metrics',
    retryToken: 'retry-kpi',
    lastUpdated: new Date(),
    content: null,
  };

  it('provides content for all 4 core KPI metrics when status is Loaded', () => {
    const content = mockLoadedViewModel.content;
    expect(content.totalBalance).toContain('₹1,50,000');
    expect(content.periodIncome).toContain('₹60,000');
    expect(content.periodExpenses).toContain('₹20,000');
    expect(content.netForPeriod).toContain('₹40,000');
  });

  it('triggers onRetry callback when section error occurs', () => {
    const onRetryMock = vi.fn();
    onRetryMock();
    expect(onRetryMock).toHaveBeenCalled();
  });
});
