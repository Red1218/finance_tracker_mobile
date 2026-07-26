import { describe, it, expect, beforeEach } from 'vitest';
import { UpdateExpenseUseCase } from '../use-cases/UpdateExpenseUseCase';
import { InMemoryExpenseRepository } from './InMemoryExpenseRepository';
import { Expense } from '../../domain/entities/Expense';
import { ExpenseId } from '../../domain/value-objects/ExpenseId';
import { CategoryId } from '../../../categories/domain';
import { ExpenseAmount } from '../../domain/value-objects/ExpenseAmount';
import { CurrencyCode } from '../../domain/value-objects/CurrencyCode';
import { ExpenseDate } from '../../domain/value-objects/ExpenseDate';
import { PaymentMethod } from '../../domain/value-objects/PaymentMethod';
import { ExpenseNote } from '../../domain/value-objects/ExpenseNote';
import { InMemoryCategoryRepository } from '../../../categories/application/__tests__/InMemoryCategoryRepository';
import { Category, CategoryName, CategoryKind } from '../../../categories/domain';
import { v4 as uuidv4 } from 'uuid';

describe('UpdateExpenseUseCase', () => {
  let repository: InMemoryExpenseRepository;
  let categoryRepository: InMemoryCategoryRepository;
  let useCase: UpdateExpenseUseCase;
  let existingExpenseId: string;
  let validCategoryId: string;

  beforeEach(async () => {
    repository = new InMemoryExpenseRepository();
    categoryRepository = new InMemoryCategoryRepository();
    useCase = new UpdateExpenseUseCase(repository, categoryRepository);

    validCategoryId = uuidv4();
    categoryRepository.seed(
      new Category({
        id: new CategoryId(validCategoryId),
        name: new CategoryName('Valid Category'),
        kind: CategoryKind.Expense,
        isSystem: false,
        archivedAt: null,
      })
    );

    const id = new ExpenseId(uuidv4());
    existingExpenseId = id.value;
    
    const expense = new Expense({
      id,
      categoryId: new CategoryId(validCategoryId),
      amount: new ExpenseAmount(1500),
      currency: new CurrencyCode('INR'),
      date: new ExpenseDate(Date.now()),
      paymentMethod: new PaymentMethod('UPI'),
      note: new ExpenseNote('Initial'),
    });

    await repository.create(expense);
  });

  it('should successfully update an expense', async () => {
    const request = {
      id: existingExpenseId,
      amount: 2500,
    };

    const result = await useCase.execute(request);

    expect(result.success).toBe(true);
    
    const saved = await repository.getById(new ExpenseId(existingExpenseId));
    expect(saved.success).toBe(true);
    if (saved.success) {
      expect(saved.data?.amount.value).toBe(2500);
      expect(saved.data?.note?.value).toBe('Initial'); // Unchanged
    }
  });

  it('should unset optional fields when null is provided', async () => {
    const request = {
      id: existingExpenseId,
      note: null, // explicitly unset
    };

    const result = await useCase.execute(request);

    expect(result.success).toBe(true);
    
    const saved = await repository.getById(new ExpenseId(existingExpenseId));
    expect(saved.success).toBe(true);
    if (saved.success) {
      expect(saved.data?.note).toBeUndefined();
    }
  });

  it('should fail if expense does not exist', async () => {
    const result = await useCase.execute({
      id: uuidv4(), // New random ID
      amount: 500,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect((result.error as any).code).toBe('INVALID_IDENTIFIER');
    }
  });

  it('should update payment method and preserve date when date is not updated', async () => {
    const original = await repository.getById(new ExpenseId(existingExpenseId));
    expect(original.success).toBe(true);
    const originalDate = original.success ? original.data?.date.value : 0;

    const result = await useCase.execute({
      id: existingExpenseId,
      paymentMethod: 'CREDIT_CARD' as any,
    });

    expect(result.success).toBe(true);
    
    const saved = await repository.getById(new ExpenseId(existingExpenseId));
    expect(saved.success).toBe(true);
    if (saved.success) {
      expect(saved.data?.paymentMethod.value).toBe('CREDIT_CARD');
      expect(saved.data?.date.value).toBe(originalDate);
    }
  });

  it('should update date when date is provided', async () => {
    const newDate = 1700000000000;
    const result = await useCase.execute({
      id: existingExpenseId,
      date: newDate,
    });

    expect(result.success).toBe(true);

    const saved = await repository.getById(new ExpenseId(existingExpenseId));
    expect(saved.success).toBe(true);
    if (saved.success) {
      expect(saved.data?.date.value).toBe(newDate);
    }
  });
});
