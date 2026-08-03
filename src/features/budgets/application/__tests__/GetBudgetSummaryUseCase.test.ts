import { describe, it, expect, beforeEach } from 'vitest';
import { GetBudgetSummaryProjection } from '../projections/GetBudgetSummaryProjection';
import { InMemoryBudgetRepository } from './InMemoryBudgetRepository';
import { InMemoryTransactionRepository } from '../../../transactions/application/__tests__/InMemoryTransactionRepository';
import { Budget, BudgetId, BudgetAmount, BudgetPeriod, BudgetPeriodType } from '../../domain';
import { CategoryId } from '../../../categories/domain';
import { CurrencyCode, AccountId } from '../../../accounts/domain';
import { Transaction, TransactionId, Money, TransactionDescription } from '../../../transactions/domain';

describe('GetBudgetSummaryProjection', () => {
  let budgetRepo: InMemoryBudgetRepository;
  let transactionRepo: InMemoryTransactionRepository;
  let projection: GetBudgetSummaryProjection;
  const validBudgetId = 'b1111111-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    budgetRepo = new InMemoryBudgetRepository();
    transactionRepo = new InMemoryTransactionRepository();

    const budget = Budget.create({
      id: new BudgetId(validBudgetId),
      categoryId: new CategoryId('cat-groceries'),
      amount: new BudgetAmount(1000),
      currency: new CurrencyCode('INR'),
      period: new BudgetPeriod(BudgetPeriodType.Monthly, new Date('2026-06-01'), new Date('2026-06-30')),
    });
    budgetRepo.save(budget);

    const tx1 = Transaction.createExpense({
      id: new TransactionId('t-1'),
      accountId: new AccountId('acc-1'),
      amount: new Money(400),
      currencyCode: new CurrencyCode('INR'),
      description: new TransactionDescription('Groceries 1'),
      categoryId: 'cat-groceries',
      occurredAt: new Date('2026-06-10'),
    });

    const tx2 = Transaction.createExpense({
      id: new TransactionId('t-2'),
      accountId: new AccountId('acc-1'),
      amount: new Money(450),
      currencyCode: new CurrencyCode('INR'),
      description: new TransactionDescription('Groceries 2'),
      categoryId: 'cat-groceries',
      occurredAt: new Date('2026-06-20'),
    });

    transactionRepo.save(tx1);
    transactionRepo.save(tx2);

    projection = new GetBudgetSummaryProjection(budgetRepo, transactionRepo);
  });

  it('should compute budget summary DTO correctly', async () => {
    const summary = await projection.execute(validBudgetId);

    expect(summary.spentAmount).toBe(850);
    expect(summary.remainingAmount).toBe(150);
    expect(summary.percentageUsed).toBe(85);
    expect(summary.healthStatus).toBe('NEAR_LIMIT');
  });
});
