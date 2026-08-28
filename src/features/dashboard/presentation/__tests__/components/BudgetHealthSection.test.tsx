import { describe, it, expect, vi } from 'vitest';
import { theme } from '../../../../../shared/theme/theme';

vi.mock('react-native-svg', () => {
  const React = require('react');
  return {
    default: (props: any) => React.createElement('Svg', props, props.children),
    Circle: (props: any) => React.createElement('Circle', props),
  };
});

vi.mock('../../../../../shared/theme', () => ({
  useTheme: () => theme,
}));

import { BudgetHealthViewModel } from '../../../application/view-models/BudgetHealthViewModel';
import { BudgetHealthSection } from '../../components/sections/BudgetHealthSection';

describe('BudgetHealthSection Component Presentation', () => {
  const mockGlobalBudgetViewModel: BudgetHealthViewModel = {
    sectionType: 'BudgetHealth',
    status: 'Loaded',
    isLoading: false,
    isEmpty: false,
    error: null,
    retryToken: null,
    lastUpdated: new Date(),
    content: [
      {
        statusLabel: 'OnTrack',
        amountConsumed: '₹1,400.00',
        budgetLimit: '₹2,000.00',
        remainingAmount: '₹600.00',
        consumptionRatio: 70,
        categoryId: undefined,
        isOverall: true,
      } as any,
    ],
  };

  const mockCategoryBudgetsViewModel: BudgetHealthViewModel = {
    sectionType: 'BudgetHealth',
    status: 'Loaded',
    isLoading: false,
    isEmpty: false,
    error: null,
    retryToken: null,
    lastUpdated: new Date(),
    content: [
      {
        statusLabel: 'OverBudget',
        amountConsumed: '₹14,000.00',
        budgetLimit: '₹15,000.00',
        remainingAmount: '₹1,000.00',
        consumptionRatio: 93,
        categoryId: 'cat-1',
        categoryName: 'Groceries',
        isOverall: false,
      } as any,
    ],
  };

  const mockEmptyViewModel: BudgetHealthViewModel = {
    sectionType: 'BudgetHealth',
    status: 'Loaded',
    isLoading: false,
    isEmpty: true,
    error: null,
    retryToken: null,
    lastUpdated: new Date(),
    content: [],
  };

  const mockErrorViewModel: BudgetHealthViewModel = {
    sectionType: 'BudgetHealth',
    status: 'Error',
    isLoading: false,
    isEmpty: false,
    error: 'Failed to load budget health',
    retryToken: 'retry-budgets',
    lastUpdated: new Date(),
    content: null,
  };

  it('renders MonthlyBudgetCard when global/overall budget exists', () => {
    const element = BudgetHealthSection({ viewModel: mockGlobalBudgetViewModel, onRetry: vi.fn() });

    expect(element.props.status).toBe('Loaded');
    const child = element.props.children;
    expect(child.type.name).toBe('MonthlyBudgetCard');
    expect(child.props.budget.consumptionRatio).toBe(70);
    expect(child.props.budget.remainingAmount).toBe('₹600.00');
  });

  it('renders MonthlyBudgetCard when categoryId is undefined or null (canonical overall representation)', () => {
    const canonicalViewModel: BudgetHealthViewModel = {
      ...mockGlobalBudgetViewModel,
      content: [
        {
          statusLabel: 'OnTrack',
          amountConsumed: '₹140.00',
          budgetLimit: '₹200.00',
          remainingAmount: '₹60.00',
          consumptionRatio: 70,
          categoryId: undefined,
        } as any,
      ],
    };

    const element = BudgetHealthSection({ viewModel: canonicalViewModel, onRetry: vi.fn() });
    const child = element.props.children;
    expect(child.type.name).toBe('MonthlyBudgetCard');
  });

  it('renders linear category list when category-only budgets exist', () => {
    const element = BudgetHealthSection({ viewModel: mockCategoryBudgetsViewModel, onRetry: vi.fn() });
    const card = element.props.children;
    expect(card.props.variant).toBe('elevated');

    const item = card.props.children[1][0];
    const headerRow = item.props.children[0];
    expect(headerRow.props.children[0].props.children).toBe('Groceries');
  });

  it('renders EmptyState component when budget list is empty', () => {
    const element = BudgetHealthSection({ viewModel: mockEmptyViewModel, onRetry: vi.fn() });
    const emptyContainer = element.props.children.props.children[1];
    const emptyState = emptyContainer.props.children[0];

    expect(emptyState.type.name).toBe('EmptyState');
    expect(emptyState.props.message).toBe('No active budgets configured for this period.');
  });

  it('passes error state and onRetry callback to SectionStateContainer', () => {
    const onRetryMock = vi.fn();
    const element = BudgetHealthSection({ viewModel: mockErrorViewModel, onRetry: onRetryMock });

    expect(element.props.status).toBe('Error');
    expect(element.props.errorMessage).toBe('Failed to load budget health');

    element.props.onRetry();
    expect(onRetryMock).toHaveBeenCalledTimes(1);
  });
});
