import { describe, it, expect } from 'vitest';
import { CategoryBreakdownService } from '../../services/CategoryBreakdownService';
import { CategorySnapshot } from '../../snapshots/CategorySnapshot';
import { TransactionSnapshot } from '../../snapshots/TransactionSnapshot';
import { MonetaryAmount } from '../../value-objects/MonetaryAmount';
import { ReportingPeriod } from '../../value-objects/ReportingPeriod';

describe('CategoryBreakdownService', () => {
  it('should calculate breakdown, rank them, sum proportions to 100%, and ignore zero-spend', () => {
    const service = new CategoryBreakdownService();
    const period = new ReportingPeriod('CurrentMonth', new Date('2026-07-01'), new Date('2026-07-31'));
    
    const categories: CategorySnapshot[] = [
      { id: 'cat1', name: 'Groceries', displayIcon: 'icon1' },
      { id: 'cat2', name: 'Dining', displayIcon: 'icon2' },
      { id: 'cat3', name: 'ZeroSpend', displayIcon: 'icon3' },
    ];

    const transactions: TransactionSnapshot[] = [
      { id: '1', amount: new MonetaryAmount(100, 'USD'), direction: 'Expense', occurredAt: new Date('2026-07-10'), categoryId: 'cat1', description: '' },
      { id: '2', amount: new MonetaryAmount(200, 'USD'), direction: 'Expense', occurredAt: new Date('2026-07-12'), categoryId: 'cat2', description: '' },
      { id: '3', amount: new MonetaryAmount(100, 'USD'), direction: 'Expense', occurredAt: new Date('2026-06-15'), categoryId: 'cat3', description: '' }, // Out of period
    ];

    const breakdown = service.calculateBreakdown(categories, transactions, period, 'USD');

    // cat3 should be ignored (INV-006)
    expect(breakdown.length).toBe(2);

    // Rank 1: cat2 (200)
    expect(breakdown[0].categoryId).toBe('cat2');
    expect(breakdown[0].totalAmountSpent.amount).toBe(200);
    expect(breakdown[0].rank).toBe(1);

    // Rank 2: cat1 (100)
    expect(breakdown[1].categoryId).toBe('cat1');
    expect(breakdown[1].totalAmountSpent.amount).toBe(100);
    expect(breakdown[1].rank).toBe(2);

    // INV-007: Proportions sum to 100
    const sum = breakdown[0].proportionOfTotalSpending + breakdown[1].proportionOfTotalSpending;
    expect(sum).toBe(100);
  });
});
