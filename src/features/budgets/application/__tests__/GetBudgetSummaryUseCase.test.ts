import { describe, it, expect, beforeEach } from 'vitest';
import { GetBudgetSummaryUseCase } from '../use-cases/GetBudgetSummaryUseCase';
import { InMemoryBudgetRepository } from './InMemoryBudgetRepository';
import { InMemoryTransactionRepository } from '../../../transactions/application/__tests__/InMemoryTransactionRepository';
import { Budget, BudgetId, BudgetAmount, BudgetPeriod, BudgetPeriodType } from '../../domain';
import { CurrencyCode } from '../../../expenses/domain/value-objects/CurrencyCode';
import { Transaction, TransactionId, TransactionType, TransactionTypeKind, TransactionDate, TransactionDescription, Money } from '../../../transactions/domain';
import { AccountId } from '../../../accounts/domain';

describe('GetBudgetSummaryUseCase', () => {
  let budgetRepo: InMemoryBudgetRepository;
  let txRepo: InMemoryTransactionRepository;
  let useCase: GetBudgetSummaryUseCase;

  const validBudgetId = '123e4567-e89b-12d3-a456-426614174000';
  const accountId = new AccountId('123e4567-e89b-12d3-a456-426614174001');
  const catId = '123e4567-e89b-12d3-a456-426614174002';
  const currency = new CurrencyCode('INR');
  const startDate = new Date('2026-06-01T00:00:00Z');
  const endDate = new Date('2026-06-30T23:59:59Z');

  beforeEach(() => {
    budgetRepo = new InMemoryBudgetRepository();
    txRepo = new InMemoryTransactionRepository();
    useCase = new GetBudgetSummaryUseCase(budgetRepo, txRepo);

    budgetRepo.seed(
      Budget.create({
        id: new BudgetId(validBudgetId),
        categoryId: null, // Overall budget
        amount: new BudgetAmount(10000),
        currency,
        period: new BudgetPeriod(BudgetPeriodType.Monthly, startDate, endDate),
      })
    );
  });

  it('computes summary with zero transactions (ON_TRACK)', async () => {
    const summary = await useCase.execute({ budgetId: validBudgetId });

    expect(summary.spentAmount).toBe(0);
    expect(summary.remainingAmount).toBe(10000);
    expect(summary.percentageUsed).toBe(0);
    expect(summary.healthStatus).toBe('ON_TRACK');
  });

  it('computes summary with partial spend (ON_TRACK / NEAR_LIMIT)', async () => {
    txRepo.save(
      new Transaction({
        id: new TransactionId('123e4567-e89b-12d3-a456-426614174010'),
        accountId,
        categoryId: catId,
        type: new TransactionType(TransactionTypeKind.Expense),
        amount: new Money(8500),
        currencyCode: currency,
        description: new TransactionDescription('Groceries'),
        transactionDate: new TransactionDate(new Date('2026-06-15')),
      })
    );

    const summary = await useCase.execute({ budgetId: validBudgetId });

    expect(summary.spentAmount).toBe(8500);
    expect(summary.remainingAmount).toBe(1500);
    expect(summary.percentageUsed).toBe(85);
    expect(summary.healthStatus).toBe('NEAR_LIMIT');
  });

  it('computes summary when spent equals budget limit (NEAR_LIMIT)', async () => {
    txRepo.save(
      new Transaction({
        id: new TransactionId('123e4567-e89b-12d3-a456-426614174011'),
        accountId,
        categoryId: catId,
        type: new TransactionType(TransactionTypeKind.Expense),
        amount: new Money(10000),
        currencyCode: currency,
        description: new TransactionDescription('Rent'),
        transactionDate: new TransactionDate(new Date('2026-06-15')),
      })
    );

    const summary = await useCase.execute({ budgetId: validBudgetId });

    expect(summary.spentAmount).toBe(10000);
    expect(summary.remainingAmount).toBe(0);
    expect(summary.percentageUsed).toBe(100);
    expect(summary.healthStatus).toBe('NEAR_LIMIT');
  });

  it('computes summary when over budget (OVER_BUDGET)', async () => {
    txRepo.save(
      new Transaction({
        id: new TransactionId('123e4567-e89b-12d3-a456-426614174012'),
        accountId,
        categoryId: catId,
        type: new TransactionType(TransactionTypeKind.Expense),
        amount: new Money(12000),
        currencyCode: currency,
        description: new TransactionDescription('Shopping'),
        transactionDate: new TransactionDate(new Date('2026-06-15')),
      })
    );

    const summary = await useCase.execute({ budgetId: validBudgetId });

    expect(summary.spentAmount).toBe(12000);
    expect(summary.remainingAmount).toBe(-2000);
    expect(summary.percentageUsed).toBe(120);
    expect(summary.healthStatus).toBe('OVER_BUDGET');
  });

  it('ignores voided transactions when computing spend summary', async () => {
    const tx = new Transaction({
      id: new TransactionId('123e4567-e89b-12d3-a456-426614174013'),
      accountId,
      categoryId: catId,
      type: new TransactionType(TransactionTypeKind.Expense),
      amount: new Money(5000),
      currencyCode: currency,
      description: new TransactionDescription('Cancelled Purchase'),
      transactionDate: new TransactionDate(new Date('2026-06-15')),
    });
    txRepo.save(tx.voidTransaction());

    const summary = await useCase.execute({ budgetId: validBudgetId });

    expect(summary.spentAmount).toBe(0);
    expect(summary.healthStatus).toBe('ON_TRACK');
  });

  it('includes historical transactions from archived categories within budget period', async () => {
    txRepo.save(
      new Transaction({
        id: new TransactionId('123e4567-e89b-12d3-a456-426614174014'),
        accountId,
        categoryId: '123e4567-e89b-12d3-a456-426614174099', // archived category ID
        type: new TransactionType(TransactionTypeKind.Expense),
        amount: new Money(3000),
        currencyCode: currency,
        description: new TransactionDescription('Old Category Expense'),
        transactionDate: new TransactionDate(new Date('2026-06-10')),
      })
    );

    const summary = await useCase.execute({ budgetId: validBudgetId });

    expect(summary.spentAmount).toBe(3000);
    expect(summary.remainingAmount).toBe(7000);
  });
});
