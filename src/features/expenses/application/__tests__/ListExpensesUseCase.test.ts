import { describe, it, expect, beforeEach } from 'vitest';
import { ListExpensesUseCase } from '../use-cases/ListExpensesUseCase';
import { InMemoryExpenseRepository } from './InMemoryExpenseRepository';
import { Expense } from '../../domain/entities/Expense';
import { ExpenseId } from '../../domain/value-objects/ExpenseId';
import { CategoryId } from '../../../categories/domain';
import { ExpenseAmount } from '../../domain/value-objects/ExpenseAmount';
import { CurrencyCode } from '../../domain/value-objects/CurrencyCode';
import { ExpenseDate } from '../../domain/value-objects/ExpenseDate';
import { PaymentMethod } from '../../domain/value-objects/PaymentMethod';
import { v4 as uuidv4 } from 'uuid';

describe('ListExpensesUseCase', () => {
  let repository: InMemoryExpenseRepository;
  let useCase: ListExpensesUseCase;
  let catId1: string;
  let catId2: string;

  beforeEach(async () => {
    repository = new InMemoryExpenseRepository();
    useCase = new ListExpensesUseCase(repository);

    catId1 = uuidv4();
    catId2 = uuidv4();

    const createExp = async (catId: string, dateOffset: number) => {
      const expense = new Expense({
        id: new ExpenseId(uuidv4()),
        categoryId: new CategoryId(catId),
        amount: new ExpenseAmount(1500),
        currency: new CurrencyCode('INR'),
        date: new ExpenseDate(Date.now() + dateOffset),
        paymentMethod: new PaymentMethod('UPI'),
      });
      await repository.create(expense);
    };

    await createExp(catId1, 1000);
    await createExp(catId1, 2000);
    await createExp(catId2, 3000);
  });

  it('should list all expenses without filter', async () => {
    const result = await useCase.execute({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data?.length).toBe(3);
    }
  });

  it('should filter by categoryId', async () => {
    const result = await useCase.execute({ categoryId: catId1 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data?.length).toBe(2);
      expect(result.data![0].categoryId.value).toBe(catId1);
    }
  });
});
