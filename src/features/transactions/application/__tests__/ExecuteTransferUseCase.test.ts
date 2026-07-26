import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryTransactionRepository } from './InMemoryTransactionRepository';
import { InMemoryAccountRepository } from '../../../accounts/application/__tests__/InMemoryAccountRepository';
import { Account, AccountId, AccountName, AccountType, AccountTypeKind, CurrencyCode, OpeningBalance } from '../../../accounts/domain';
import { ExecuteTransferUseCase } from '../use-cases/ExecuteTransferUseCase';
import { TransactionDomainError, TransferReference } from '../../domain';

describe('ExecuteTransferUseCase', () => {
  let transactionRepo: InMemoryTransactionRepository;
  let accountRepo: InMemoryAccountRepository;
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

    const accArchived = new Account({
      id: new AccountId('acc-archived'),
      name: new AccountName('Archived Account'),
      type: new AccountType(AccountTypeKind.Bank),
      currencyCode: new CurrencyCode('INR'),
      openingBalance: new OpeningBalance(0),
      isDefault: false,
      archivedAt: new Date(),
    });

    accountRepo.seed(accChecking);
    accountRepo.seed(accSavings);
    accountRepo.seed(accArchived);
    useCase = new ExecuteTransferUseCase(transactionRepo, accountRepo);
  });

  it('should successfully execute atomic transfer between active accounts', async () => {
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

    expect(sourceEntry.type.isTransferOut()).toBe(true);
    expect(destEntry.type.isTransferIn()).toBe(true);
    expect(sourceEntry.transferGroupId?.value).toBe('tg-999');
    expect(destEntry.transferGroupId?.value).toBe('tg-999');

    const storedGroupResult = await transactionRepo.getByTransferGroupId(new TransferReference('tg-999'));
    expect(storedGroupResult.success).toBe(true);
    if (storedGroupResult.success) {
      expect(storedGroupResult.data).toHaveLength(2);
    }
  });

  it('should reject transfer when source account is archived', async () => {
    await expect(
      useCase.execute({
        sourceTransactionId: 't-src-2',
        destTransactionId: 't-dst-2',
        sourceAccountId: 'acc-archived',
        destAccountId: 'acc-savings',
        amount: 500,
        currencyCode: 'INR',
        description: 'Transfer from archived',
        transferGroupId: 'tg-888',
      })
    ).rejects.toThrow(TransactionDomainError);
  });

  it('should reject transfer when destination account is archived', async () => {
    await expect(
      useCase.execute({
        sourceTransactionId: 't-src-3',
        destTransactionId: 't-dst-3',
        sourceAccountId: 'acc-checking',
        destAccountId: 'acc-archived',
        amount: 500,
        currencyCode: 'INR',
        description: 'Transfer to archived',
        transferGroupId: 'tg-777',
      })
    ).rejects.toThrow(TransactionDomainError);
  });
});
