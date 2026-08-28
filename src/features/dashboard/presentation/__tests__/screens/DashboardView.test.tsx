import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { theme } from '../../../../../shared/theme/theme';

vi.mock('expo-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

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

import { DashboardView } from '../../screens/DashboardView';
import { DashboardScreenState } from '../../models/DashboardScreenState';

describe('DashboardView Presentation Structure', () => {
  const mockState: DashboardScreenState = {
    isRefreshing: false,
    isPeriodSelectorOpen: false,
    lastRefresh: null,
    selectedSection: null,
    activeModal: null,
    viewModel: {
      activeReportingPeriodId: 'CurrentMonth',
      activeReportingPeriodLabel: 'This Month',
      overallStatus: 'Loaded',
      error: null,
      lastUpdated: new Date(),
      kpiSection: {
        sectionType: 'KPI',
        status: 'Loaded',
        isLoading: false,
        isEmpty: false,
        error: null,
        retryToken: null,
        lastUpdated: new Date(),
        content: {
          totalBalance: '₹50,000.00',
          periodIncome: '₹10,000.00',
          periodExpenses: '₹5,000.00',
          netForPeriod: '₹5,000.00',
          incomeTrend: { direction: 'Neutral', label: '0%', accessibilityLabel: '0%' },
          expenseTrend: { direction: 'Neutral', label: '0%', accessibilityLabel: '0%' },
        },
      },
      budgetHealthSection: {
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
            consumptionRatio: 70,
            isOverall: true,
          } as any,
        ],
      },
      categoryBreakdownSection: {
        sectionType: 'CategoryBreakdown',
        status: 'Loaded',
        isLoading: false,
        isEmpty: false,
        error: null,
        retryToken: null,
        lastUpdated: new Date(),
        content: [],
      },
      recentActivitySection: {
        sectionType: 'RecentActivity',
        status: 'Loaded',
        isLoading: false,
        isEmpty: false,
        error: null,
        retryToken: null,
        lastUpdated: new Date(),
        content: {
          rows: [],
          hasMore: false,
        },
      },
    },
  };

  it('renders DashboardView without KPICardsSection or QuickActionsSection', () => {
    const element = DashboardView({
      state: mockState,
      onRefresh: vi.fn(),
      onRefreshSection: vi.fn(),
      onChangePeriod: vi.fn(),
      onExecuteQuickAction: vi.fn(),
      onTogglePeriodSelector: vi.fn(),
    });

    const layout = element.props.children[0];
    const scrollChildren = layout.props.children;

    const sectionTypes = scrollChildren.map((c: any) => c?.props?.children?.type?.name).filter(Boolean);

    expect(sectionTypes).not.toContain('KPICardsSection');
    expect(sectionTypes).not.toContain('QuickActionsSection');
  });

  it('renders FAB component with create transaction navigation callback', () => {
    const onNavigateMock = vi.fn();
    const element = DashboardView({
      state: mockState,
      onRefresh: vi.fn(),
      onRefreshSection: vi.fn(),
      onChangePeriod: vi.fn(),
      onExecuteQuickAction: vi.fn(),
      onTogglePeriodSelector: vi.fn(),
      onNavigateToCreateTransaction: onNavigateMock,
    });

    const fab = element.props.children[1];
    expect(fab.props.accessibilityLabel).toBe('Add transaction');

    fab.props.onPress();
    expect(onNavigateMock).toHaveBeenCalledTimes(1);
  });
});
