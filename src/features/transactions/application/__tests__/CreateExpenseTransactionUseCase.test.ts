import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryTransactionRepository } from './InMemoryTransactionRepository';
import { InMemoryAccountRepository } from '../../../accounts/application/__tests__/InMemoryAccountRepository';
import { Account, AccountId, AccountName, AccountType, AccountTypeKind, CurrencyCode, OpeningBalance } from '../../../accounts/domain';
import { CreateExpenseTransactionUseCase } from '../commands/CreateExpenseTransactionUseCase';
import { AccountNotFoundError } from '../../../accounts/application/errors/AccountApplicationError';

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

    accountRepo.seed(activeAcc);
    useCase = new CreateExpenseTransactionUseCase(transactionRepo, accountRepo);
  });

  it('should successfully record expense returning TransactionDTO', async () => {
    const dto = await useCase.execute({
      id: 't-exp-1',
      accountId: 'acc-active',
      amount: 250,
      currencyCode: 'INR',
      description: 'Groceries',
    });

    expect(dto.id).toBe('t-exp-1');
    expect(dto.amount).toBe(250);
    expect(dto.type).toBe('EXPENSE');
  });

  it('should throw AccountNotFoundError when account is missing', async () => {
    await expect(
      useCase.execute({
        id: 't-exp-2',
        accountId: 'acc-missing',
        amount: 100,
        currencyCode: 'INR',
        description: 'Should fail',
      })
    ).rejects.toThrow(AccountNotFoundError);
  });
});
