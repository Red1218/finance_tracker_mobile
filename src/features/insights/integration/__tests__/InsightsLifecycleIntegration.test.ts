import { describe, it, expect, beforeEach } from 'vitest';
import { InsightsModule } from '../../composition/InsightsModule';
import { RuleBasedAIInsightsProvider } from '../../infrastructure/providers/RuleBasedAIInsightsProvider';
import { InMemoryInsightsReadRepository } from '../../../../platform/persistence/insights';
import { Result } from '../../../../platform/persistence';
import { IReportingRepository, MonthOverMonthComparison } from '../../../reporting/domain';

class MockReportingRepository implements IReportingRepository {
  public async getDashboardSummary() {
    return Result.success({
      totalIncome: 100000,
      totalExpenses: 85000,
      netCashFlow: 15000,
      savingsRate: 15,
      transactionCount: 12,
    });
  }

  public async getCategoryBreakdown() {
    return Result.success([
      {
        categoryId: 'cat-1',
        categoryName: 'Dining',
        amount: 40000,
        percentage: 47,
        transactionCount: 8,
      },
    ]);
  }

  public async getMonthlyTrend() {
    return Result.success({
      points: [
        { period: '2026-05', income: 100000, expenses: 60000, netCashFlow: 40000 },
        { period: '2026-06', income: 120000, expenses: 70000, netCashFlow: 50000 },
      ],
    });
  }

  public async getCategoryTrends() {
    return Result.success({ categoryId: 'cat-1', categoryName: 'Dining', points: [] });
  }

  public async getPeriodComparison() {
    return Result.success({
      currentPeriodSummary: { totalIncome: 0, totalExpenses: 0, netCashFlow: 0, savingsRate: 0, transactionCount: 0 },
      previousPeriodSummary: { totalIncome: 0, totalExpenses: 0, netCashFlow: 0, savingsRate: 0, transactionCount: 0 },
      incomeChangePercentage: 0,
      expenseChangePercentage: 0,
      netCashFlowChangePercentage: 0,
    });
  }

  public async getBudgetPerformance() {
    return Result.success([]);
  }

  public async getLargestTransactions() {
    return Result.success([]);
  }

  public async getMonthOverMonthComparison() {
    return Result.success(
      new MonthOverMonthComparison({
        currentIncome: 10000,
        currentExpense: 6000,
        currentNetSavings: 4000,
        previousIncome: 8000,
        previousExpense: 5000,
        previousNetSavings: 3000,
      })
    );
  }

  public async getFilteredLedgerRows() {
    return Result.success([]);
  }
}

describe('AI Insights — End-to-End Lifecycle Integration', () => {
  let insightsRepo: InMemoryInsightsReadRepository;
  let ruleProvider: RuleBasedAIInsightsProvider;
  let mockReportingRepo: MockReportingRepository;
  let insightsModule: InsightsModule;

  beforeEach(() => {
    insightsRepo = new InMemoryInsightsReadRepository();
    ruleProvider = new RuleBasedAIInsightsProvider();
    mockReportingRepo = new MockReportingRepository();
    insightsModule = new InsightsModule(insightsRepo, ruleProvider, mockReportingRepo);
  });

  it('executes complete AI Insights pipeline from reporting projections to presentation state', async () => {
    // 1. Initial State: Empty Insights
    expect(insightsModule.insightsController.getState().viewModel.insights).toHaveLength(0);

    // 2. Load All Insights & Forecasts
    await insightsModule.insightsController.loadAll();

    const state = insightsModule.insightsController.getState();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();

    // 3. Verify Generated Insights
    expect(state.viewModel.insights.length).toBeGreaterThan(0);
    const firstCard = state.viewModel.insights[0];
    expect(firstCard.id).toBeDefined();
    expect(firstCard.confidencePercentage).toBe(95);

    // 4. Verify Generated Cash Flow Forecast
    const forecast = state.viewModel.forecast;
    expect(forecast).not.toBeNull();
    expect(forecast?.confidencePercentage).toBe(85);

    // 5. Dismiss Insight Workflow
    const targetId = firstCard.id;
    const dismissSuccess = await insightsModule.insightsController.dismissInsight(targetId);
    expect(dismissSuccess).toBe(true);

    const remainingInsights = insightsModule.insightsController.getState().viewModel.insights;
    expect(remainingInsights.find((i) => i.id === targetId)).toBeUndefined();
  });
});
