import { describe, it, expect } from 'vitest';
import { BudgetHealthStatus } from '../../value-objects/BudgetHealthStatus';
import { MonetaryAmount } from '../../value-objects/MonetaryAmount';

describe('BudgetHealthStatus', () => {
  it('should return OnTrack if consumption is <= 80%', () => {
    const consumed = new MonetaryAmount(80, 'USD');
    const limit = new MonetaryAmount(100, 'USD');
    const health = new BudgetHealthStatus('Explicit', consumed, limit, undefined, 'budget1');

    expect(health.status).toBe('OnTrack');
    expect(health.consumptionRatio).toBe(80);
  });

  it('should return AtRisk if consumption is > 80% and <= 100%', () => {
    const consumed = new MonetaryAmount(90, 'USD');
    const limit = new MonetaryAmount(100, 'USD');
    const health = new BudgetHealthStatus('Explicit', consumed, limit, undefined, 'budget1');

    expect(health.status).toBe('AtRisk');
    expect(health.consumptionRatio).toBe(90);
  });

  it('should return OverBudget if consumption is > 100%', () => {
    const consumed = new MonetaryAmount(110, 'USD');
    const limit = new MonetaryAmount(100, 'USD');
    const health = new BudgetHealthStatus('Explicit', consumed, limit, undefined, 'budget1');

    expect(health.status).toBe('OverBudget');
    expect(health.consumptionRatio).toBeCloseTo(110);
  });

  it('should throw if currencies do not match', () => {
    const consumed = new MonetaryAmount(50, 'USD');
    const limit = new MonetaryAmount(100, 'EUR');
    expect(() => new BudgetHealthStatus('Explicit', consumed, limit, undefined, 'budget1')).toThrow(
      'Currencies must match to calculate budget health'
    );
  });

  it('should throw if limit is zero or negative', () => {
    const consumed = new MonetaryAmount(50, 'USD');
    const limit = new MonetaryAmount(0, 'USD');
    expect(() => new BudgetHealthStatus('Explicit', consumed, limit, undefined, 'budget1')).toThrow(
      'Budget limit must be greater than zero'
    );
  });

  it('should carry a real budgetId when source is Explicit', () => {
    const consumed = new MonetaryAmount(50, 'USD');
    const limit = new MonetaryAmount(100, 'USD');
    const explicitHealth = new BudgetHealthStatus('Explicit', consumed, limit, undefined, 'budget1');

    expect(explicitHealth.source).toBe('Explicit');
    expect(explicitHealth.budgetId).toBe('budget1');
  });

  it('should have an absent budgetId when source is Derived', () => {
    const consumed = new MonetaryAmount(50, 'USD');
    const limit = new MonetaryAmount(100, 'USD');
    const derivedHealth = new BudgetHealthStatus('Derived', consumed, limit);

    expect(derivedHealth.source).toBe('Derived');
    expect(derivedHealth.budgetId).toBeUndefined();
  });

  it('should throw if a Derived status is constructed with a budgetId (ADR-025 identity invariant)', () => {
    const consumed = new MonetaryAmount(50, 'USD');
    const limit = new MonetaryAmount(100, 'USD');

    expect(
      () => new BudgetHealthStatus('Derived', consumed, limit, undefined, 'should-not-exist')
    ).toThrow('A derived BudgetHealthStatus must not carry a persisted budgetId');
  });
});
