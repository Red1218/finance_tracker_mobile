import { describe, it, expect, beforeEach } from 'vitest';
import { CreateExpenseUseCase } from '../use-cases/CreateExpenseUseCase';
import { InMemoryExpenseRepository } from './InMemoryExpenseRepository';
import { v4 as uuidv4 } from 'uuid';

describe('CreateExpenseUseCase', () => {
  let repository: InMemoryExpenseRepository;
  let useCase: CreateExpenseUseCase;

  beforeEach(() => {
    repository = new InMemoryExpenseRepository();
    useCase = new CreateExpenseUseCase(repository);
  });

  it('should successfully create an expense', async () => {
    const request = {
      categoryId: uuidv4(),
      amount: 5000,
      currency: 'INR',
      date: Date.now(),
      paymentMethod: 'UPI' as const,
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
      categoryId: uuidv4(),
      amount: -100,
      currency: 'INR',
      date: Date.now(),
      paymentMethod: 'UPI' as const,
    };

    const result = await useCase.execute(request);

    expect(result.success).toBe(false);
    if (result.success) return;
    
    expect(result.error.code).toBe('INVALID_AMOUNT');
  });
});
