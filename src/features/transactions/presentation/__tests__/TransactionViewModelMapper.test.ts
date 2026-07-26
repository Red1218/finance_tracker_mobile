import { describe, it, expect } from 'vitest';
import { TransactionViewModelMapper } from '../mappers/TransactionViewModelMapper';
import {
  Transaction,
  TransactionId,
  Money,
  TransactionDescription,
  TransferReference,
} from '../../domain';
import { AccountId, CurrencyCode } from '../../../accounts/domain';

describe('TransactionViewModelMapper', () => {
  it('maps an expense transaction to view model correctly', () => {
    const expense = Transaction.createExpense({
      id: new TransactionId('t-1'),
      accountId: new AccountId('acc-1'),
      amount: new Money(1250),
      currencyCode: new CurrencyCode('INR'),
      description: new TransactionDescription('Groceries'),
      transactionDate: undefined,
    });

    const vm = TransactionViewModelMapper.mapToViewModel(expense);

    expect(vm.id).toBe('t-1');
    expect(vm.accountId).toBe('acc-1');
    expect(vm.type).toBe('EXPENSE');
    expect(vm.typeLabel).toBe('Expense');
    expect(vm.amount).toBe(1250);
    expect(vm.formattedAmount).toContain('-₹1,250.00');
    expect(vm.badgeColor).toBe('#EF4444');
    expect(vm.isVoided).toBe(false);
  });

  it('maps a transfer pair entry to view model correctly', () => {
    const { sourceEntry } = Transaction.createTransferPair({
      sourceTransactionId: new TransactionId('t-src'),
      destTransactionId: new TransactionId('t-dst'),
      sourceAccountId: new AccountId('acc-checking'),
      destAccountId: new AccountId('acc-savings'),
      amount: new Money(5000),
      currencyCode: new CurrencyCode('INR'),
      description: new TransactionDescription('Savings Transfer'),
      transferGroupId: new TransferReference('tg-100'),
    });

    const vm = TransactionViewModelMapper.mapToViewModel(sourceEntry);

    expect(vm.type).toBe('TRANSFER_OUT');
    expect(vm.typeLabel).toBe('Transfer Out');
    expect(vm.formattedAmount).toContain('-₹5,000.00');
    expect(vm.transferGroupId).toBe('tg-100');
    expect(vm.badgeColor).toBe('#F59E0B');
  });
});
