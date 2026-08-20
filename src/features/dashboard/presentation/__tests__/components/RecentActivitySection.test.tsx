import { describe, it, expect, vi } from 'vitest';
import { theme } from '../../../../../shared/theme/theme';

vi.mock('../../../../../shared/theme', () => ({
  useTheme: () => theme,
}));
import { RecentActivityViewModel } from '../../../application/view-models/RecentActivityViewModel';
import { RecentActivitySection } from '../../components/sections/RecentActivitySection';

describe('RecentActivitySection Component Presentation', () => {
  const mockLoadedViewModel: RecentActivityViewModel = {
    sectionType: 'RecentActivity',
    status: 'Loaded',
    isLoading: false,
    isEmpty: false,
    error: null,
    retryToken: null,
    lastUpdated: new Date(),
    content: {
      rows: [
        {
          description: 'Monthly Salary',
          categoryName: 'Income',
          date: 'Aug 01, 2026',
          amount: '₹50,000.00',
          direction: 'Income',
        },
        {
          description: 'Supermarket Groceries',
          categoryName: 'Food',
          date: 'Aug 05, 2026',
          amount: '₹3,200.00',
          direction: 'Expense',
        },
      ],
      hasMore: false,
    },
  };

  const mockEmptyViewModel: RecentActivityViewModel = {
    sectionType: 'RecentActivity',
    status: 'Loaded',
    isLoading: false,
    isEmpty: true,
    error: null,
    retryToken: null,
    lastUpdated: new Date(),
    content: {
      rows: [],
      hasMore: false,
    },
  };

  const mockErrorViewModel: RecentActivityViewModel = {
    sectionType: 'RecentActivity',
    status: 'Error',
    isLoading: false,
    isEmpty: false,
    error: 'Failed to load recent activity',
    retryToken: 'retry-recent',
    lastUpdated: new Date(),
    content: null,
  };

  it('renders Card primitive with section header and recent transaction rows', () => {
    const element = RecentActivitySection({ viewModel: mockLoadedViewModel, onRetry: vi.fn() });

    expect(element.type.name).toBe('SectionStateContainer');
    expect(element.props.status).toBe('Loaded');

    const card = element.props.children;
    expect(card.props.variant).toBe('elevated');

    const cardChildren = card.props.children;
    const title = cardChildren[0];
    expect(title.props.children).toBe('Recent Activity');
    expect(title.props.accessibilityRole).toBe('header');

    const rows = cardChildren[1];
    expect(rows).toHaveLength(2);

    // Row 0: Income
    const row0Left = rows[0].props.children[0];
    const row0Right = rows[0].props.children[1];

    expect(row0Left.props.children[0].props.children).toBe('Monthly Salary');
    expect(row0Left.props.children[1].props.children.join('')).toBe('Income • Aug 01, 2026');
    expect(row0Right.props.children.join('')).toBe('+₹50,000.00');

    // Row 1: Expense
    const row1Left = rows[1].props.children[0];
    const row1Right = rows[1].props.children[1];

    expect(row1Left.props.children[0].props.children).toBe('Supermarket Groceries');
    expect(row1Left.props.children[1].props.children.join('')).toBe('Food • Aug 05, 2026');
    expect(row1Right.props.children.join('')).toBe('-₹3,200.00');
  });

  it('renders EmptyState component when activity list is empty', () => {
    const element = RecentActivitySection({ viewModel: mockEmptyViewModel, onRetry: vi.fn() });
    const cardChildren = element.props.children.props.children;
    const emptyState = cardChildren[1];

    expect(emptyState.type.name).toBe('EmptyState');
    expect(emptyState.props.message).toBe('No recent activity transactions found.');
  });

  it('passes error state and onRetry callback to SectionStateContainer', () => {
    const onRetryMock = vi.fn();
    const element = RecentActivitySection({ viewModel: mockErrorViewModel, onRetry: onRetryMock });

    expect(element.props.status).toBe('Error');
    expect(element.props.errorMessage).toBe('Failed to load recent activity');

    element.props.onRetry();
    expect(onRetryMock).toHaveBeenCalledTimes(1);
  });
});
