import { describe, it, expect } from 'vitest';
import { CashFlowForecast } from '../value-objects/CashFlowForecast';
import { ConfidenceScore } from '../value-objects/ConfidenceScore';

describe('CashFlowForecast Value Object', () => {
  it('creates valid CashFlowForecast and computes projectedSavings', () => {
    const forecast = new CashFlowForecast({
      predictedIncome: 150000,
      predictedExpense: 90000,
      confidenceScore: new ConfidenceScore(0.9),
      startDate: new Date('2026-08-01'),
      endDate: new Date('2026-08-31'),
    });

    expect(forecast.predictedIncome).toBe(150000);
    expect(forecast.predictedExpense).toBe(90000);
    expect(forecast.projectedSavings).toBe(60000);
    expect(forecast.confidenceScore.score).toBe(0.9);
  });
});
