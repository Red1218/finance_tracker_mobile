import { describe, it, expect, beforeEach } from 'vitest';
import { RestoreExpenseUseCase } from '../use-cases/RestoreExpenseUseCase';
import { InMemoryExpenseRepository } from './InMemoryExpenseRepository';
import { Expense } from '../../domain/entities/Expense';
import { ExpenseId } from '../../domain/value-objects/ExpenseId';
import { CategoryId } from '../../../categories/domain';
import { ExpenseAmount } from '../../domain/value-objects/ExpenseAmount';
import { CurrencyCode } from '../../domain/value-objects/CurrencyCode';
import { ExpenseDate } from '../../domain/value-objects/ExpenseDate';
import { PaymentMethod } from '../../domain/value-objects/PaymentMethod';
import { v4 as uuidv4 } from 'uuid';

describe('RestoreExpenseUseCase', () => {
  let repository: InMemoryExpenseRepository;
  let useCase: RestoreExpenseUseCase;
  let deletedExpenseId: string;

  beforeEach(async () => {
    repository = new InMemoryExpenseRepository();
    useCase = new RestoreExpenseUseCase(repository);

    const id = new ExpenseId(uuidv4());
    deletedExpenseId = id.value;
    
    let expense = new Expense({
      id,
      categoryId: new CategoryId(uuidv4()),
      amount: new ExpenseAmount(1500),
      currency: new CurrencyCode('INR'),
      date: new ExpenseDate(Date.now()),
      paymentMethod: new PaymentMethod('UPI'),
    });

    expense = expense.delete();
    await repository.create(expense);
  });

  it('should successfully restore a deleted expense', async () => {
    const result = await useCase.execute({ id: deletedExpenseId });

    expect(result.success).toBe(true);
    
    const saved = await repository.getById(new ExpenseId(deletedExpenseId));
    expect(saved.success).toBe(true);
    if (saved.success) {
      expect(saved.data?.isDeleted).toBe(false);
    }
  });

  it('should fail if expense does not exist', async () => {
    const result = await useCase.execute({
      id: uuidv4(),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect((result.error as any).code).toBe('INVALID_IDENTIFIER');
    }
  });
});
