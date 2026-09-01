import { describe, it, expect, vi } from 'vitest';
import { theme } from '../../../../../shared/theme/theme';

vi.mock('../../../../../shared/theme', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../../../shared/theme')>();
  return {
    ...actual,
    useTheme: () => theme,
  };
});
import { KPICardViewModel } from '../../../application/view-models/KPICardViewModel';
import { KPICardsSection } from '../../components/sections/KPICardsSection';

describe('KPICardsSection Hero Financial Card Presentation Behavior', () => {
  const mockLoadedViewModel: KPICardViewModel = {
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

  const mockErrorViewModel: KPICardViewModel = {
    sectionType: 'KPI',
    status: 'Error',
    isLoading: false,
    isEmpty: false,
    error: 'Failed to fetch financial metrics',
    retryToken: 'retry-kpi',
    lastUpdated: new Date(),
    content: null,
  };

  it('renders Hero Financial Card with Net Balance dominant and Income/Expenses sub-metrics', () => {
    const element = KPICardsSection({ viewModel: mockLoadedViewModel, onRetry: vi.fn() });

    expect(element.type.name).toBe('SectionStateContainer');
    expect(element.props.status).toBe('Loaded');

    const card = element.props.children;
    expect(card.props.variant).toBe('elevated');

    const cardChildren = card.props.children;
    // 0: NET BALANCE label
    expect(cardChildren[0].props.children).toBe('NET BALANCE');
    // 1: Net Balance Value
    expect(cardChildren[1].props.children).toBe('₹1,50,000.00');

    // 3: Metrics Row
    const metricsRow = cardChildren[3];
    const incomeCol = metricsRow.props.children[0];
    const expenseCol = metricsRow.props.children[1];

    expect(incomeCol.props.children[1].props.children).toBe('₹60,000.00');
    expect(expenseCol.props.children[1].props.children).toBe('₹20,000.00');
  });

  it('passes error state and onRetry callback to SectionStateContainer', () => {
    const onRetryMock = vi.fn();
    const element = KPICardsSection({ viewModel: mockErrorViewModel, onRetry: onRetryMock });

    expect(element.props.status).toBe('Error');
    expect(element.props.errorMessage).toBe('Failed to fetch financial metrics');

    element.props.onRetry();
    expect(onRetryMock).toHaveBeenCalledTimes(1);
  });
});
