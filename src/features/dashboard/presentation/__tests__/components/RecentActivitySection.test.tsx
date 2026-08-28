import { describe, it, expect, vi } from 'vitest';
import { theme } from '../../../../../shared/theme/theme';

vi.mock('expo-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));
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
        {
          description: 'Uber Ride',
          categoryName: 'Transport',
          date: 'Aug 06, 2026',
          amount: '₹420.00',
          direction: 'Expense',
        },
        {
          description: 'Coffee Shop',
          categoryName: 'Food',
          date: 'Aug 07, 2026',
          amount: '₹150.00',
          direction: 'Expense',
        },
      ],
      hasMore: true,
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

  it('renders Card primitive with section header, See All action, and exactly 3 recent transaction rows', () => {
    const onSeeAllMock = vi.fn();
    const element = RecentActivitySection({ viewModel: mockLoadedViewModel, onRetry: vi.fn(), onSeeAll: onSeeAllMock });

    expect(element.type.name).toBe('SectionStateContainer');
    expect(element.props.status).toBe('Loaded');

    const card = element.props.children;
    expect(card.props.variant).toBe('elevated');

    const cardChildren = card.props.children;
    const headerRow = cardChildren[0];
    expect(headerRow.props.children[0].props.children).toBe('Recent Activity');

    const seeAllButton = headerRow.props.children[1];
    expect(seeAllButton.props.accessibilityLabel).toBe('View all transactions');

    seeAllButton.props.onPress();
    expect(onSeeAllMock).toHaveBeenCalledTimes(1);

    const rows = cardChildren[1];
    // Must be sliced to exactly 3 items even though 4 were in mock input
    expect(rows).toHaveLength(3);

    // Row 0: Income
    const row0LeftGroup = rows[0].props.children[0];
    const row0RightAmount = rows[0].props.children[1];

    expect(row0LeftGroup.props.children[1].props.children[0].props.children).toBe('Monthly Salary');
    expect(row0LeftGroup.props.children[1].props.children[1].props.children.join('')).toBe('Aug 01, 2026 · Income');
    expect(row0RightAmount.props.children.join('')).toBe('+₹50,000.00');

    // Row 1: Expense
    const row1LeftGroup = rows[1].props.children[0];
    const row1RightAmount = rows[1].props.children[1];

    expect(row1LeftGroup.props.children[1].props.children[0].props.children).toBe('Supermarket Groceries');
    expect(row1LeftGroup.props.children[1].props.children[1].props.children.join('')).toBe('Aug 05, 2026 · Food');
    expect(row1RightAmount.props.children.join('')).toBe('-₹3,200.00');
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
