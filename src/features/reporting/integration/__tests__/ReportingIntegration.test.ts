import { describe, it, expect, beforeEach } from 'vitest';
import { ReportingModule } from '../../composition/ReportingModule';
import { ReportingPeriod, DashboardSummary, CategoryBreakdown, MonthlyTrendPoint, BudgetPerformance, LargestTransaction } from '../../domain';
import { RepositoryResult, RepositoryError, Result } from '../../../../platform/persistence';

class InMemoryReportingRepository {
  public async getDashboardSummary(
    period: ReportingPeriod
  ): Promise<RepositoryResult<DashboardSummary, RepositoryError>> {
    return Result.success({
      totalIncome: 120000,
      totalExpenses: 70000,
      netCashFlow: 50000,
      savingsRate: 41.67,
      transactionCount: 15,
    });
  }

  public async getCategoryBreakdown(): Promise<RepositoryResult<CategoryBreakdown[], RepositoryError>> {
    return Result.success([
      {
        categoryId: 'cat-1',
        categoryName: 'Groceries',
        amount: 30000,
        percentage: 42.86,
        transactionCount: 8,
      },
      {
        categoryId: 'cat-2',
        categoryName: 'Utilities',
        amount: 40000,
        percentage: 57.14,
        transactionCount: 7,
      },
    ]);
  }

  public async getMonthlyTrend(): Promise<RepositoryResult<{ points: MonthlyTrendPoint[] }, RepositoryError>> {
    return Result.success({
      points: [
        {
          period: '2026-05',
          income: 100000,
          expenses: 60000,
          netCashFlow: 40000,
        },
        {
          period: '2026-06',
          income: 120000,
          expenses: 70000,
          netCashFlow: 50000,
        },
      ],
    });
  }

  public async getBudgetPerformance(): Promise<RepositoryResult<BudgetPerformance[], RepositoryError>> {
    return Result.success([]);
  }

  public async getLargestTransactions(): Promise<RepositoryResult<LargestTransaction[], RepositoryError>> {
    return Result.success([]);
  }
}

describe('Reporting & Analytics — End-to-End Integration Test', () => {
  let module: ReportingModule;

  beforeEach(() => {
    const repo = new InMemoryReportingRepository();
    module = new ReportingModule(repo as any);
  });

  it('executes full reporting pipeline from repository projection to presentation state', async () => {
    // 1. Trigger initial report load
    await module.reportingController.loadReports();

    const state = module.reportingController.getState();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();

    // 2. Verify Financial Summary Projection
    const summary = state.viewModel.financialSummary;
    expect(summary).not.toBeNull();
    expect(summary?.savingsRatePercentage).toBe(41.67);
    expect(summary?.isPositiveSavings).toBe(true);

    // 3. Verify Category Breakdown Projection
    expect(state.viewModel.categoryBreakdown).toHaveLength(2);
    expect(state.viewModel.categoryBreakdown[0].categoryName).toBe('Groceries');
    expect(state.viewModel.categoryBreakdown[0].percentage).toBe(42.9);

    // 4. Verify Monthly Trend Projection
    expect(state.viewModel.monthlyTrend).toHaveLength(2);
    expect(state.viewModel.monthlyTrend[1].periodLabel).toBe('2026-06');

    // 5. Test Period Change
    await module.reportingController.changePeriod(ReportingPeriod.YEAR);
    expect(module.reportingController.getState().selectedPeriod).toBe(ReportingPeriod.YEAR);
  });
});
