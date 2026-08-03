import { describe, it, expect, beforeEach } from 'vitest';
import { CreateAccountUseCase } from '../commands/CreateAccountUseCase';
import { InMemoryAccountRepository } from './InMemoryAccountRepository';
import { AccountTypeKind } from '../../domain';
import { DuplicateAccountNameError } from '../errors/AccountApplicationError';

describe('CreateAccountUseCase', () => {
  let repository: InMemoryAccountRepository;
  let useCase: CreateAccountUseCase;

  beforeEach(() => {
    repository = new InMemoryAccountRepository();
    useCase = new CreateAccountUseCase(repository);
  });

  it('should successfully create a new Bank account returning AccountDTO', async () => {
    const dto = await useCase.execute({
      name: 'HDFC Savings',
      type: AccountTypeKind.Bank,
      currencyCode: 'INR',
      openingBalance: 15000,
    });

    expect(dto.name).toBe('HDFC Savings');
    expect(dto.openingBalance).toBe(15000);
    expect(dto.currencyCode).toBe('INR');
    expect(dto.isArchived).toBe(false);
  });

  it('should throw DuplicateAccountNameError when creating account with duplicate active name', async () => {
    await useCase.execute({
      name: 'Salary Account',
      type: AccountTypeKind.Bank,
      currencyCode: 'INR',
      openingBalance: 0,
    });

    await expect(
      useCase.execute({
        name: 'Salary Account',
        type: AccountTypeKind.Bank,
        currencyCode: 'INR',
        openingBalance: 500,
      })
    ).rejects.toThrow(DuplicateAccountNameError);
  });
});
