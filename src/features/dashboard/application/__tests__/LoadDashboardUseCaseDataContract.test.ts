import { describe, it, expect, vi } from 'vitest';
import { LoadDashboardUseCase } from '../use-cases/LoadDashboardUseCase';
import { DashboardReadRepository } from '../ports/DashboardReadRepository';
import { Logger } from '../ports/Logger';
import { FinancialSummaryService } from '../../domain/services/FinancialSummaryService';
import { BudgetHealthService } from '../../domain/services/BudgetHealthService';
import { CategoryBreakdownService } from '../../domain/services/CategoryBreakdownService';
import { RecentActivityService } from '../../domain/services/RecentActivityService';
import { MonetaryAmount } from '../../domain/value-objects/MonetaryAmount';
import { DashboardDataSnapshot } from '../models/DashboardDataSnapshot';

describe('LoadDashboardUseCase Data Contract & Currency Regression Tests', () => {
  const mockLogger: Logger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };

  const mockSnapshot: DashboardDataSnapshot = {
    activeReportingPeriodId: 'CurrentMonth',
    startDate: new Date('2026-08-01T00:00:00Z'),
    endDate: new Date('2026-08-31T23:59:59Z'),
    budgets: [],
    categories: [{ id: 'cat-1', name: 'Salary', displayIcon: 'wallet' }],
    transactions: [
      {
        id: 'tx-income',
        amount: new MonetaryAmount(50000, 'INR'),
        direction: 'Income',
        occurredAt: new Date('2026-08-05'),
        categoryId: 'cat-1',
        description: 'Monthly Salary',
      },
      {
        id: 'tx-expense',
        amount: new MonetaryAmount(15000, 'INR'),
        direction: 'Expense',
        occurredAt: new Date('2026-08-10'),
        categoryId: 'cat-1',
        description: 'Groceries',
      },
    ],
  };

  const mockRepo: DashboardReadRepository = {
    getDashboardData: vi.fn().mockResolvedValue(mockSnapshot),
  };

  const financialSummaryService = new FinancialSummaryService();
  const budgetHealthService = new BudgetHealthService();
  const categoryBreakdownService = new CategoryBreakdownService();
  const recentActivityService = new RecentActivityService();

  it('calculates dashboard metrics using INR currency formatting and includes both income and expense transactions', async () => {
    const useCase = new LoadDashboardUseCase(
      mockRepo,
      mockLogger,
      financialSummaryService,
      budgetHealthService,
      categoryBreakdownService,
      recentActivityService
    );

    const result = await useCase.execute({
      correlationId: 'test-corr-1',
      userId: 'user-777',
      reportingPeriodId: 'CurrentMonth',
    });

    expect(result.kpiSection.status).toBe('Loaded');
    expect(result.kpiSection.content).not.toBeNull();

    const kpiContent = result.kpiSection.content!;
    // INR Intl format produces ₹ symbols
    expect(kpiContent.periodIncome).toContain('50,000');
    expect(kpiContent.periodExpenses).toContain('15,000');
    expect(kpiContent.netForPeriod).toContain('35,000');
  });
});
