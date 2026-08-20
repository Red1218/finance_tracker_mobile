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
      {
        statusLabel: 'OnTrack',
        amountConsumed: '₹3,000.00',
        budgetLimit: '₹10,000.00',
        consumptionRatio: 0.30,
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

  it('renders Card primitive with section header and budget rows', () => {
    const element = BudgetHealthSection({ viewModel: mockLoadedViewModel, onRetry: vi.fn() });

    expect(element.type.name).toBe('SectionStateContainer');
    expect(element.props.status).toBe('Loaded');

    const card = element.props.children;
    expect(card.props.variant).toBe('elevated');

    const cardChildren = card.props.children;
    const headerTitle = cardChildren[0];
    expect(headerTitle.props.children).toBe('Budget Health');
    expect(headerTitle.props.accessibilityRole).toBe('header');

    const items = cardChildren[1];
    expect(items).toHaveLength(2);

    // Row 0: OverBudget (near/above 80% threshold)
    const row0 = items[0];
    const header0 = row0.props.children[0];
    expect(header0.props.children[0].props.children).toBe('Overall Budget');
    expect(header0.props.children[1].props.children.join('')).toBe('₹14,000.00 / ₹15,000.00');

    const barFill0 = row0.props.children[1].props.children;
    expect(barFill0.props.style[1].width).toBe('93.3%');
    expect(barFill0.props.style[1].backgroundColor).toBe('#EF4444');

    // Row 1: OnTrack (below 80% threshold)
    const row1 = items[1];
    const barFill1 = row1.props.children[1].props.children;
    expect(barFill1.props.style[1].width).toBe('30%');
    expect(barFill1.props.style[1].backgroundColor).toBe('#10B981');
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
