import { describe, it, expect, beforeEach } from 'vitest';
import { RenameAccountUseCase } from '../commands/RenameAccountUseCase';
import { InMemoryAccountRepository } from './InMemoryAccountRepository';
import { Account, AccountId, AccountName, AccountType, AccountTypeKind, CurrencyCode, OpeningBalance } from '../../domain';
import { AccountNotFoundError } from '../errors/AccountApplicationError';

describe('RenameAccountUseCase', () => {
  let repository: InMemoryAccountRepository;
  let useCase: RenameAccountUseCase;

  beforeEach(() => {
    repository = new InMemoryAccountRepository();
    const account = new Account({
      id: new AccountId('acc-1'),
      name: new AccountName('Checking'),
      type: new AccountType(AccountTypeKind.Bank),
      currencyCode: new CurrencyCode('INR'),
      openingBalance: new OpeningBalance(100),
      isDefault: true,
    });
    repository.seed(account);
    useCase = new RenameAccountUseCase(repository);
  });

  it('should successfully rename an account', async () => {
    const dto = await useCase.execute({
      accountId: 'acc-1',
      newName: 'Personal Checking',
    });

    expect(dto.name).toBe('Personal Checking');
  });

  it('should throw AccountNotFoundError for non-existent account', async () => {
    await expect(
      useCase.execute({
        accountId: 'non-existent',
        newName: 'Test',
      })
    ).rejects.toThrow(AccountNotFoundError);
  });
});
