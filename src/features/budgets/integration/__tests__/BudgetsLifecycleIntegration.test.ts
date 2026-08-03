import { describe, it, expect, beforeEach } from 'vitest';
import { BudgetsModule } from '../../composition/BudgetsModule';
import { InMemoryBudgetRepository } from '../../application/__tests__/InMemoryBudgetRepository';
import { InMemoryCategoryRepository } from '../../../categories/application/__tests__/InMemoryCategoryRepository';
import { InMemoryTransactionRepository } from '../../../transactions/application/__tests__/InMemoryTransactionRepository';
import { BudgetPeriodType, BudgetDomainError } from '../../domain';
import { Category, CategoryId, CategoryName, CategoryKind } from '../../../categories/domain';
import { Transaction, TransactionId, TransactionType, TransactionTypeKind, TransactionDate, TransactionDescription, Money } from '../../../transactions/domain';
import { AccountId } from '../../../accounts/domain';
import { CurrencyCode } from '../../../accounts/domain/value-objects/CurrencyCode';
import { BudgetViewModel } from '../../presentation';

describe('Budgets Bounded Context — End-to-End Lifecycle Integration', () => {
  let module: BudgetsModule;
  let budgetRepo: InMemoryBudgetRepository;
  let categoryRepo: InMemoryCategoryRepository;
  let txRepo: InMemoryTransactionRepository;

  const validCategoryId = '123e4567-e89b-12d3-a456-426614174001';
  const accountId = new AccountId('123e4567-e89b-12d3-a456-426614174002');
  const currency = new CurrencyCode('INR');
  const startDate = new Date('2026-06-01T00:00:00.000Z');
  const endDate = new Date('2026-06-30T23:59:59.000Z');

  beforeEach(() => {
    budgetRepo = new InMemoryBudgetRepository();
    categoryRepo = new InMemoryCategoryRepository();
    txRepo = new InMemoryTransactionRepository();

    module = new BudgetsModule(budgetRepo, categoryRepo, txRepo);

    categoryRepo.seed(
      new Category({
        id: new CategoryId(validCategoryId),
        name: new CategoryName('Groceries'),
        kind: CategoryKind.Expense,
        isSystem: false,
        archivedAt: null,
      })
    );
  });

  it('allows overall budget and category budget to coexist for the same period window', async () => {
    // 1. Create Overall Budget for June 2026
    const overall = await module.controller.createBudget({
      categoryId: null,
      amount: 50000,
      currencyCode: 'INR',
      periodKind: BudgetPeriodType.Monthly,
      startDate,
      endDate,
    });
    expect(overall.isOverall).toBe(true);

    // 2. Create Category Budget for June 2026 (coexist with overall)
    const categoryBudget = await module.controller.createBudget({
      categoryId: validCategoryId,
      amount: 15000,
      currencyCode: 'INR',
      periodKind: BudgetPeriodType.Monthly,
      startDate,
      endDate,
    });
    expect(categoryBudget.isOverall).toBe(false);
    expect(categoryBudget.categoryId).toBe(validCategoryId);
  });

  it('rejects creation when date ranges partially intersect for the same budget scope', async () => {
    await module.controller.createBudget({
      categoryId: validCategoryId,
      amount: 15000,
      currencyCode: 'INR',
      periodKind: BudgetPeriodType.Monthly,
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-06-30'),
    });

    // Intersecting range: June 15 to July 15
    await expect(
      module.controller.createBudget({
        categoryId: validCategoryId,
        amount: 20000,
        currencyCode: 'INR',
        periodKind: BudgetPeriodType.Custom,
        startDate: new Date('2026-06-15'),
        endDate: new Date('2026-07-15'),
      })
    ).rejects.toThrowError(BudgetDomainError);
  });

  it('computes budget summary dynamically, excluding voided transactions and including historical archived category spend', async () => {
    const budget = await module.controller.createBudget({
      categoryId: null,
      amount: 20000,
      currencyCode: 'INR',
      periodKind: BudgetPeriodType.Monthly,
      startDate,
      endDate,
    });

    // Valid expense transaction: 12,000
    txRepo.save(
      new Transaction({
        id: new TransactionId('123e4567-e89b-12d3-a456-426614174010'),
        accountId,
        categoryId: validCategoryId,
        type: new TransactionType(TransactionTypeKind.Expense),
        amount: new Money(12000),
        currencyCode: currency,
        description: new TransactionDescription('Monthly Groceries'),
        transactionDate: new TransactionDate(new Date('2026-06-10')),
      })
    );

    // Voided expense transaction: 5,000 (must be excluded)
    const voidedTx = new Transaction({
      id: new TransactionId('123e4567-e89b-12d3-a456-426614174011'),
      accountId,
      categoryId: validCategoryId,
      type: new TransactionType(TransactionTypeKind.Expense),
      amount: new Money(5000),
      currencyCode: currency,
      description: new TransactionDescription('Voided Purchase'),
      transactionDate: new TransactionDate(new Date('2026-06-12')),
    });
    txRepo.save(voidedTx.voidTransaction());

    // Transaction with archived category: 3,000 (must be included historically)
    txRepo.save(
      new Transaction({
        id: new TransactionId('123e4567-e89b-12d3-a456-426614174012'),
        accountId,
        categoryId: '123e4567-e89b-12d3-a456-426614174099', // archived category
        type: new TransactionType(TransactionTypeKind.Expense),
        amount: new Money(3000),
        currencyCode: currency,
        description: new TransactionDescription('Historical Category Spend'),
        transactionDate: new TransactionDate(new Date('2026-06-15')),
      })
    );

    const summary = await module.controller.getBudgetSummary({ budgetId: budget.id });

    expect(summary.spentAmount).toBe(15000); // 12000 + 3000
    expect(summary.remainingAmount).toBe(5000);
    expect(summary.percentageUsed).toBe(75);
    expect(summary.healthStatus).toBe('ON_TRACK');
  });

  it('executes budget lifecycle: create, update amount, archive, restore', async () => {
    const budget = await module.controller.createBudget({
      categoryId: validCategoryId,
      amount: 10000,
      currencyCode: 'INR',
      periodKind: BudgetPeriodType.Monthly,
      startDate,
      endDate,
    });

    // Update amount for active non-historical period
    const updated = await module.controller.updateBudget({
      id: budget.id,
      newAmount: 18000,
      currentDate: new Date('2026-06-15'),
    });
    expect(updated.amount).toBe(18000);

    // Archive budget
    await module.controller.archiveBudget({ id: budget.id });
    const activeList = await module.controller.listBudgets({ includeArchived: false });
    expect(activeList.find((b: BudgetViewModel) => b.id === budget.id)).toBeUndefined();

    // Restore budget
    await module.controller.restoreBudget({ id: budget.id });
    const restoredList = await module.controller.listBudgets({ includeArchived: false });
    expect(restoredList.find((b: BudgetViewModel) => b.id === budget.id)).toBeDefined();
  });
});
