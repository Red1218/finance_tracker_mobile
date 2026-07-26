import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryTransactionRepository } from './InMemoryTransactionRepository';
import { InMemoryAccountRepository } from '../../../accounts/application/__tests__/InMemoryAccountRepository';
import { Account, AccountId, AccountName, AccountType, AccountTypeKind, CurrencyCode, OpeningBalance } from '../../../accounts/domain';
import { CreateExpenseTransactionUseCase } from '../use-cases/CreateExpenseTransactionUseCase';
import { TransactionDomainError } from '../../domain';

describe('CreateExpenseTransactionUseCase', () => {
  let transactionRepo: InMemoryTransactionRepository;
  let accountRepo: InMemoryAccountRepository;
  let useCase: CreateExpenseTransactionUseCase;

  beforeEach(() => {
    transactionRepo = new InMemoryTransactionRepository();
    accountRepo = new InMemoryAccountRepository();

    const activeAcc = new Account({
      id: new AccountId('acc-active'),
      name: new AccountName('Checking'),
      type: new AccountType(AccountTypeKind.Bank),
      currencyCode: new CurrencyCode('INR'),
      openingBalance: new OpeningBalance(1000),
      isDefault: true,
    });

    const archivedAcc = new Account({
      id: new AccountId('acc-archived'),
      name: new AccountName('Old Savings'),
      type: new AccountType(AccountTypeKind.Bank),
      currencyCode: new CurrencyCode('INR'),
      openingBalance: new OpeningBalance(500),
      isDefault: false,
      archivedAt: new Date(),
    });

    accountRepo.seed(activeAcc);
    accountRepo.seed(archivedAcc);
    useCase = new CreateExpenseTransactionUseCase(transactionRepo, accountRepo);
  });

  it('should successfully record expense on an active account', async () => {
    const result = await useCase.execute({
      id: 't-exp-1',
      accountId: 'acc-active',
      amount: 250,
      currencyCode: 'INR',
      description: 'Groceries',
    });

    expect(result.id.value).toBe('t-exp-1');
    expect(result.amount.value).toBe(250);

    const stored = await transactionRepo.getById(result.id);
    expect(stored).not.toBeNull();
  });

  it('should reject expense recording on an archived account', async () => {
    await expect(
      useCase.execute({
        id: 't-exp-2',
        accountId: 'acc-archived',
        amount: 100,
        currencyCode: 'INR',
        description: 'Should fail',
      })
    ).rejects.toThrow(TransactionDomainError);
  });
});
