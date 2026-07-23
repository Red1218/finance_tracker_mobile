import { describe, it, expect } from 'vitest';
import { BudgetHealthStatus } from '../../value-objects/BudgetHealthStatus';
import { MonetaryAmount } from '../../value-objects/MonetaryAmount';

describe('BudgetHealthStatus', () => {
  it('should return OnTrack if consumption is <= 80%', () => {
    const consumed = new MonetaryAmount(80, 'USD');
    const limit = new MonetaryAmount(100, 'USD');
    const health = new BudgetHealthStatus('budget1', consumed, limit);

    expect(health.status).toBe('OnTrack');
    expect(health.consumptionRatio).toBe(80);
  });

  it('should return AtRisk if consumption is > 80% and <= 100%', () => {
    const consumed = new MonetaryAmount(90, 'USD');
    const limit = new MonetaryAmount(100, 'USD');
    const health = new BudgetHealthStatus('budget1', consumed, limit);

    expect(health.status).toBe('AtRisk');
    expect(health.consumptionRatio).toBe(90);
  });

  it('should return OverBudget if consumption is > 100%', () => {
    const consumed = new MonetaryAmount(110, 'USD');
    const limit = new MonetaryAmount(100, 'USD');
    const health = new BudgetHealthStatus('budget1', consumed, limit);

    expect(health.status).toBe('OverBudget');
    expect(health.consumptionRatio).toBeCloseTo(110);
  });

  it('should throw if currencies do not match', () => {
    const consumed = new MonetaryAmount(50, 'USD');
    const limit = new MonetaryAmount(100, 'EUR');
    expect(() => new BudgetHealthStatus('budget1', consumed, limit)).toThrow('Currencies must match to calculate budget health');
  });

  it('should throw if limit is zero or negative', () => {
    const consumed = new MonetaryAmount(50, 'USD');
    const limit = new MonetaryAmount(0, 'USD');
    expect(() => new BudgetHealthStatus('budget1', consumed, limit)).toThrow('Budget limit must be greater than zero');
  });
});
