import { describe, it, expect } from 'vitest';
import { InsightsViewModelMapper } from '../mappers/InsightsViewModelMapper';

describe('InsightsViewModelMapper', () => {
  it('maps InsightDTO into InsightCardViewModel cleanly', () => {
    const cardVm = InsightsViewModelMapper.toInsightCardViewModel({
      id: 'ins-1',
      type: 'ANOMALY_DETECTION',
      severity: 'HIGH',
      source: 'AI_MODEL',
      title: 'High Dining Spend',
      description: 'Dining out is 250% higher than average.',
      recommendationText: 'Set a dining cap of ₹5,000.',
      recommendationActionUrl: null,
      confidenceScore: 0.92,
      confidencePercentage: 92,
      generatedAt: '2026-07-26T10:00:00.000Z',
      isDismissed: false,
    });

    expect(cardVm.id).toBe('ins-1');
    expect(cardVm.severityColor).toBe('red');
    expect(cardVm.sourceLabel).toBe('Gemini AI');
    expect(cardVm.confidencePercentage).toBe(92);
  });

  it('maps CashFlowForecastDTO into CashFlowForecastViewModel cleanly', () => {
    const forecastVm = InsightsViewModelMapper.toCashFlowForecastViewModel({
      predictedIncome: 120000,
      predictedExpense: 75000,
      projectedSavings: 45000,
      confidenceScore: 0.88,
      confidencePercentage: 88,
      startDate: '2026-08-01',
      endDate: '2026-08-31',
    });

    expect(forecastVm.formattedPredictedIncome).toContain('1,20,000');
    expect(forecastVm.formattedProjectedSavings).toContain('45,000');
    expect(forecastVm.isPositiveSavings).toBe(true);
    expect(forecastVm.confidencePercentage).toBe(88);
  });
});
