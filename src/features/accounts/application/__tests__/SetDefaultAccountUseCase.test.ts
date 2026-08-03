import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SetDefaultAccountUseCase } from '../commands/SetDefaultAccountUseCase';
import { InMemoryAccountRepository } from './InMemoryAccountRepository';
import { Account, AccountId, AccountName, AccountType, AccountTypeKind, CurrencyCode, OpeningBalance } from '../../domain';
import { AccountNotFoundError } from '../errors/AccountApplicationError';
import { IUnitOfWork } from '../../../../core/application/ports';

describe('SetDefaultAccountUseCase', () => {
  let repository: InMemoryAccountRepository;
  let unitOfWork: IUnitOfWork;
  let useCase: SetDefaultAccountUseCase;

  beforeEach(() => {
    repository = new InMemoryAccountRepository();

    const acc1 = new Account({
      id: new AccountId('acc-1'),
      name: new AccountName('Acc 1'),
      type: new AccountType(AccountTypeKind.Bank),
      currencyCode: new CurrencyCode('INR'),
      openingBalance: new OpeningBalance(100),
      isDefault: true,
    });

    const acc2 = new Account({
      id: new AccountId('acc-2'),
      name: new AccountName('Acc 2'),
      type: new AccountType(AccountTypeKind.Cash),
      currencyCode: new CurrencyCode('INR'),
      openingBalance: new OpeningBalance(50),
      isDefault: false,
    });

    repository.seed(acc1);
    repository.seed(acc2);

    unitOfWork = {
      runInTransaction: vi.fn(async (work) => await work()),
    };

    useCase = new SetDefaultAccountUseCase(repository, unitOfWork);
  });

  it('should set target account as default using unitOfWork', async () => {
    await useCase.execute({ accountId: 'acc-2' });

    expect(unitOfWork.runInTransaction).toHaveBeenCalled();
    const updatedResult = await repository.getById(new AccountId('acc-2'));
    if (!updatedResult.success) {
      throw new Error('Failed to get account');
    }
    expect(updatedResult.data?.isDefault).toBe(true);
  });

  it('should throw AccountNotFoundError when target account does not exist', async () => {
    await expect(useCase.execute({ accountId: 'non-existent' })).rejects.toThrow(AccountNotFoundError);
  });
});
