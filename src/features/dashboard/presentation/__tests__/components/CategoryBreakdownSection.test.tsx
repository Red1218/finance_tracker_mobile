import { describe, it, expect, vi } from 'vitest';
import { theme } from '../../../../../shared/theme/theme';

vi.mock('../../../../../shared/theme', () => ({
  useTheme: () => theme,
}));
import { CategoryBreakdownViewModel } from '../../../application/view-models/CategoryBreakdownViewModel';
import { CategoryBreakdownSection } from '../../components/sections/CategoryBreakdownSection';

describe('CategoryBreakdownSection Component Presentation', () => {
  const mockLoadedViewModel: CategoryBreakdownViewModel = {
    sectionType: 'CategoryBreakdown',
    status: 'Loaded',
    isLoading: false,
    isEmpty: false,
    error: null,
    retryToken: null,
    lastUpdated: new Date(),
    content: [
      {
        categoryName: 'Food & Dining',
        amountSpent: '₹12,500.00',
        proportion: 0.45,
        rank: 1,
        displayIcon: 'utensils',
      },
      {
        categoryName: 'Shopping',
        amountSpent: '₹8,000.00',
        proportion: 0.28,
        rank: 2,
        displayIcon: 'shopping-bag',
      },
    ],
  };

  const mockEmptyViewModel: CategoryBreakdownViewModel = {
    sectionType: 'CategoryBreakdown',
    status: 'Loaded',
    isLoading: false,
    isEmpty: true,
    error: null,
    retryToken: null,
    lastUpdated: new Date(),
    content: [],
  };

  const mockErrorViewModel: CategoryBreakdownViewModel = {
    sectionType: 'CategoryBreakdown',
    status: 'Error',
    isLoading: false,
    isEmpty: false,
    error: 'Failed to load category breakdown',
    retryToken: 'retry-categories',
    lastUpdated: new Date(),
    content: null,
  };

  it('renders Card primitive with header and horizontal progress bar category rows', () => {
    const element = CategoryBreakdownSection({ viewModel: mockLoadedViewModel, onRetry: vi.fn() });

    expect(element.type.name).toBe('SectionStateContainer');
    expect(element.props.status).toBe('Loaded');

    const card = element.props.children;
    expect(card.props.variant).toBe('elevated');

    const cardChildren = card.props.children;
    const title = cardChildren[0];
    expect(title.props.children).toBe('Top Spending Categories');
    expect(title.props.accessibilityRole).toBe('header');

    const blocks = cardChildren[1];
    expect(blocks).toHaveLength(2);

    // Block 0: Food & Dining
    const row0 = blocks[0].props.children[0];
    const bar0 = blocks[0].props.children[1];

    expect(row0.props.children[0].props.children).toBe('Food & Dining');
    expect(row0.props.children[1].props.children[0].props.children).toBe('45%');
    expect(row0.props.children[1].props.children[1].props.children).toBe('₹12,500.00');

    expect(bar0.props.accessibilityRole).toBe('progressbar');
    expect(bar0.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 45 });
  });

  it('renders EmptyState component when category list is empty', () => {
    const element = CategoryBreakdownSection({ viewModel: mockEmptyViewModel, onRetry: vi.fn() });
    const cardChildren = element.props.children.props.children;
    const emptyState = cardChildren[1];

    expect(emptyState.type.name).toBe('EmptyState');
    expect(emptyState.props.message).toBe('No category spending recorded for this period.');
  });

  it('passes error state and onRetry callback to SectionStateContainer', () => {
    const onRetryMock = vi.fn();
    const element = CategoryBreakdownSection({ viewModel: mockErrorViewModel, onRetry: onRetryMock });

    expect(element.props.status).toBe('Error');
    expect(element.props.errorMessage).toBe('Failed to load category breakdown');

    element.props.onRetry();
    expect(onRetryMock).toHaveBeenCalledTimes(1);
  });
});
