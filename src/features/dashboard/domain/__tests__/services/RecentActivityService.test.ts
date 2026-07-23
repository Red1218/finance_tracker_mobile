import { describe, it, expect } from 'vitest';
import { RecentActivityService } from '../../services/RecentActivityService';
import { TransactionSnapshot } from '../../snapshots/TransactionSnapshot';
import { MonetaryAmount } from '../../value-objects/MonetaryAmount';

describe('RecentActivityService', () => {
  it('should return recent transactions sorted by date descending, up to the limit', () => {
    const service = new RecentActivityService();
    
    const transactions: TransactionSnapshot[] = [
      { id: '1', amount: new MonetaryAmount(100, 'USD'), direction: 'Expense', occurredAt: new Date('2026-07-01'), categoryId: 'cat1', description: '' },
      { id: '2', amount: new MonetaryAmount(200, 'USD'), direction: 'Expense', occurredAt: new Date('2026-07-10'), categoryId: 'cat1', description: '' },
      { id: '3', amount: new MonetaryAmount(300, 'USD'), direction: 'Expense', occurredAt: new Date('2026-07-05'), categoryId: 'cat1', description: '' },
    ];

    const recent = service.getRecentActivity(transactions, 2);

    expect(recent.length).toBe(2);
    // Should be id 2 (July 10) and then id 3 (July 5)
    expect(recent[0].id).toBe('2');
    expect(recent[1].id).toBe('3');
  });
});
