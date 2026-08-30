import { describe, it, expect } from 'vitest';
import { BudgetHealthService } from '../../services/BudgetHealthService';
import { BudgetSnapshot } from '../../snapshots/BudgetSnapshot';
import { TransactionSnapshot } from '../../snapshots/TransactionSnapshot';
import { MonetaryAmount } from '../../value-objects/MonetaryAmount';
import { ReportingPeriod } from '../../value-objects/ReportingPeriod';

describe('BudgetHealthService', () => {
  it('should calculate budget health correctly for specific category and explicit overall budgets', () => {
    const service = new BudgetHealthService();
    const period = new ReportingPeriod('CurrentMonth', new Date('2026-07-01'), new Date('2026-07-31'));

    const budgets: BudgetSnapshot[] = [
      { id: 'b1', limit: new MonetaryAmount(500, 'USD'), categoryId: 'cat1' }, // Specific
      { id: 'b2', limit: new MonetaryAmount(1000, 'USD') }, // Explicit overall
    ];

    const transactions: TransactionSnapshot[] = [
      { id: '1', amount: new MonetaryAmount(400, 'USD'), direction: 'Expense', occurredAt: new Date('2026-07-10'), categoryId: 'cat1', description: 'Groceries' }, // In period, cat1
      { id: '2', amount: new MonetaryAmount(200, 'USD'), direction: 'Expense', occurredAt: new Date('2026-07-15'), categoryId: 'cat2', description: 'Dining' }, // In period, cat2
      { id: '3', amount: new MonetaryAmount(100, 'USD'), direction: 'Expense', occurredAt: new Date('2026-06-15'), categoryId: 'cat1', description: 'Old' }, // Out of period
      { id: '4', amount: new MonetaryAmount(500, 'USD'), direction: 'Income', occurredAt: new Date('2026-07-20'), categoryId: 'cat1', description: 'Income' }, // Ignored (Income)
    ];

    const statuses = service.calculateStatus(budgets, transactions, period);

    // Explicit overall present -> no Derived Overall is synthesized (ADR-025 precedence rule).
    expect(statuses.length).toBe(2);

    // Budget 1 (cat1 limit 500, consumed 400 = 80%)
    expect(statuses[0].source).toBe('Explicit');
    expect(statuses[0].budgetId).toBe('b1');
    expect(statuses[0].amountConsumed.amount).toBe(400);
    expect(statuses[0].status).toBe('OnTrack');

    // Budget 2 (explicit overall limit 1000, consumed 400 + 200 = 600 = 60%)
    expect(statuses[1].source).toBe('Explicit');
    expect(statuses[1].budgetId).toBe('b2');
    expect(statuses[1].amountConsumed.amount).toBe(600);
    expect(statuses[1].status).toBe('OnTrack');
  });

  it('should compute a Derived Overall aggregate when only category budgets exist (ADR-025)', () => {
    const service = new BudgetHealthService();
    const period = new ReportingPeriod('CurrentMonth', new Date('2026-07-01'), new Date('2026-07-31'));

    const budgets: BudgetSnapshot[] = [
      { id: 'b1', limit: new MonetaryAmount(3000, 'INR'), categoryId: 'cat1' },
      { id: 'b2', limit: new MonetaryAmount(2000, 'INR'), categoryId: 'cat2' },
      { id: 'b3', limit: new MonetaryAmount(150, 'INR'), categoryId: 'cat3' },
    ];

    const transactions: TransactionSnapshot[] = [
      { id: '1', amount: new MonetaryAmount(1000, 'INR'), direction: 'Expense', occurredAt: new Date('2026-07-10'), categoryId: 'cat1', description: 'Transport' },
    ];

    const statuses = service.calculateStatus(budgets, transactions, period);

    expect(statuses.length).toBe(4);

    // Derived aggregate status (multiple category budgets summed correctly)
    const derivedStatus = statuses[0];
    expect(derivedStatus.source).toBe('Derived');
    expect(derivedStatus.budgetId).toBeUndefined();
    expect(derivedStatus.limit.amount).toBe(5150);
    expect(derivedStatus.amountConsumed.amount).toBe(1000);
    expect(derivedStatus.remainingAmount.amount).toBe(4150);
    expect(derivedStatus.categoryId).toBeUndefined();

    // Per-category rows remain Explicit with their real budgetId, unaffected by the derived row.
    expect(statuses[1].source).toBe('Explicit');
    expect(statuses[1].budgetId).toBe('b1');
  });

  it('should exclude expenses in categories without a budget from the Derived Overall consumed amount', () => {
    const service = new BudgetHealthService();
    const period = new ReportingPeriod('CurrentMonth', new Date('2026-07-01'), new Date('2026-07-31'));

    const budgets: BudgetSnapshot[] = [
      { id: 'b1', limit: new MonetaryAmount(1000, 'INR'), categoryId: 'cat1' },
    ];

    const transactions: TransactionSnapshot[] = [
      { id: '1', amount: new MonetaryAmount(200, 'INR'), direction: 'Expense', occurredAt: new Date('2026-07-05'), categoryId: 'cat1', description: 'Budgeted category' },
      { id: '2', amount: new MonetaryAmount(500, 'INR'), direction: 'Expense', occurredAt: new Date('2026-07-06'), categoryId: 'cat-unbudgeted', description: 'Unbudgeted category' },
    ];

    const statuses = service.calculateStatus(budgets, transactions, period);
    const derivedStatus = statuses[0];

    expect(derivedStatus.source).toBe('Derived');
    expect(derivedStatus.amountConsumed.amount).toBe(200);
  });

  it('should exclude uncategorized expenses from the Derived Overall consumed amount', () => {
    const service = new BudgetHealthService();
    const period = new ReportingPeriod('CurrentMonth', new Date('2026-07-01'), new Date('2026-07-31'));

    const budgets: BudgetSnapshot[] = [
      { id: 'b1', limit: new MonetaryAmount(1000, 'INR'), categoryId: 'cat1' },
    ];

    const transactions: TransactionSnapshot[] = [
      { id: '1', amount: new MonetaryAmount(200, 'INR'), direction: 'Expense', occurredAt: new Date('2026-07-05'), categoryId: 'cat1', description: 'Budgeted category' },
      { id: '2', amount: new MonetaryAmount(500, 'INR'), direction: 'Expense', occurredAt: new Date('2026-07-06'), categoryId: '', description: 'Uncategorized' },
    ];

    const statuses = service.calculateStatus(budgets, transactions, period);
    const derivedStatus = statuses[0];

    expect(derivedStatus.source).toBe('Derived');
    expect(derivedStatus.amountConsumed.amount).toBe(200);
  });

  it('should exclude expenses outside the period from the Derived Overall consumed amount (period boundary)', () => {
    const service = new BudgetHealthService();
    const period = new ReportingPeriod(
      'CurrentMonth',
      new Date(2026, 6, 1, 0, 0, 0, 0),
      new Date(2026, 6, 31, 23, 59, 59, 999)
    );

    const budgets: BudgetSnapshot[] = [
      { id: 'b1', limit: new MonetaryAmount(1000, 'INR'), categoryId: 'cat1' },
    ];

    const transactions: TransactionSnapshot[] = [
      { id: '1', amount: new MonetaryAmount(150, 'INR'), direction: 'Expense', occurredAt: new Date(2026, 6, 1, 0, 0, 0, 0), categoryId: 'cat1', description: 'Start of period' },
      { id: '2', amount: new MonetaryAmount(150, 'INR'), direction: 'Expense', occurredAt: new Date(2026, 6, 31, 23, 59, 59, 999), categoryId: 'cat1', description: 'End of period' },
      { id: '3', amount: new MonetaryAmount(999, 'INR'), direction: 'Expense', occurredAt: new Date(2026, 7, 1, 0, 0, 0, 0), categoryId: 'cat1', description: 'Just after period' },
    ];

    const statuses = service.calculateStatus(budgets, transactions, period);
    const derivedStatus = statuses[0];

    expect(derivedStatus.source).toBe('Derived');
    expect(derivedStatus.amountConsumed.amount).toBe(300);
  });

  it('should not synthesize a Derived Overall when no budgets exist (Empty state preserved)', () => {
    const service = new BudgetHealthService();
    const period = new ReportingPeriod('CurrentMonth', new Date('2026-07-01'), new Date('2026-07-31'));

    const statuses = service.calculateStatus([], [], period);

    expect(statuses).toEqual([]);
  });

  it('should give the explicit overall budget precedence over any derived aggregate, even with multiple category budgets present', () => {
    const service = new BudgetHealthService();
    const period = new ReportingPeriod('CurrentMonth', new Date('2026-07-01'), new Date('2026-07-31'));

    const budgets: BudgetSnapshot[] = [
      { id: 'cat-b1', limit: new MonetaryAmount(1000, 'INR'), categoryId: 'cat1' },
      { id: 'cat-b2', limit: new MonetaryAmount(2000, 'INR'), categoryId: 'cat2' },
      { id: 'overall-b', limit: new MonetaryAmount(5000, 'INR') },
    ];

    const statuses = service.calculateStatus(budgets, [], period);

    expect(statuses.length).toBe(3);
    expect(statuses.every((s) => s.source === 'Explicit')).toBe(true);
    expect(statuses.some((s) => s.categoryId === undefined && s.budgetId === 'overall-b')).toBe(true);
  });

  it('documents current defensive behavior for an anomalous multiple-explicit-overall input', () => {
    // ADR-016's overlap-prevention invariant should prevent this upstream in the Budgets context.
    // This test locks in the Dashboard service's current behavior if that invariant is ever violated:
    // every explicit-overall budget is mapped as its own Explicit row, and no Derived Overall is
    // synthesized because at least one explicit overall is present.
    const service = new BudgetHealthService();
    const period = new ReportingPeriod('CurrentMonth', new Date('2026-07-01'), new Date('2026-07-31'));

    const budgets: BudgetSnapshot[] = [
      { id: 'overall-1', limit: new MonetaryAmount(1000, 'INR') },
      { id: 'overall-2', limit: new MonetaryAmount(2000, 'INR') },
    ];

    const statuses = service.calculateStatus(budgets, [], period);

    expect(statuses.length).toBe(2);
    expect(statuses.every((s) => s.source === 'Explicit')).toBe(true);
    expect(statuses.map((s) => s.budgetId)).toEqual(['overall-1', 'overall-2']);
  });

  it('should throw if currency mismatch on a per-category budget', () => {
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

  it('should throw if category budgets feeding the Derived Overall have mismatched currencies', () => {
    const service = new BudgetHealthService();
    const period = new ReportingPeriod('CurrentMonth', new Date('2026-07-01'), new Date('2026-07-31'));

    const budgets: BudgetSnapshot[] = [
      { id: 'b1', limit: new MonetaryAmount(500, 'USD'), categoryId: 'cat1' },
      { id: 'b2', limit: new MonetaryAmount(500, 'EUR'), categoryId: 'cat2' },
    ];

    expect(() => service.calculateStatus(budgets, [], period)).toThrow('Transaction currency must match budget currency');
  });
});
