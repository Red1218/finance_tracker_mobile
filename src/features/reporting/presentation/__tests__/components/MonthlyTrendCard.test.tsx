import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { theme } from '../../../../../shared/theme/theme';

vi.mock('../../../../../shared/theme', () => ({
  useTheme: () => theme,
}));

vi.mock('../../components/charts/MonthlyTrendBarChart', () => ({
  MonthlyTrendBarChart: () => null,
}));

import { MonthlyTrendCard } from '../../components/MonthlyTrendCard';
import { MonthlyTrendResponse } from '../../../application';

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

describe('MonthlyTrendCard Component Presentation', () => {
  const mockTrendData: MonthlyTrendResponse = {
    comparison: undefined,
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

  it('renders a flat title (no boxed Card) and mounts the paired bar chart when items exist', () => {
    const element = MonthlyTrendCard({ data: mockTrendData });

    expect(collectNodes(element, (n) => n?.type?.name === 'Card')).toHaveLength(0);

    const texts = collectTexts(element);
    expect(texts).toContain('2-Month Trend');
    expect(texts).not.toContain('No trend data for this period.');
  });

  it('renders empty trend state message when no items exist', () => {
    const element = MonthlyTrendCard({ data: emptyTrendData });
    const texts = collectTexts(element);

    expect(texts).toContain('Trend');
    expect(texts).toContain('No trend data for this period.');
  });
});
