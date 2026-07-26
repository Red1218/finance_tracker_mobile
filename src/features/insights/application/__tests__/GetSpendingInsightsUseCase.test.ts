import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetSpendingInsightsUseCase } from '../use-cases/GetSpendingInsightsUseCase';
import { Insight, InsightType, InsightSeverity, InsightSource, ConfidenceScore } from '../../domain';
import { Result } from '../../../../platform/persistence';

describe('GetSpendingInsightsUseCase', () => {
  let mockReportingRepo: any;
  let mockAIProvider: any;
  let mockInsightsRepo: any;
  let useCase: GetSpendingInsightsUseCase;

  beforeEach(() => {
    mockReportingRepo = {
      getDashboardSummary: vi.fn().mockResolvedValue(
        Result.success({
          totalIncome: 100000,
          totalExpenses: 40000,
          netCashFlow: 60000,
          savingsRate: 60,
          transactionCount: 10,
        })
      ),
      getCategoryBreakdown: vi.fn().mockResolvedValue(Result.success([])),
    };

    const testInsight = new Insight({
      id: 'ins-1',
      type: InsightType.SAVINGS_OPPORTUNITY,
      severity: InsightSeverity.HIGH,
      source: InsightSource.AI_MODEL,
      title: 'High Savings Potential',
      description: 'You saved 60% of your income this month.',
      confidenceScore: new ConfidenceScore(0.95),
    });

    mockAIProvider = {
      generateInsights: vi.fn().mockResolvedValue([testInsight]),
    };

    let items: Insight[] = [];
    mockInsightsRepo = {
      getInsights: vi.fn().mockImplementation(async () => items),
      saveInsight: vi.fn().mockImplementation(async (i: Insight) => {
        items.push(i);
      }),
    };

    useCase = new GetSpendingInsightsUseCase(
      mockReportingRepo,
      mockAIProvider,
      mockInsightsRepo
    );
  });

  it('fetches projections from Reporting, triggers AI insights generation, and returns DTOs', async () => {
    const dtos = await useCase.execute();

    expect(dtos).toHaveLength(1);
    expect(dtos[0].id).toBe('ins-1');
    expect(dtos[0].confidencePercentage).toBe(95);
    expect(dtos[0].title).toBe('High Savings Potential');
    expect(mockAIProvider.generateInsights).toHaveBeenCalledTimes(1);
  });
});
