import { describe, it, expect } from 'vitest';
import { BudgetHealthService } from '../../services/BudgetHealthService';
import { BudgetSnapshot } from '../../snapshots/BudgetSnapshot';
import { TransactionSnapshot } from '../../snapshots/TransactionSnapshot';
import { MonetaryAmount } from '../../value-objects/MonetaryAmount';
import { ReportingPeriod } from '../../value-objects/ReportingPeriod';

describe('BudgetHealthService', () => {
  it('should calculate budget health correctly for specific category and global budgets', () => {
    const service = new BudgetHealthService();
    const period = new ReportingPeriod('CurrentMonth', new Date('2026-07-01'), new Date('2026-07-31'));

    const budgets: BudgetSnapshot[] = [
      { id: 'b1', limit: new MonetaryAmount(500, 'USD'), categoryId: 'cat1' }, // Specific
      { id: 'b2', limit: new MonetaryAmount(1000, 'USD') }, // Global
    ];

    const transactions: TransactionSnapshot[] = [
      { id: '1', amount: new MonetaryAmount(400, 'USD'), direction: 'Expense', occurredAt: new Date('2026-07-10'), categoryId: 'cat1', description: 'Groceries' }, // In period, cat1
      { id: '2', amount: new MonetaryAmount(200, 'USD'), direction: 'Expense', occurredAt: new Date('2026-07-15'), categoryId: 'cat2', description: 'Dining' }, // In period, cat2
      { id: '3', amount: new MonetaryAmount(100, 'USD'), direction: 'Expense', occurredAt: new Date('2026-06-15'), categoryId: 'cat1', description: 'Old' }, // Out of period
      { id: '4', amount: new MonetaryAmount(500, 'USD'), direction: 'Income', occurredAt: new Date('2026-07-20'), categoryId: 'cat1', description: 'Income' }, // Ignored (Income)
    ];

    const statuses = service.calculateStatus(budgets, transactions, period);

    expect(statuses.length).toBe(2);
    
    // Budget 1 (cat1 limit 500, consumed 400 = 80%)
    expect(statuses[0].budgetId).toBe('b1');
    expect(statuses[0].amountConsumed.amount).toBe(400);
    expect(statuses[0].status).toBe('OnTrack');

    // Budget 2 (global limit 1000, consumed 400 + 200 = 600 = 60%)
    expect(statuses[1].budgetId).toBe('b2');
    expect(statuses[1].amountConsumed.amount).toBe(600);
    expect(statuses[1].status).toBe('OnTrack');
  });

  it('should throw if currency mismatch', () => {
    const service = new BudgetHealthService();
    const period = new ReportingPeriod('CurrentMonth', new Date('2026-07-01'), new Date('2026-07-31'));

    const budgets: BudgetSnapshot[] = [
      { id: 'b1', limit: new MonetaryAmount(500, 'USD'), categoryId: 'cat1' },
    ];
    
    const transactions: TransactionSnapshot[] = [
      { id: '1', amount: new MonetaryAmount(400, 'EUR'), direction: 'Expense', occurredAt: new Date('2026-07-10'), categoryId: 'cat1', description: 'Groceries' },
    ];

    expect(() => service.calculateStatus(budgets, transactions, period)).toThrow('Transaction currency must match budget currency');
  });
});
