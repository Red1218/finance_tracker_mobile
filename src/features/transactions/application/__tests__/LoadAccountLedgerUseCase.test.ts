import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryTransactionRepository } from './InMemoryTransactionRepository';
import { LoadAccountLedgerUseCase } from '../use-cases/LoadAccountLedgerUseCase';
import { AccountId, CurrencyCode } from '../../../accounts/domain';
import { Transaction, TransactionId, Money, TransactionDescription, TransferReference } from '../../domain';

describe('LoadAccountLedgerUseCase', () => {
  let transactionRepo: InMemoryTransactionRepository;
  let useCase: LoadAccountLedgerUseCase;
  const accId = new AccountId('acc-main');
  const otherAcc = new AccountId('acc-other');
  const inr = new CurrencyCode('INR');

  beforeEach(async () => {
    transactionRepo = new InMemoryTransactionRepository();
    useCase = new LoadAccountLedgerUseCase(transactionRepo);

    // Income: +10,000
    await transactionRepo.save(
      Transaction.createIncome({
        id: new TransactionId('t-inc'),
        accountId: accId,
        amount: new Money(10000),
        currencyCode: inr,
        description: new TransactionDescription('Salary'),
      })
    );

    // Expense: -2,500
    await transactionRepo.save(
      Transaction.createExpense({
        id: new TransactionId('t-exp'),
        accountId: accId,
        amount: new Money(2500),
        currencyCode: inr,
        description: new TransactionDescription('Rent'),
      })
    );

    // Transfer Out: -1,000 to otherAcc
    const { sourceEntry, destEntry } = Transaction.createTransferPair({
      sourceTransactionId: new TransactionId('t-tr-out'),
      destTransactionId: new TransactionId('t-tr-in'),
      sourceAccountId: accId,
      destAccountId: otherAcc,
      amount: new Money(1000),
      currencyCode: inr,
      description: new TransactionDescription('Savings Transfer'),
      transferGroupId: new TransferReference('tg-1'),
    });
    await transactionRepo.saveMany([sourceEntry, destEntry]);

    // Voided Expense: Should be IGNORED
    const voidedExp = Transaction.createExpense({
      id: new TransactionId('t-voided'),
      accountId: accId,
      amount: new Money(9999),
      currencyCode: inr,
      description: new TransactionDescription('Voided Purchase'),
    }).voidTransaction();
    await transactionRepo.save(voidedExp);
  });

  it('should accurately calculate active ledger summary for an account', async () => {
    const summary = await useCase.execute('acc-main');

    expect(summary.totalIncome).toBe(10000);
    expect(summary.totalExpense).toBe(2500);
    expect(summary.totalTransfersOut).toBe(1000);
    expect(summary.totalTransfersIn).toBe(0);

    // Derived Net Movement = Income (10000) + In (0) - Expense (2500) - Out (1000) = +6500
    const netMovement = summary.totalIncome + summary.totalTransfersIn - summary.totalExpense - summary.totalTransfersOut;
    expect(netMovement).toBe(6500);
  });
});
