import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { theme } from '../../../../../shared/theme/theme';

vi.mock('../../../../../shared/theme', () => ({
  useTheme: () => theme,
  withAlpha: (hex: string, alpha: number) => `rgba(from ${hex} / ${alpha})`,
}));

vi.mock('@react-native-community/datetimepicker', () => ({
  default: () => null,
}));

vi.mock('../../components/charts/TrendLineChart', () => ({
  TrendLineChart: () => null,
}));

vi.mock('../../components/charts/MonthlyTrendBarChart', () => ({
  MonthlyTrendBarChart: () => null,
}));

vi.mock('../../components/charts/CategoryDonutChart', () => ({
  CategoryDonutChart: () => null,
}));

vi.mock('../../components/charts/BudgetBarChart', () => ({
  BudgetBarChart: () => null,
}));

const refreshMock = vi.fn();
const changePeriodMock = vi.fn();

vi.mock('../../hooks/useReporting', () => ({
  useReporting: () => ({
    selectedPeriod: 'MONTH',
    viewModel: {
      selectedPeriod: 'MONTH',
      financialSummary: {
        formattedIncome: '₹60,000.00',
        formattedExpense: '₹20,000.00',
        formattedNetSavings: '₹40,000.00',
        savingsRatePercentage: 66.7,
        isPositiveSavings: true,
      },
      categoryBreakdown: [],
      monthlyTrend: [],
    },
    isLoading: false,
    error: null,
    changePeriod: changePeriodMock,
    refresh: refreshMock,
  }),
}));

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useState: (initial: any) => [typeof initial === 'function' ? initial() : initial, vi.fn()],
  };
});

import { ReportingScreen } from '../../screens/ReportingScreen';

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

function collectTexts(node: any): string[] {
  return collectNodes(node, (n) => typeof n === 'string');
}

describe('ReportingScreen Component Presentation', () => {
  it('renders screen container with a flat "Analytics" title, Export action, and pull-to-refresh content', () => {
    const element = ReportingScreen({}) as React.ReactElement<{
      style?: Array<{ backgroundColor?: string }>;
      children?: Array<React.ReactElement<any>>;
    }>;

    expect(element.props.style?.[1]?.backgroundColor).toBe(theme.colors.backgroundPrimary);

    const header = element.props.children?.[0] as React.ReactElement<{ children: any }>;
    const headerTop = header?.props?.children?.[0];
    const titleText = headerTop?.props?.children?.[0];
    expect(titleText?.props?.children).toBe('Analytics');

    // Refresh is no longer a header button - only Export stays in the header (§6.4).
    const texts = collectTexts(header);
    expect(texts).not.toContain('Refresh');
    expect(texts).toContain('Export');

    const scrollView = element.props.children?.[1] as React.ReactElement<{
      contentContainerStyle?: { padding?: number };
      refreshControl?: React.ReactElement<{ refreshing?: boolean; onRefresh?: () => void }>;
    }>;
    expect(scrollView?.props?.contentContainerStyle?.padding).toBe(16);

    // Pull-to-refresh replaces the old header Refresh button.
    expect(scrollView?.props?.refreshControl?.props?.refreshing).toBe(false);
    expect(scrollView?.props?.refreshControl?.props?.onRefresh).toBe(refreshMock);
  });
});
