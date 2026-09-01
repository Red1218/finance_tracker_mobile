import { describe, it, expect, vi } from 'vitest';
import { SupabaseDashboardRepository } from '../../infrastructure/repositories/SupabaseDashboardRepository';
import { LoadDashboardUseCase } from '../../application/use-cases/LoadDashboardUseCase';
import { FinancialSummaryService } from '../../domain/services/FinancialSummaryService';
import { BudgetHealthService } from '../../domain/services/BudgetHealthService';
import { CategoryBreakdownService } from '../../domain/services/CategoryBreakdownService';
import { RecentActivityService } from '../../domain/services/RecentActivityService';
import { LoggerAdapter } from '../../infrastructure/services/LoggerAdapter';
import { BudgetHealthSection } from '../../presentation/components/sections/BudgetHealthSection';
import { MonthlyBudgetCard } from '../../presentation/components/sections/MonthlyBudgetCard';
import React from 'react';

vi.mock('react-native-svg', () => {
  const React = require('react');
  return {
    default: (props: any) => React.createElement('Svg', props, props.children),
    Circle: (props: any) => React.createElement('Circle', props),
  };
});

vi.mock('../../../../shared/theme', () => ({
  useTheme: () => ({
    colors: {
      textPrimary: '#FFFFFF',
      textSecondary: '#AAAAAA',
      textMuted: '#777777',
      brandPrimary: '#0066FF',
      surfacePrimary: '#1E1E1E',
      surfaceElevated: '#2A2A2A',
      surfaceElevatedHairline: '#2A2A2A',
      borderSubtle: '#333333',
      error: '#FF0000',
      warning: '#FFAA00',
      success: '#00FF00',
    },
    spacing: { space20: 20 },
    typography: {
      heading: { fontSize: 18 },
      body: { fontSize: 14 },
      caption: { fontSize: 12 },
      numericLarge: { fontSize: 28, fontWeight: '700' },
    },
  }),
  withAlpha: (hex: string, alpha: number) => `rgba(from ${hex} / ${alpha})`,
}));

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

