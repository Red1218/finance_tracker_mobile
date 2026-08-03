import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InMemoryTransactionRepository } from './InMemoryTransactionRepository';
import { InMemoryAccountRepository } from '../../../accounts/application/__tests__/InMemoryAccountRepository';
import { Account, AccountId, AccountName, AccountType, AccountTypeKind, CurrencyCode, OpeningBalance } from '../../../accounts/domain';
import { ExecuteTransferUseCase } from '../commands/ExecuteTransferUseCase';
import { SameAccountTransferError } from '../errors/TransactionApplicationError';
import { IUnitOfWork } from '../../../../core/application/ports';

describe('ExecuteTransferUseCase', () => {
  let transactionRepo: InMemoryTransactionRepository;
  let accountRepo: InMemoryAccountRepository;
  let unitOfWork: IUnitOfWork;
  let useCase: ExecuteTransferUseCase;

  beforeEach(() => {
    transactionRepo = new InMemoryTransactionRepository();
    accountRepo = new InMemoryAccountRepository();

    const accChecking = new Account({
      id: new AccountId('acc-checking'),
      name: new AccountName('Checking'),
      type: new AccountType(AccountTypeKind.Bank),
      currencyCode: new CurrencyCode('INR'),
      openingBalance: new OpeningBalance(5000),
      isDefault: true,
    });

    const accSavings = new Account({
      id: new AccountId('acc-savings'),
      name: new AccountName('Savings'),
      type: new AccountType(AccountTypeKind.Bank),
      currencyCode: new CurrencyCode('INR'),
      openingBalance: new OpeningBalance(10000),
      isDefault: false,
    });

    accountRepo.seed(accChecking);
    accountRepo.seed(accSavings);

    unitOfWork = {
      runInTransaction: vi.fn(async (work) => await work()),
    };

    useCase = new ExecuteTransferUseCase(transactionRepo, accountRepo, unitOfWork);
  });

  it('should successfully execute atomic transfer between active accounts using unitOfWork', async () => {
    const { sourceEntry, destEntry } = await useCase.execute({
      sourceTransactionId: 't-src-1',
      destTransactionId: 't-dst-1',
      sourceAccountId: 'acc-checking',
      destAccountId: 'acc-savings',
      amount: 2000,
      currencyCode: 'INR',
      description: 'Monthly savings transfer',
      transferGroupId: 'tg-999',
    });

    expect(unitOfWork.runInTransaction).toHaveBeenCalled();
    expect(sourceEntry.type).toBe('TRANSFER_OUT');
    expect(destEntry.type).toBe('TRANSFER_IN');
    expect(sourceEntry.transferGroupId).toBe('tg-999');
    expect(destEntry.transferGroupId).toBe('tg-999');
  });

  it('should throw SameAccountTransferError when source and destination accounts are identical', async () => {
    await expect(
      useCase.execute({
        sourceTransactionId: 't-src-2',
        destTransactionId: 't-dst-2',
        sourceAccountId: 'acc-checking',
        destAccountId: 'acc-checking',
        amount: 500,
        currencyCode: 'INR',
        description: 'Self transfer',
        transferGroupId: 'tg-888',
      })
    ).rejects.toThrow(SameAccountTransferError);
  });
});
