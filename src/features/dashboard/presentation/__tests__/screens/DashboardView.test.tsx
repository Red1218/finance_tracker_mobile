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
  withAlpha: (hex: string, alpha: number) => `rgba(from ${hex} / ${alpha})`,
}));

import { DashboardView } from '../../screens/DashboardView';
import { DashboardScreenState } from '../../models/DashboardScreenState';
import { SegmentedControl } from '../../../../../shared/components/SegmentedControl';
import { CategoryBreakdownSection } from '../../components/sections/CategoryBreakdownSection';
import { IncomeExpenseSection } from '../../components/sections/IncomeExpenseSection';
import { BudgetHealthSection } from '../../components/sections/BudgetHealthSection';

function collectNodes(node: any, predicate: (n: any) => boolean, out: any[] = []): any[] {
  if (node === null || node === undefined) return out;
  if (predicate(node)) out.push(node);
  if (typeof node !== 'object') return out;
  const children = node.props?.children;
  if (Array.isArray(children)) {
    children.forEach((c) => collectNodes(c, predicate, out));
  } else if (children !== undefined && children !== null) {
    collectNodes(children, predicate, out);
  }
  return out;
}

function collectTypeNames(node: any): string[] {
  return collectNodes(node, (n) => typeof n?.type?.name === 'string').map((n) => n.type.name);
}

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

  it('renders DashboardView without KPICardsSection, QuickActionsSection or RecentActivitySection', () => {
    const element = DashboardView({
      state: mockState,
      onRefresh: vi.fn(),
      onRefreshSection: vi.fn(),
      onChangePeriod: vi.fn(),
      onExecuteQuickAction: vi.fn(),
      onTogglePeriodSelector: vi.fn(),
    });

    const typeNames = collectTypeNames(element);

    expect(typeNames).not.toContain('KPICardsSection');
    expect(typeNames).not.toContain('QuickActionsSection');
    expect(typeNames).not.toContain('RecentActivitySection');
  });

  it('mounts the budget ring hero full-bleed as the first layout child, and the period rail, income/expense pair and category breakdown below it', () => {
    const element = DashboardView({
      state: mockState,
      onRefresh: vi.fn(),
      onRefreshSection: vi.fn(),
      onChangePeriod: vi.fn(),
      onExecuteQuickAction: vi.fn(),
      onTogglePeriodSelector: vi.fn(),
    });

    const dashboardLayout = element.props.children[0];
    const layoutChildren = dashboardLayout.props.children;

    // First child is BudgetHealthSection directly - no wrapping View, so it can be full-bleed.
    expect(layoutChildren[0].type).toBe(BudgetHealthSection);

    const gutter = layoutChildren[1];
    const gutterChildTypes = gutter.props.children.map((c: any) => c?.type);
    expect(gutterChildTypes).toContain(SegmentedControl);
    expect(gutterChildTypes).toContain(IncomeExpenseSection);
    expect(gutterChildTypes).toContain(CategoryBreakdownSection);

    const segmentedControl = gutter.props.children.find((c: any) => c?.type === SegmentedControl);
    expect(segmentedControl.props.selectedId).toBe('CurrentMonth');
  });

  it('places the upcomingBillsSection slot between the income/expense pair and the category breakdown', () => {
    const billsNode = React.createElement('View', { testID: 'bills' });

    const element = DashboardView({
      state: mockState,
      onRefresh: vi.fn(),
      onRefreshSection: vi.fn(),
      onChangePeriod: vi.fn(),
      onExecuteQuickAction: vi.fn(),
      onTogglePeriodSelector: vi.fn(),
      upcomingBillsSection: billsNode,
    });

    const gutterChildren = element.props.children[0].props.children[1].props.children;
    const incomeExpenseIndex = gutterChildren.findIndex((c: any) => c?.type === IncomeExpenseSection);
    const billsIndex = gutterChildren.findIndex((c: any) => c === billsNode);
    const categoryIndex = gutterChildren.findIndex((c: any) => c?.type === CategoryBreakdownSection);

    expect(incomeExpenseIndex).toBeGreaterThan(-1);
    expect(billsIndex).toBeGreaterThan(incomeExpenseIndex);
    expect(categoryIndex).toBeGreaterThan(billsIndex);
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