describe('Dashboard Budget Data Flow End-To-End Pipeline', () => {
  const logger = new LoggerAdapter();
  const financialSummaryService = new FinancialSummaryService();
  const budgetHealthService = new BudgetHealthService();
  const categoryBreakdownService = new CategoryBreakdownService();
  const recentActivityService = new RecentActivityService();

  it('proves that category_id IS NULL in budgets generates isOverall: true and renders MonthlyBudgetCard', async () => {
    const mockSupabaseClient: any = {
      from: (table: string) => {
        if (table === 'categories') {
          return { select: () => ({ eq: () => Promise.resolve({ data: [], error: null }), or: () => Promise.resolve({ data: [], error: null }) }) };
        }
        if (table === 'budgets') {
          return {
            select: () => ({
              eq: () => ({
                is: () => Promise.resolve({
                  data: [
                    { id: 'b-overall-1', amount: 2000, category_id: null },
                  ],
                  error: null,
                })
              })
            })
          };
        }
        if (table === 'transactions') {
          return {
            select: () => ({
              eq: () => ({
                gte: () => ({
                  lte: () => Promise.resolve({
                    data: [
                      { id: 't-1', amount: 1400, currency_code: 'INR', occurred_at: new Date().toISOString(), category_id: null, type: 'EXPENSE' }
                    ],
                    error: null
                  })
                })
              })
            })
          };
        }
        return { select: () => ({ eq: () => Promise.resolve({ data: [], error: null }), or: () => Promise.resolve({ data: [], error: null }) }) };
      }
    };

    const repository = new SupabaseDashboardRepository(mockSupabaseClient, logger);
    const useCase = new LoadDashboardUseCase(
      repository,
      logger,
      financialSummaryService,
      budgetHealthService,
      categoryBreakdownService,
      recentActivityService
    );

    const viewModel = await useCase.execute({ userId: 'user-123', correlationId: 'corr-1' });
    const budgetContent = viewModel.budgetHealthSection.content;

    expect(budgetContent).toBeDefined();
    expect(budgetContent).toHaveLength(1);
    expect(budgetContent![0].isOverall).toBe(true);
    expect(budgetContent![0].isDerived).toBe(false);
    expect(budgetContent![0].categoryId).toBeUndefined();
    expect(budgetContent![0].remainingAmount).toBe('₹600.00');

    // Test presentation component output
    const sectionElement = BudgetHealthSection({ viewModel: viewModel.budgetHealthSection, onRetry: vi.fn() });
    const childCard = sectionElement.props.children;
    expect(childCard.type.name).toBe('MonthlyBudgetCard');

    // An explicit Overall Budget must never render the "Estimated" indicator (ADR-025).
    const renderedCard = MonthlyBudgetCard(childCard.props);
    expect(collectTexts(renderedCard)).not.toContain('Estimated from your category budgets');
  });

  it('proves that category-only budgets generate a Derived Overall aggregate + category names, rendered with the Estimated indicator', async () => {
    const mockSupabaseClient: any = {
      from: (table: string) => {
        if (table === 'categories') {
          return {
            select: () => ({
              or: () => Promise.resolve({
                data: [
                  { id: 'cat-1', name: 'Groceries' },
                  { id: 'cat-2', name: 'Utilities' },
                ],
                error: null,
              })
            })
          };
        }
        if (table === 'budgets') {
          return {
            select: () => ({
              eq: () => ({
                is: () => Promise.resolve({
                  data: [
                    { id: 'b-cat-1', amount: 150, category_id: 'cat-1' },
                    { id: 'b-cat-2', amount: 1200, category_id: 'cat-2' },
                  ],
                  error: null,
                })
              })
            })
          };
        }
        if (table === 'transactions') {
          return {
            select: () => ({
              eq: () => ({
                gte: () => ({
                  lte: () => Promise.resolve({
                    data: [
                      { id: 't-2', amount: 1101, currency_code: 'INR', occurred_at: new Date().toISOString(), category_id: 'cat-2', type: 'EXPENSE' }
                    ],
                    error: null
                  })
                })
              })
            })
          };
        }
        return { select: () => ({ eq: () => Promise.resolve({ data: [], error: null }), or: () => Promise.resolve({ data: [], error: null }) }) };
      }
    };

    const repository = new SupabaseDashboardRepository(mockSupabaseClient, logger);
    const useCase = new LoadDashboardUseCase(
      repository,
      logger,
      financialSummaryService,
      budgetHealthService,
      categoryBreakdownService,
      recentActivityService
    );

    const viewModel = await useCase.execute({ userId: 'user-123', correlationId: 'corr-1' });
    const budgetContent = viewModel.budgetHealthSection.content;

    expect(budgetContent).toBeDefined();
    // 1 derived aggregate overall row + 2 category rows = 3 rows total
    expect(budgetContent).toHaveLength(3);
    expect(budgetContent![0].isOverall).toBe(true);
    expect(budgetContent![0].isDerived).toBe(true);
    expect(budgetContent![0].budgetLimit).toBe('₹1,350.00');

    expect(budgetContent![1].categoryName).toBe('Groceries');
    expect(budgetContent![2].categoryName).toBe('Utilities');

    // Test presentation component receives globalBudgetRow (derived aggregate) and renders MonthlyBudgetCard
    const sectionElement = BudgetHealthSection({ viewModel: viewModel.budgetHealthSection, onRetry: vi.fn() });
    const childCard = sectionElement.props.children;
    expect(childCard.type.name).toBe('MonthlyBudgetCard');

    // A Derived Overall must render the "Estimated" indicator so it is never confused with an
    // explicit Overall Budget the user configured (ADR-025).
    const renderedCard = MonthlyBudgetCard(childCard.props);
    expect(collectTexts(renderedCard)).toContain('Estimated from your category budgets');
  });
});
