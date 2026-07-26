import { describe, it, expect, beforeEach } from 'vitest';
import { CreateAccountUseCase } from '../use-cases/CreateAccountUseCase';
import { InMemoryAccountRepository } from './InMemoryAccountRepository';
import { AccountTypeKind, AccountDomainError } from '../../domain';

describe('CreateAccountUseCase', () => {
  let repository: InMemoryAccountRepository;
  let useCase: CreateAccountUseCase;

  beforeEach(() => {
    repository = new InMemoryAccountRepository();
    useCase = new CreateAccountUseCase(repository);
  });

  it('should successfully create a new Bank account', async () => {
    const result = await useCase.execute({
      name: 'HDFC Savings',
      type: AccountTypeKind.Bank,
      currencyCode: 'INR',
      openingBalance: 15000,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name.value).toBe('HDFC Savings');
      expect(result.data.openingBalance.value).toBe(15000);
      expect(result.data.isDefault).toBe(true); // First account is auto-default
    }
  });

  it('should fail when creating an account with a duplicate active name', async () => {
    await useCase.execute({ name: 'Salary Account', type: AccountTypeKind.Bank });

    const duplicateResult = await useCase.execute({ name: 'Salary Account', type: AccountTypeKind.Bank });

    expect(duplicateResult.success).toBe(false);
    if (!duplicateResult.success) {
      expect(duplicateResult.error).toBeInstanceOf(AccountDomainError);
      expect((duplicateResult.error as AccountDomainError).code).toBe('DUPLICATE_ACCOUNT_NAME');
    }
  });
});
