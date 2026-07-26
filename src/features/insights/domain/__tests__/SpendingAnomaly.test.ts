import { describe, it, expect } from 'vitest';
import { SpendingAnomaly } from '../value-objects/SpendingAnomaly';

describe('SpendingAnomaly Value Object', () => {
  it('creates valid SpendingAnomaly instance with baselinePeriod', () => {
    const anomaly = new SpendingAnomaly({
      transactionId: 'tx-50',
      categoryName: 'Dining',
      expectedAmount: 1000,
      actualAmount: 3500,
      baselinePeriod: 'Last 3 Months Average',
    });

    expect(anomaly.transactionId).toBe('tx-50');
    expect(anomaly.categoryName).toBe('Dining');
    expect(anomaly.expectedAmount).toBe(1000);
    expect(anomaly.actualAmount).toBe(3500);
    expect(anomaly.deviationPercentage).toBe(250);
    expect(anomaly.baselinePeriod).toBe('Last 3 Months Average');
  });

  it('uses default baselinePeriod if omitted', () => {
    const anomaly = new SpendingAnomaly({
      transactionId: 'tx-51',
      categoryName: 'Shopping',
      expectedAmount: 2000,
      actualAmount: 4000,
    });

    expect(anomaly.baselinePeriod).toBe('Rolling 90-Day Average');
  });
});
