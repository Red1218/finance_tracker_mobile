import { describe, it, expect, beforeEach } from 'vitest';
import { DeleteExpenseUseCase } from '../use-cases/DeleteExpenseUseCase';
import { InMemoryExpenseRepository } from './InMemoryExpenseRepository';
import { Expense } from '../../domain/entities/Expense';
import { ExpenseId } from '../../domain/value-objects/ExpenseId';
import { CategoryId } from '../../../categories/domain';
import { ExpenseAmount } from '../../domain/value-objects/ExpenseAmount';
import { CurrencyCode } from '../../domain/value-objects/CurrencyCode';
import { ExpenseDate } from '../../domain/value-objects/ExpenseDate';
import { PaymentMethod } from '../../domain/value-objects/PaymentMethod';
import { v4 as uuidv4 } from 'uuid';

describe('DeleteExpenseUseCase', () => {
  let repository: InMemoryExpenseRepository;
  let useCase: DeleteExpenseUseCase;
  let existingExpenseId: string;

  beforeEach(async () => {
    repository = new InMemoryExpenseRepository();
    useCase = new DeleteExpenseUseCase(repository);

    const id = new ExpenseId(uuidv4());
    existingExpenseId = id.value;
    
    const expense = new Expense({
      id,
      categoryId: new CategoryId(uuidv4()),
      amount: new ExpenseAmount(1500),
      currency: new CurrencyCode('INR'),
      date: new ExpenseDate(Date.now()),
      paymentMethod: new PaymentMethod('UPI'),
    });

    await repository.create(expense);
  });

  it('should successfully delete an existing expense', async () => {
    const result = await useCase.execute({ id: existingExpenseId });

    expect(result.success).toBe(true);
    
    const saved = await repository.getById(new ExpenseId(existingExpenseId));
    expect(saved.success).toBe(true);
    if (saved.success) {
      expect(saved.data).toBeNull();
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
