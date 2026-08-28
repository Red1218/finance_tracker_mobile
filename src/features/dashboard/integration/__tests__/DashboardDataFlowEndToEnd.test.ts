import { describe, it, expect, vi } from 'vitest';
import { SupabaseDashboardRepository } from '../../infrastructure/repositories/SupabaseDashboardRepository';
import { LoadDashboardUseCase } from '../../application/use-cases/LoadDashboardUseCase';
import { FinancialSummaryService } from '../../domain/services/FinancialSummaryService';
import { BudgetHealthService } from '../../domain/services/BudgetHealthService';
import { CategoryBreakdownService } from '../../domain/services/CategoryBreakdownService';
import { RecentActivityService } from '../../domain/services/RecentActivityService';
import { LoggerAdapter } from '../../infrastructure/services/LoggerAdapter';
import { BudgetHealthSection } from '../../presentation/components/sections/BudgetHealthSection';
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
      brandPrimary: '#0066FF',
      surfacePrimary: '#1E1E1E',
      surfaceElevated: '#2A2A2A',
      borderSubtle: '#333333',
    },
    typography: {
      heading: { fontSize: 18 },
      body: { fontSize: 14 },
    },
  }),
}));

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
          return { select: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }) };
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
        return { select: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }) };
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
    expect(budgetContent![0].categoryId).toBeUndefined();
    expect(budgetContent![0].remainingAmount).toBe('₹600.00');

    // Test presentation component output
    const sectionElement = BudgetHealthSection({ viewModel: viewModel.budgetHealthSection, onRetry: vi.fn() });
    const childCard = sectionElement.props.children;
    expect(childCard.type.name).toBe('MonthlyBudgetCard');
  });

  it('proves that category-only budgets generate category linear list (no false aggregate card)', async () => {
    const mockSupabaseClient: any = {
      from: (table: string) => {
        if (table === 'categories') {
          return { select: () => ({ eq: () => Promise.resolve({ data: [{ id: 'cat-1', name: 'Groceries' }, { id: 'cat-2', name: 'Utilities' }], error: null }) }) };
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
        return { select: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }) };
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
    expect(budgetContent).toHaveLength(2);
    expect(budgetContent![0].isOverall).toBe(false);
    expect(budgetContent![1].isOverall).toBe(false);

    // Test presentation component output
    const sectionElement = BudgetHealthSection({ viewModel: viewModel.budgetHealthSection, onRetry: vi.fn() });
    const childCard = sectionElement.props.children;
    expect(childCard.type.name).not.toBe('MonthlyBudgetCard');
    expect(childCard.props.variant).toBe('elevated');
  });
});
