import { describe, it, expect, beforeEach } from 'vitest';
import { CreateExpenseUseCase } from '../use-cases/CreateExpenseUseCase';
import { PaymentMethodType } from '../../domain/value-objects/PaymentMethod';
import { InMemoryExpenseRepository } from './InMemoryExpenseRepository';
import { InMemoryCategoryRepository } from '../../../categories/application/__tests__/InMemoryCategoryRepository';
import { Category, CategoryId, CategoryName, CategoryKind } from '../../../categories/domain';
import { v4 as uuidv4 } from 'uuid';

describe('CreateExpenseUseCase', () => {
  let repository: InMemoryExpenseRepository;
  let categoryRepository: InMemoryCategoryRepository;
  let useCase: CreateExpenseUseCase;
  let validCategoryId: string;

  beforeEach(() => {
    repository = new InMemoryExpenseRepository();
    categoryRepository = new InMemoryCategoryRepository();
    useCase = new CreateExpenseUseCase(repository, categoryRepository);

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
  });

  it('should successfully create an expense', async () => {
    const request = {
      categoryId: validCategoryId,
      amount: 5000,
      currency: 'INR',
      date: Date.now(),
      paymentMethod: PaymentMethodType.UPI,
      note: 'Grocery',
    };

    const result = await useCase.execute(request);

    expect(result.success).toBe(true);
    if (!result.success) return; // for type narrowing
    
    // We fetch the list since create returns void and we don't have the ID
    const listResult = await repository.list({});
    expect(listResult.success).toBe(true);
    if (!listResult.success) return;
    
    expect(listResult.data?.length).toBe(1);
    expect(listResult.data![0].amount.value).toBe(5000);
    expect(listResult.data![0].note?.value).toBe('Grocery');
  });

  it('should fail if amount is invalid', async () => {
    const request = {
      categoryId: validCategoryId,
      amount: -100,
      currency: 'INR',
      date: Date.now(),
      paymentMethod: PaymentMethodType.UPI,
    };

    const result = await useCase.execute(request);

    expect(result.success).toBe(false);
    if (result.success) return;
    
    expect((result.error as any).code).toBe('INVALID_AMOUNT');
  });
});
