import { describe, it, expect, beforeEach } from 'vitest';
import { TransactionsModule } from '../../composition/TransactionsModule';
import { InMemoryTransactionRepository } from '../../application/__tests__/InMemoryTransactionRepository';
import { InMemoryAccountRepository } from '../../../accounts/application/__tests__/InMemoryAccountRepository';
import { Account, AccountId, AccountName, AccountType, AccountTypeKind, CurrencyCode, OpeningBalance } from '../../../accounts/domain';

describe('TransactionsLifecycleIntegration', () => {
  let transactionsModule: TransactionsModule;
  let transactionRepo: InMemoryTransactionRepository;
  let accountRepo: InMemoryAccountRepository;

  beforeEach(() => {
    transactionRepo = new InMemoryTransactionRepository();
    accountRepo = new InMemoryAccountRepository();

    const accChecking = new Account({
      id: new AccountId('acc-chk'),
      name: new AccountName('Checking Account'),
      type: new AccountType(AccountTypeKind.Bank),
      currencyCode: new CurrencyCode('INR'),
      openingBalance: new OpeningBalance(10000),
      isDefault: true,
    });

    const accSavings = new Account({
      id: new AccountId('acc-svg'),
      name: new AccountName('Savings Account'),
      type: new AccountType(AccountTypeKind.Bank),
      currencyCode: new CurrencyCode('INR'),
      openingBalance: new OpeningBalance(5000),
      isDefault: false,
    });

    accountRepo.seed(accChecking);
    accountRepo.seed(accSavings);

    transactionsModule = new TransactionsModule(transactionRepo, accountRepo);
  });

  it('verifies complete transaction lifecycle: income, expense, atomic transfer, voiding, and derived ledger summary', async () => {
    const controller = transactionsModule.controller;

    // 1. Record Income to Checking: +₹15,000
    const incVm = await controller.createIncome({
      id: 'tx-inc-1',
      accountId: 'acc-chk',
      amount: 15000,
      currencyCode: 'INR',
      description: 'Salary Income',
    });
    expect(incVm.type).toBe('INCOME');
    expect(incVm.amount).toBe(15000);

    // 2. Record Expense from Checking: -₹3,500
    const expVm = await controller.createExpense({
      id: 'tx-exp-1',
      accountId: 'acc-chk',
      amount: 3500,
      currencyCode: 'INR',
      description: 'Groceries',
    });
    expect(expVm.type).toBe('EXPENSE');

    // 3. Execute Atomic Transfer: ₹4,000 from Checking to Savings
    const { sourceEntry, destEntry } = await controller.executeTransfer({
      sourceTransactionId: 'tx-trf-out-1',
      destTransactionId: 'tx-trf-in-1',
      sourceAccountId: 'acc-chk',
      destAccountId: 'acc-svg',
      amount: 4000,
      currencyCode: 'INR',
      description: 'Monthly Savings Transfer',
      transferGroupId: 'tg-group-100',
    });

    expect(sourceEntry.type).toBe('TRANSFER_OUT');
    expect(destEntry.type).toBe('TRANSFER_IN');
    expect(sourceEntry.transferGroupId).toBe('tg-group-100');
    expect(destEntry.transferGroupId).toBe('tg-group-100');

    // 4. Verify Ledger Summary for Checking Account
    // Opening balance: 10,000 | Income: 15,000 | Expense: 3,500 | Transfer Out: 4,000
    let chkSummary = await controller.loadAccountLedgerSummary('acc-chk');
    expect(chkSummary.totalIncome).toBe(15000);
    expect(chkSummary.totalExpense).toBe(3500);
    expect(chkSummary.totalTransfersOut).toBe(4000);
    expect(chkSummary.totalTransfersIn).toBe(0);

    // Derived Balance = 10,000 + 15,000 - 3,500 - 4,000 = 17,500
    const chkDerivedBalance = 10000 + chkSummary.totalIncome + chkSummary.totalTransfersIn - chkSummary.totalExpense - chkSummary.totalTransfersOut;
    expect(chkDerivedBalance).toBe(17500);

    // 5. Verify Ledger Summary for Savings Account
    // Opening balance: 5,000 | Transfer In: 4,000
    let svgSummary = await controller.loadAccountLedgerSummary('acc-svg');
    expect(svgSummary.totalTransfersIn).toBe(4000);
    const svgDerivedBalance = 5000 + svgSummary.totalIncome + svgSummary.totalTransfersIn - svgSummary.totalExpense - svgSummary.totalTransfersOut;
    expect(svgDerivedBalance).toBe(9000);

    // 6. Soft-void the transfer group
    await controller.voidTransaction('tx-trf-out-1');

    // Re-verify Checking summary after voiding transfer (Transfer Out should now be 0)
    chkSummary = await controller.loadAccountLedgerSummary('acc-chk');
    expect(chkSummary.totalTransfersOut).toBe(0);

    // Re-verify Savings summary after voiding transfer (Transfer In should now be 0)
    svgSummary = await controller.loadAccountLedgerSummary('acc-svg');
    expect(svgSummary.totalTransfersIn).toBe(0);
  });
});
