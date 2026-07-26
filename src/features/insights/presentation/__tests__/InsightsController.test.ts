import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InsightsController } from '../controllers/InsightsController';

describe('InsightsController', () => {
  let mockGetSpendingInsights: any;
  let mockGetCashFlowForecast: any;
  let mockDismissInsight: any;
  let controller: InsightsController;

  beforeEach(() => {
    mockGetSpendingInsights = {
      execute: vi.fn().mockResolvedValue([
        {
          id: 'ins-10',
          type: 'SAVINGS_OPPORTUNITY',
          severity: 'LOW',
          source: 'RULE_ENGINE',
          title: 'Good Savings',
          description: 'You saved 30%.',
          recommendationText: 'Keep going.',
          recommendationActionUrl: null,
          confidenceScore: 0.9,
          confidencePercentage: 90,
          generatedAt: '2026-07-26T10:00:00.000Z',
          isDismissed: false,
        },
      ]),
    };
    mockGetCashFlowForecast = {
      execute: vi.fn().mockResolvedValue({
        predictedIncome: 100000,
        predictedExpense: 60000,
        projectedSavings: 40000,
        confidenceScore: 0.85,
        confidencePercentage: 85,
        startDate: '2026-08-01',
        endDate: '2026-08-31',
      }),
    };
    mockDismissInsight = {
      execute: vi.fn().mockResolvedValue(true),
    };

    controller = new InsightsController(
      mockGetSpendingInsights,
      mockGetCashFlowForecast,
      mockDismissInsight
    );
  });

  it('loads insights and forecast state into reactive viewModel', async () => {
    await controller.loadAll();
    const state = controller.getState();

    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.viewModel.insights).toHaveLength(1);
    expect(state.viewModel.forecast?.confidencePercentage).toBe(85);
  });

  it('handles dismissal and reloads active insights', async () => {
    const success = await controller.dismissInsight('ins-10');

    expect(success).toBe(true);
    expect(mockDismissInsight.execute).toHaveBeenCalledWith('ins-10');
  });
});
