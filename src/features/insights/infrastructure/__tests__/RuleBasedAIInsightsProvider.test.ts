import { describe, it, expect, beforeEach } from 'vitest';
import { RuleBasedAIInsightsProvider } from '../providers/RuleBasedAIInsightsProvider';
import { InsightType, InsightSeverity } from '../../domain';

describe('RuleBasedAIInsightsProvider', () => {
  let provider: RuleBasedAIInsightsProvider;

  beforeEach(() => {
    provider = new RuleBasedAIInsightsProvider();
  });

  it('generates high severity savings opportunity insight when savings rate < 20%', async () => {
    const summary = {
      totalIncome: 100000,
      totalExpenses: 85000,
      netCashFlow: 15000,
      savingsRate: 15,
      transactionCount: 12,
    };

    const insights = await provider.generateInsights(summary, []);

    expect(insights.length).toBeGreaterThan(0);
    const savingsInsight = insights.find((i) => i.type === InsightType.SAVINGS_OPPORTUNITY);
    expect(savingsInsight).toBeDefined();
    expect(savingsInsight?.severity).toBe(InsightSeverity.HIGH);
  });

  it('generates cash flow forecast cleanly from monthly trends', async () => {
    const monthlyTrends = [
      { period: '2026-05', income: 100000, expenses: 60000, netCashFlow: 40000 },
      { period: '2026-06', income: 120000, expenses: 70000, netCashFlow: 50000 },
    ];

    const forecast = await provider.generateForecast(monthlyTrends);

    expect(forecast.predictedIncome).toBe(110000);
    expect(forecast.predictedExpense).toBe(65000);
    expect(forecast.projectedSavings).toBe(45000);
  });
});
