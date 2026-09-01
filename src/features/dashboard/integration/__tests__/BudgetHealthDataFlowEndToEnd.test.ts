import { describe, it, expect, vi } from 'vitest';
import { DashboardReadRepository } from '../../application/ports/DashboardReadRepository';
import { DashboardDataSnapshot } from '../../application/models/DashboardDataSnapshot';
import { LoadDashboardUseCase } from '../../application/use-cases/LoadDashboardUseCase';
import { FinancialSummaryService } from '../../domain/services/FinancialSummaryService';
import { BudgetHealthService } from '../../domain/services/BudgetHealthService';
import { CategoryBreakdownService } from '../../domain/services/CategoryBreakdownService';
import { RecentActivityService } from '../../domain/services/RecentActivityService';
import { LoggerAdapter } from '../../infrastructure/services/LoggerAdapter';
import { BudgetHealthSection } from '../../presentation/components/sections/BudgetHealthSection';
import { MonthlyBudgetCard } from '../../presentation/components/sections/MonthlyBudgetCard';
import { MonetaryAmount } from '../../domain/value-objects/MonetaryAmount';
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

class MockDashboardReadRepository implements DashboardReadRepository {
  constructor(private readonly snapshot: DashboardDataSnapshot) {}

  async getDashboardData(_userId: string, _reportingPeriodId?: string): Promise<DashboardDataSnapshot> {
    return this.snapshot;
  }
}

