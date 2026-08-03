import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ArchiveAccountUseCase } from '../commands/ArchiveAccountUseCase';
import { InMemoryAccountRepository } from './InMemoryAccountRepository';
import { Account, AccountId, AccountName, AccountType, AccountTypeKind, CurrencyCode, OpeningBalance } from '../../domain';
import { LastAccountArchiveError } from '../errors/AccountApplicationError';
import { IUnitOfWork } from '../../../../core/application/ports';

describe('ArchiveAccountUseCase', () => {
  let repository: InMemoryAccountRepository;
  let unitOfWork: IUnitOfWork;
  let useCase: ArchiveAccountUseCase;

  beforeEach(() => {
    repository = new InMemoryAccountRepository();

    const acc1 = new Account({
      id: new AccountId('acc-1'),
      name: new AccountName('Acc 1'),
      type: new AccountType(AccountTypeKind.Bank),
      currencyCode: new CurrencyCode('INR'),
      openingBalance: new OpeningBalance(100),
      isDefault: true,
      createdAt: new Date('2026-01-01'),
    });

    const acc2 = new Account({
      id: new AccountId('acc-2'),
      name: new AccountName('Acc 2'),
      type: new AccountType(AccountTypeKind.Cash),
      currencyCode: new CurrencyCode('INR'),
      openingBalance: new OpeningBalance(50),
      isDefault: false,
      createdAt: new Date('2026-01-02'),
    });

    repository.seed(acc1);
    repository.seed(acc2);

    unitOfWork = {
      runInTransaction: vi.fn(async (work) => await work()),
    };

    useCase = new ArchiveAccountUseCase(repository, unitOfWork);
  });

  it('should successfully archive an account using unitOfWork transaction', async () => {
    await useCase.execute({ accountId: 'acc-2' });

    expect(unitOfWork.runInTransaction).toHaveBeenCalled();
    const activeCountResult = await repository.getActiveCount();
    if (!activeCountResult.success) {
      throw new Error('Failed to get active count');
    }
    expect(activeCountResult.data).toBe(1);
  });

  it('should prevent archiving the sole active account', async () => {
    await useCase.execute({ accountId: 'acc-2' });

    await expect(useCase.execute({ accountId: 'acc-1' })).rejects.toThrow(LastAccountArchiveError);
  });
});
