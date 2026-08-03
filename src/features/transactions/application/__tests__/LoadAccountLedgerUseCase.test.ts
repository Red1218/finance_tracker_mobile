import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryTransactionRepository } from './InMemoryTransactionRepository';
import { InMemoryAccountRepository } from '../../../accounts/application/__tests__/InMemoryAccountRepository';
import { Account, AccountId, AccountName, AccountType, AccountTypeKind, CurrencyCode, OpeningBalance } from '../../../accounts/domain';
import { Transaction, TransactionId, Money, TransactionDescription } from '../../domain';
import { LoadAccountLedgerQueryUseCase } from '../queries/LoadAccountLedgerQueryUseCase';

describe('LoadAccountLedgerQueryUseCase', () => {
  let transactionRepo: InMemoryTransactionRepository;
  let accountRepo: InMemoryAccountRepository;
  let useCase: LoadAccountLedgerQueryUseCase;

  beforeEach(() => {
    transactionRepo = new InMemoryTransactionRepository();
    accountRepo = new InMemoryAccountRepository();

    const account = new Account({
      id: new AccountId('acc-ledger'),
      name: new AccountName('Primary Bank'),
      type: new AccountType(AccountTypeKind.Bank),
      currencyCode: new CurrencyCode('INR'),
      openingBalance: new OpeningBalance(1000),
      isDefault: true,
    });

    accountRepo.seed(account);

    const income = Transaction.createIncome({
      id: new TransactionId('t-inc-1'),
      accountId: account.id,
      amount: new Money(500),
      currencyCode: account.currencyCode,
      description: new TransactionDescription('Salary credit'),
    });

    const expense = Transaction.createExpense({
      id: new TransactionId('t-exp-1'),
      accountId: account.id,
      amount: new Money(200),
      currencyCode: account.currencyCode,
      description: new TransactionDescription('Bill payment'),
    });

    transactionRepo.save(income);
    transactionRepo.save(expense);

    useCase = new LoadAccountLedgerQueryUseCase(transactionRepo, accountRepo);
  });

  it('should compute running balance and return projection DTO', async () => {
    const projection = await useCase.execute('acc-ledger');

    expect(projection.accountId).toBe('acc-ledger');
    expect(projection.openingBalance).toBe(1000);
    expect(projection.currentBalance).toBe(1300); // 1000 + 500 - 200 = 1300
    expect(projection.transactions.length).toBe(2);
  });
});
