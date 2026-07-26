import { describe, it, expect } from 'vitest';
import { TransactionMapper } from '../TransactionMapper';
import {
  Transaction,
  TransactionId,
  Money,
  TransactionDescription,
  TransferReference,
} from '../../../../features/transactions/domain';
import { AccountId, CurrencyCode } from '../../../../features/accounts/domain';
import { TransactionRow } from '../../../../features/transactions/contracts/TransactionRow';

describe('TransactionMapper', () => {
  const userId = 'usr-12345';

  it('maps an Expense transaction aggregate to persistence row and back to domain symmetrically', () => {
    const expense = Transaction.createExpense({
      id: new TransactionId('11111111-1111-4111-a111-111111111111'),
      accountId: new AccountId('22222222-2222-4222-a222-222222222222'),
      amount: new Money(49.99),
      currencyCode: new CurrencyCode('INR'),
      description: new TransactionDescription('Groceries'),
      categoryId: '33333333-3333-4333-a333-333333333333',
    });

    const row: TransactionRow = TransactionMapper.toPersistence(expense, userId);

    expect(row.id).toBe(expense.id.value);
    expect(row.user_id).toBe(userId);
    expect(row.account_id).toBe(expense.accountId.value);
    expect(row.type).toBe('EXPENSE');
    expect(row.amount).toBe(49.99);
    expect(row.currency_code).toBe('INR');
    expect(row.description).toBe('Groceries');
    expect(row.category_id).toBe('33333333-3333-4333-a333-333333333333');
    expect(row.transfer_group_id).toBeNull();
    expect(row.voided_at).toBeNull();

    const domainObject = TransactionMapper.toDomain(row);

    expect(domainObject.id.value).toBe(expense.id.value);
    expect(domainObject.accountId.value).toBe(expense.accountId.value);
    expect(domainObject.type.kind).toBe('EXPENSE');
    expect(domainObject.amount.value).toBe(49.99);
    expect(domainObject.currencyCode.value).toBe('INR');
    expect(domainObject.description?.value).toBe('Groceries');
    expect(domainObject.categoryId).toBe('33333333-3333-4333-a333-333333333333');
    expect(domainObject.transferGroupId).toBeNull();
    expect(domainObject.isVoided).toBe(false);
  });

  it('maps a paired transfer entry with transferGroupId and voidedAt symmetrically', () => {
    const { sourceEntry } = Transaction.createTransferPair({
      sourceTransactionId: new TransactionId('44444444-4444-4444-a444-444444444444'),
      destTransactionId: new TransactionId('55555555-5555-4555-a555-555555555555'),
      sourceAccountId: new AccountId('66666666-6666-4666-a666-666666666666'),
      destAccountId: new AccountId('77777777-7777-4777-a777-777777777777'),
      amount: new Money(150),
      currencyCode: new CurrencyCode('INR'),
      description: new TransactionDescription('Transfer to Wallet'),
      transferGroupId: new TransferReference('88888888-8888-4888-a888-888888888888'),
    });

    const voidedSourceEntry = sourceEntry.voidTransaction(new Date('2026-07-25T12:00:00.000Z'));

    const row: TransactionRow = TransactionMapper.toPersistence(voidedSourceEntry, userId);

    expect(row.type).toBe('TRANSFER_OUT');
    expect(row.transfer_group_id).toBe('88888888-8888-4888-a888-888888888888');
    expect(row.voided_at).toBe('2026-07-25T12:00:00.000Z');

    const domainObject = TransactionMapper.toDomain(row);

    expect(domainObject.type.kind).toBe('TRANSFER_OUT');
    expect(domainObject.transferGroupId?.value).toBe('88888888-8888-4888-a888-888888888888');
    expect(domainObject.isVoided).toBe(true);
    expect(domainObject.voidedAt?.toISOString()).toBe('2026-07-25T12:00:00.000Z');
  });
});