describe('BudgetHealth Data Flow Contract (Mocked Repository)', () => {
  const logger = new LoggerAdapter();
  const financialSummaryService = new FinancialSummaryService();
  const budgetHealthService = new BudgetHealthService();
  const categoryBreakdownService = new CategoryBreakdownService();
  const recentActivityService = new RecentActivityService();

  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  it('preserves explicit overall budget (categoryId === undefined) from repository to ViewModel with isDerived: false and renders MonthlyBudgetCard', async () => {
    const mockSnapshot: DashboardDataSnapshot = {
      activeReportingPeriodId: 'CurrentMonth',
      startDate,
      endDate,
      budgets: [
        {
          id: 'overall-budget-id',
          limit: new MonetaryAmount(5000, 'INR'),
          categoryId: undefined, // category_id IS NULL in Supabase
        },
      ],
      categories: [],
      transactions: [
        {
          id: 'tx-1',
          amount: new MonetaryAmount(3500, 'INR'),
          direction: 'Expense',
          occurredAt: new Date(),
          categoryId: 'cat-any',
          description: 'Spent on items',
        },
      ],
    };

    const repository = new MockDashboardReadRepository(mockSnapshot);
    const useCase = new LoadDashboardUseCase(
      repository,
      logger,
      financialSummaryService,
      budgetHealthService,
      categoryBreakdownService,
      recentActivityService
    );

    const viewModel = await useCase.execute({ userId: 'user-1', correlationId: 'corr-1' });
    const budgetSection = viewModel.budgetHealthSection;

    expect(budgetSection.status).toBe('Loaded');
    expect(budgetSection.content).toHaveLength(1);

    const overallRow = budgetSection.content![0];
    expect(overallRow.isOverall).toBe(true);
    expect(overallRow.isDerived).toBe(false);
    expect(overallRow.categoryId).toBeUndefined();
    expect(overallRow.consumptionRatio).toBe(70);
    expect(overallRow.remainingAmount).toBe('₹1,500.00');

    // Verify presentation component receives globalBudgetRow and selects MonthlyBudgetCard
    const sectionElement = BudgetHealthSection({ viewModel: budgetSection, onRetry: vi.fn() });
    const childCard = sectionElement.props.children;
    expect(childCard.type.name).toBe('MonthlyBudgetCard');

    // Explicit overall must never render the "Estimated" indicator (ADR-025).
    const renderedCard = MonthlyBudgetCard(childCard.props);
    expect(collectTexts(renderedCard)).not.toContain('Estimated from your category budgets');
  });

  it('derives aggregate monthly budget when repository contains only category budgets and maps system category names', async () => {
    const mockSnapshot: DashboardDataSnapshot = {
      activeReportingPeriodId: 'CurrentMonth',
      startDate,
      endDate,
      budgets: [
        {
          id: 'b-1',
          limit: new MonetaryAmount(3000, 'INR'),
          categoryId: 'cat-trans',
        },
        {
          id: 'b-2',
          limit: new MonetaryAmount(2000, 'INR'),
          categoryId: 'cat-food',
        },
        {
          id: 'b-3',
          limit: new MonetaryAmount(150, 'INR'),
          categoryId: 'cat-util',
        },
      ],
      categories: [
        { id: 'cat-trans', name: 'Transportation', displayIcon: 'folder' },
        { id: 'cat-food', name: 'Food & Dining', displayIcon: 'folder' },
        { id: 'cat-util', name: 'Utilities', displayIcon: 'folder' },
      ],
      transactions: [],
    };

    const repository = new MockDashboardReadRepository(mockSnapshot);
    const useCase = new LoadDashboardUseCase(
      repository,
      logger,
      financialSummaryService,
      budgetHealthService,
      categoryBreakdownService,
      recentActivityService
    );

    const viewModel = await useCase.execute({ userId: 'user-1', correlationId: 'corr-2' });
    const budgetSection = viewModel.budgetHealthSection;

    expect(budgetSection.status).toBe('Loaded');
    expect(budgetSection.content).toHaveLength(4);

    // Derived aggregate row
    const derivedRow = budgetSection.content![0];
    expect(derivedRow.isOverall).toBe(true);
    expect(derivedRow.isDerived).toBe(true);
    expect(derivedRow.budgetLimit).toBe('₹5,150.00');
    expect(derivedRow.remainingAmount).toBe('₹5,150.00');
    expect(derivedRow.consumptionRatio).toBe(0);

    // Category rows with mapped names
    expect(budgetSection.content![1].categoryName).toBe('Transportation');
    expect(budgetSection.content![2].categoryName).toBe('Food & Dining');
    expect(budgetSection.content![3].categoryName).toBe('Utilities');

    // Verify presentation component receives globalBudgetRow (derived aggregate) and selects MonthlyBudgetCard
    const sectionElement = BudgetHealthSection({ viewModel: budgetSection, onRetry: vi.fn() });
    const childCard = sectionElement.props.children;
    expect(childCard.type.name).toBe('MonthlyBudgetCard');

    // A Derived Overall must render the "Estimated" indicator (ADR-025).
    const renderedCard = MonthlyBudgetCard(childCard.props);
    expect(collectTexts(renderedCard)).toContain('Estimated from your category budgets');
  });

  it('renders empty state when repository contains empty budgets', async () => {
    const mockSnapshot: DashboardDataSnapshot = {
      activeReportingPeriodId: 'CurrentMonth',
      startDate,
      endDate,
      budgets: [],
      categories: [],
      transactions: [],
    };

    const repository = new MockDashboardReadRepository(mockSnapshot);
    const useCase = new LoadDashboardUseCase(
      repository,
      logger,
      financialSummaryService,
      budgetHealthService,
      categoryBreakdownService,
      recentActivityService
    );

    const viewModel = await useCase.execute({ userId: 'user-1', correlationId: 'corr-3' });
    const budgetSection = viewModel.budgetHealthSection;

    expect(budgetSection.status).toBe('Empty');
    expect(budgetSection.isEmpty).toBe(true);
    expect(budgetSection.content).toBeNull();

    // Verify presentation component renders EmptyState card
    const sectionElement = BudgetHealthSection({ viewModel: budgetSection, onRetry: vi.fn() });
    const childCard = sectionElement.props.children;
    expect(childCard.props.variant).toBe('elevated');
    const emptyContainer = childCard.props.children[1];
    const emptyStateChild = emptyContainer.props.children[0];
    expect(emptyStateChild.props.message).toBe('No active budgets configured for this period.');
  });
});
