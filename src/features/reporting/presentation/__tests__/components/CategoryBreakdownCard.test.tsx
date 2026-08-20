import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { theme } from '../../../../../shared/theme/theme';

vi.mock('../../../../../shared/theme', () => ({
  useTheme: () => theme,
}));

vi.mock('../../components/charts/CategoryDonutChart', () => ({
  CategoryDonutChart: () => null,
}));

import { CategoryBreakdownCard } from '../../components/CategoryBreakdownCard';
import { CategoryBreakdownResponse } from '../../../application';

describe('CategoryBreakdownCard Component Presentation', () => {
  const mockCategoryData: CategoryBreakdownResponse = {
    items: [
      {
        categoryId: 'cat-1',
        categoryName: 'Housing & Rent',
        amount: 25000,
        percentage: 62.5,
        transactionCount: 1,
      },
      {
        categoryId: 'cat-2',
        categoryName: 'Food & Dining',
        amount: 15000,
        percentage: 37.5,
        transactionCount: 2,
      },
    ],
  };

  const emptyCategoryData: CategoryBreakdownResponse = {
    items: [],
  };

  it('renders Card primitive with title, donut chart, category names, and percentages', () => {
    const element = CategoryBreakdownCard({ data: mockCategoryData }) as React.ReactElement<{
      variant?: string;
      children?: Array<React.ReactElement<{
        children?: unknown;
      }>>;
    }>;

    expect(element.type).toBeDefined();
    expect(element.props.variant).toBe('elevated');

    const children = element.props.children ?? [];
    const title = children[0];
    expect(title?.props?.children).toBe('Spending by Category');

    const rows = children[2] as unknown as Array<React.ReactElement<{
      children?: Array<React.ReactElement<{
        children?: Array<React.ReactElement<{ children?: string }>>;
      }>>;
    }>>;

    // Row 1: Housing & Rent
    const row0 = rows[0];
    expect(row0?.props?.children?.[0]?.props?.children?.[1]?.props?.children).toBe('Housing & Rent');
    expect(row0?.props?.children?.[1]?.props?.children).toContain('25,000');
    expect(row0?.props?.children?.[2]?.props?.children?.join('')).toBe('62.5%');

    // Row 2: Food & Dining
    const row1 = rows[1];
    expect(row1?.props?.children?.[0]?.props?.children?.[1]?.props?.children).toBe('Food & Dining');
    expect(row1?.props?.children?.[1]?.props?.children).toContain('15,000');
    expect(row1?.props?.children?.[2]?.props?.children?.join('')).toBe('37.5%');
  });

  it('renders empty category state message when no items exist', () => {
    const element = CategoryBreakdownCard({ data: emptyCategoryData }) as React.ReactElement<{
      children?: Array<React.ReactElement<{ children?: string }>>;
    }>;
    const children = element.props.children ?? [];
    const emptyText = children[2];

    expect(emptyText?.props?.children).toBe('No category data for this period.');
  });
});
