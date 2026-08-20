import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { theme } from '../../../../../shared/theme/theme';

vi.mock('../../../../../shared/theme', () => ({
  useTheme: () => theme,
}));

vi.mock('../../components/charts/BudgetBarChart', () => ({
  BudgetBarChart: () => null,
}));

import { BudgetPerformanceCard } from '../../components/BudgetPerformanceCard';
import { BudgetPerformanceResponse } from '../../../application';

describe('BudgetPerformanceCard Component Presentation', () => {
  const mockBudgetData: BudgetPerformanceResponse = {
    items: [
      {
        budgetId: 'b-1',
        categoryId: 'cat-1',
        categoryName: 'Groceries',
        budgetAmount: 10000,
        actualSpent: 5000,
        remaining: 5000,
        utilization: 50.0,
        status: 'Safe',
      },
      {
        budgetId: 'b-2',
        categoryId: 'cat-2',
        categoryName: 'Entertainment',
        budgetAmount: 5000,
        actualSpent: 4200,
        remaining: 800,
        utilization: 84.0,
        status: 'Near Limit',
      },
      {
        budgetId: 'b-3',
        categoryId: 'cat-3',
        categoryName: 'Shopping',
        budgetAmount: 8000,
        actualSpent: 9500,
        remaining: -1500,
        utilization: 118.75,
        status: 'Over Budget',
      },
    ],
  };

  const emptyBudgetData: BudgetPerformanceResponse = {
    items: [],
  };

  it('renders Card primitive with budget rows, spent vs limit text, and status colors', () => {
    const element = BudgetPerformanceCard({ data: mockBudgetData }) as React.ReactElement<{
      variant?: string;
      children?: Array<React.ReactElement<{
        children?: unknown;
      }>>;
    }>;

    expect(element.type).toBeDefined();
    expect(element.props.variant).toBe('elevated');

    const children = element.props.children ?? [];
    const title = children[0];
    expect(title?.props?.children).toBe('Budget Performance');

    const rows = children[2] as unknown as Array<React.ReactElement<{
      children?: Array<React.ReactElement<{
        children?: Array<React.ReactElement<{ children?: string }>>;
      }>>;
    }>>;

    // Row 1: Safe
    const row0 = rows[0];
    const header0 = row0?.props?.children?.[0];
    expect(header0?.props?.children?.[0]?.props?.children).toBe('Groceries');
    expect(header0?.props?.children?.[1]?.props?.children).toBe('Safe');

    const footer0 = row0?.props?.children?.[2];
    expect(footer0?.props?.children?.[0]?.props?.children).toContain('5,000');
    expect(footer0?.props?.children?.[1]?.props?.children).toContain('10,000');

    // Row 2: Near Limit
    const row1 = rows[1];
    const header1 = row1?.props?.children?.[0];
    expect(header1?.props?.children?.[1]?.props?.children).toBe('Near Limit');

    // Row 3: Over Budget
    const row2 = rows[2];
    const header2 = row2?.props?.children?.[0];
    expect(header2?.props?.children?.[1]?.props?.children).toBe('Over Budget');
  });

  it('renders empty budget state message when no items exist', () => {
    const element = BudgetPerformanceCard({ data: emptyBudgetData }) as React.ReactElement<{
      children?: Array<React.ReactElement<{ children?: string }>>;
    }>;
    const children = element.props.children ?? [];
    const emptyText = children[2];

    expect(emptyText?.props?.children).toBe('No budgets for this period.');
  });
});
