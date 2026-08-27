import { describe, it, expect, vi } from 'vitest';
import { theme } from '../../../../../shared/theme/theme';

vi.mock('../../../../../shared/theme', () => ({
  useTheme: () => theme,
}));
import { BudgetHealthViewModel } from '../../../application/view-models/BudgetHealthViewModel';
import { BudgetHealthSection } from '../../components/sections/BudgetHealthSection';

describe('BudgetHealthSection Component Presentation', () => {
  const mockLoadedViewModel: BudgetHealthViewModel = {
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
        consumptionRatio: 0.933,
      },
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

  it('renders Card primitive with header, status badge, spent/limit details, and progress bar', () => {
    const element = BudgetHealthSection({ viewModel: mockLoadedViewModel, onRetry: vi.fn() });

    expect(element.type.name).toBe('SectionStateContainer');
    expect(element.props.status).toBe('Loaded');

    const card = element.props.children;
    expect(card.props.variant).toBe('elevated');

    const items = card.props.children[1];
    const item = items[0];
    const headerRow = item.props.children[0];
    const spentText = item.props.children[1];
    const progressBar = item.props.children[2];

    expect(headerRow.props.children[0].props.children).toBe('Budget Health');
    expect(headerRow.props.children[1].props.label).toBe('93%');
    expect(spentText.props.children.join('')).toBe('₹14,000.00 spent of ₹15,000.00');

    expect(progressBar.props.accessibilityRole).toBe('progressbar');
    expect(progressBar.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 93.3 });
  });

  it('renders EmptyState component when budget list is empty', () => {
    const element = BudgetHealthSection({ viewModel: mockEmptyViewModel, onRetry: vi.fn() });
    const cardChildren = element.props.children.props.children;
    const emptyState = cardChildren[1];

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
