import { describe, it, expect, vi } from 'vitest';
import { theme } from '../../../../../shared/theme/theme';

vi.mock('../../../../../shared/theme', () => ({
  useTheme: () => theme,
}));
import { KPICardViewModel } from '../../../application/view-models/KPICardViewModel';
import { KPICardsSection } from '../../components/sections/KPICardsSection';
import { KPICard } from '../../components/sections/KPICard';

describe('KPICardsSection & KPICard Presentation Behavior', () => {
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

  it('renders all 4 core KPI cards within SectionStateContainer', () => {
    const element = KPICardsSection({ viewModel: mockLoadedViewModel, onRetry: vi.fn() });

    expect(element.type.name).toBe('SectionStateContainer');
    expect(element.props.status).toBe('Loaded');

    const grid = element.props.children;
    const cards = grid.props.children;

    expect(cards).toHaveLength(4);

    // 1. Total Balance
    expect(cards[0].props.title).toBe('Total Balance');
    expect(cards[0].props.amount).toBe('₹1,50,000.00');

    // 2. Period Income
    expect(cards[1].props.title).toBe('Period Income');
    expect(cards[1].props.amount).toBe('₹60,000.00');

    // 3. Period Expenses
    expect(cards[2].props.title).toBe('Period Expenses');
    expect(cards[2].props.amount).toBe('₹20,000.00');

    // 4. Net Cash Flow
    expect(cards[3].props.title).toBe('Net Cash Flow');
    expect(cards[3].props.amount).toBe('₹40,000.00');
  });

  it('renders individual KPICard component with title, amount, and trend badge', () => {
    const cardElement = KPICard({
      title: 'Total Balance',
      amount: '₹1,50,000.00',
      trend: { direction: 'Positive', label: '+12.5%', accessibilityLabel: 'Increased' },
    });

    const cardContainer = cardElement.props.children;
    const cardContent = cardContainer.props.children;

    // Label
    expect(cardContent[0].props.children).toBe('Total Balance');
    // Amount
    expect(cardContent[1].props.children).toBe('₹1,50,000.00');
    expect(cardContent[1].props.accessibilityLabel).toBe('Total Balance is ₹1,50,000.00');
    // Trend
    const trendText = cardContent[2].props.children.props.children;
    expect(trendText.join('')).toBe('▲ +12.5%');
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
