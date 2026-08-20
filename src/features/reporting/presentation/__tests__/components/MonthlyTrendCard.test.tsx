import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { theme } from '../../../../../shared/theme/theme';

vi.mock('../../../../../shared/theme', () => ({
  useTheme: () => theme,
}));

vi.mock('../../components/charts/TrendLineChart', () => ({
  TrendLineChart: () => null,
}));

import { MonthlyTrendCard } from '../../components/MonthlyTrendCard';
import { MonthlyTrendResponse } from '../../../application';

describe('MonthlyTrendCard Component Presentation', () => {
  const mockTrendData: MonthlyTrendResponse = {
    comparison: {
      currentTotal: 45000,
      previousPeriodTotal: 30000,
      absoluteChange: 15000,
      percentageChange: 50.0,
    },
    items: [
      {
        period: '2026-07',
        income: 60000,
        expenses: 25000,
        netCashFlow: 35000,
      },
      {
        period: '2026-08',
        income: 65000,
        expenses: 20000,
        netCashFlow: 45000,
      },
    ],
  };

  const emptyTrendData: MonthlyTrendResponse = {
    comparison: undefined,
    items: [],
  };

  it('renders Card primitive with trend header, comparison breakdown, and item rows', () => {
    const element = MonthlyTrendCard({ data: mockTrendData }) as React.ReactElement<{
      variant?: string;
      children?: Array<React.ReactElement<{
        children?: unknown;
      }>>;
    }>;

    expect(element.type).toBeDefined();
    expect(element.props.variant).toBe('elevated');

    const children = element.props.children ?? [];
    const title = children[0];
    expect(title?.props?.children).toBe('Trend & Comparison');

    const comparisonBox = children[1] as React.ReactElement<{
      children?: Array<React.ReactElement<{
        children?: Array<React.ReactElement<{
          children?: Array<React.ReactElement<{ children?: string }>>;
        }>>;
      }>>;
    }>;
    const compRow = comparisonBox?.props?.children?.[1];

    // Current Spend
    const currentVal = compRow?.props?.children?.[0]?.props?.children?.[1];
    expect(currentVal?.props?.children).toContain('45,000');

    // Previous Spend
    const prevVal = compRow?.props?.children?.[1]?.props?.children?.[1];
    expect(prevVal?.props?.children).toContain('30,000');

    // Change
    const changeVal = compRow?.props?.children?.[2]?.props?.children?.[1];
    const changeText = Array.isArray(changeVal?.props?.children)
      ? changeVal.props.children.join('')
      : String(changeVal?.props?.children ?? '');
    expect(changeText).toContain('+₹15,000');
    expect(changeText).toContain('+50.0%');
  });

  it('renders empty trend state message when no items exist', () => {
    const element = MonthlyTrendCard({ data: emptyTrendData }) as React.ReactElement<{
      children?: Array<React.ReactElement<{ children?: string }>>;
    }>;
    const children = element.props.children ?? [];
    const emptyText = children[3];

    expect(emptyText?.props?.children).toBe('No trend data for this period.');
  });
});
