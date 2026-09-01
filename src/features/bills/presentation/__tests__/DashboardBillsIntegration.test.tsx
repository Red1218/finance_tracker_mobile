import React from 'react';
import { describe, it, expect, vi } from 'vitest';

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

import { DashboardView } from '../../../dashboard/presentation/screens/DashboardView';
import { BudgetHealthSection } from '../../../dashboard/presentation/components/sections/BudgetHealthSection';
import { IncomeExpenseSection } from '../../../dashboard/presentation/components/sections/IncomeExpenseSection';
import { CategoryBreakdownSection } from '../../../dashboard/presentation/components/sections/CategoryBreakdownSection';
import { UpcomingBillsSection } from '../components/UpcomingBillsSection';
import { UpcomingBillsSectionState } from '../view-models/UpcomingBillsViewModel';
import { DashboardScreenState } from '../../../dashboard/presentation/models/DashboardScreenState';

describe('DashboardBillsIntegration Structural Verification', () => {
  it('renders upcomingBillsSection node in DashboardView between the income/expense pair and the category breakdown, without requiring Bills Application or Infrastructure dependencies', () => {
    const mockDashboardState: DashboardScreenState = {
      isRefreshing: false,
      isPeriodSelectorOpen: false,
      lastRefresh: Date.now(),
      selectedSection: null,
      activeModal: null,
      viewModel: {
        activeReportingPeriodId: 'CurrentMonth',
        activeReportingPeriodLabel: 'This Month',
        overallStatus: 'Loaded',
        error: null,
        lastUpdated: new Date(),
        kpiSection: { sectionType: 'KPI', status: 'Loaded', content: null, error: null, isLoading: false, isEmpty: true, retryToken: '0', lastUpdated: new Date() },
        budgetHealthSection: { sectionType: 'BudgetHealth', status: 'Loaded', content: null, error: null, isLoading: false, isEmpty: true, retryToken: '0', lastUpdated: new Date() },
        categoryBreakdownSection: { sectionType: 'CategoryBreakdown', status: 'Loaded', content: null, error: null, isLoading: false, isEmpty: true, retryToken: '0', lastUpdated: new Date() },
        recentActivitySection: { sectionType: 'RecentActivity', status: 'Loaded', content: { rows: [], hasMore: false }, error: null, isLoading: false, isEmpty: true, retryToken: '0', lastUpdated: new Date() },
      },
    };

    const upcomingBillsState: UpcomingBillsSectionState = {
      status: 'SUCCESS',
      bills: [
        {
          billId: 'bill-dash-1',
          billName: 'Mortgage Payment',
          formattedAmount: '₹45,000.00',
          rawAmount: 45000,
          currencyCode: 'INR',
          dueDateLabel: 'Due in 7 days',
          status: 'Upcoming',
          urgency: 'medium',
          categoryName: 'Housing',
        },
      ],
      errorMessage: null,
    };

    const sectionNode = React.createElement(UpcomingBillsSection, {
      state: upcomingBillsState,
      onRetry: vi.fn(),
      onMarkPaidPress: vi.fn(),
    });

    const vnode = DashboardView({
      state: mockDashboardState,
      onRefresh: vi.fn(),
      onRefreshSection: vi.fn(),
      onChangePeriod: vi.fn(),
      onExecuteQuickAction: vi.fn(),
      onTogglePeriodSelector: vi.fn(),
      upcomingBillsSection: sectionNode,
    });

    expect(React.isValidElement(vnode)).toBe(true);

    const dashboardLayout = (vnode.props as { children: React.ReactNode[] }).children[0] as React.ReactElement;
    const layoutChildren = (dashboardLayout.props as { children: React.ReactNode[] }).children;

    // Budget ring hero is the first, full-bleed layout child.
    expect((layoutChildren[0] as React.ReactElement).type).toBe(BudgetHealthSection);

    // The bills slot lives inside the gutter, between IncomeExpenseSection and CategoryBreakdownSection.
    const gutter = layoutChildren[1] as React.ReactElement;
    const gutterChildren = (gutter.props as { children: React.ReactNode[] }).children;

    const incomeExpenseIndex = gutterChildren.findIndex(
      (c) => React.isValidElement(c) && c.type === IncomeExpenseSection
    );
    const billsIndex = gutterChildren.findIndex((c) => c === sectionNode);
    const categoryIndex = gutterChildren.findIndex(
      (c) => React.isValidElement(c) && c.type === CategoryBreakdownSection
    );

    expect(incomeExpenseIndex).toBeGreaterThan(-1);
    expect(billsIndex).toBeGreaterThan(incomeExpenseIndex);
    expect(categoryIndex).toBeGreaterThan(billsIndex);
  });
});
