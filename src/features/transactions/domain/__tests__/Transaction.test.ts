import { describe, it, expect } from 'vitest';
import { Transaction } from '../entities/Transaction';
import { AccountId, CurrencyCode } from '../../../accounts/domain';
import {
  TransactionId,
  Money,
  TransactionDescription,
  TransferReference,
} from '../value-objects';
import { TransactionDomainError } from '../errors/TransactionDomainError';

describe('Transaction Entity', () => {
  const acc1 = new AccountId('acc-1');
  const acc2 = new AccountId('acc-2');
  const inr = new CurrencyCode('INR');

  it('should create valid expense transaction', () => {
    const t = Transaction.createExpense({
      id: new TransactionId('t-1'),
      accountId: acc1,
      amount: new Money(1500),
      currencyCode: inr,
      description: new TransactionDescription('Groceries'),
    });

    expect(t.id.value).toBe('t-1');
    expect(t.amount.value).toBe(1500);
    expect(t.type.isExpense()).toBe(true);
    expect(t.isVoided).toBe(false);
  });

  it('should create linked transfer pair with shared transferGroupId without destinationAccountId', () => {
    const transferRef = new TransferReference('tg-100');

    const { sourceEntry, destEntry } = Transaction.createTransferPair({
      sourceTransactionId: new TransactionId('t-src'),
      destTransactionId: new TransactionId('t-dst'),
      sourceAccountId: acc1,
      destAccountId: acc2,
      amount: new Money(5000),
      currencyCode: inr,
      description: new TransactionDescription('Transfer to Savings'),
      transferGroupId: transferRef,
    });

    expect(sourceEntry.accountId.equals(acc1)).toBe(true);
    expect(sourceEntry.type.isTransferOut()).toBe(true);
    expect(sourceEntry.transferGroupId?.value).toBe('tg-100');

    expect(destEntry.accountId.equals(acc2)).toBe(true);
    expect(destEntry.type.isTransferIn()).toBe(true);
    expect(destEntry.transferGroupId?.value).toBe('tg-100');
  });

  it('should reject transfer pair when source and destination accounts are identical', () => {
    expect(() =>
      Transaction.createTransferPair({
        sourceTransactionId: new TransactionId('t-src'),
        destTransactionId: new TransactionId('t-dst'),
        sourceAccountId: acc1,
        destAccountId: acc1,
        amount: new Money(1000),
        currencyCode: inr,
        description: new TransactionDescription('Self transfer'),
        transferGroupId: new TransferReference('tg-200'),
      })
    ).toThrow(TransactionDomainError);
  });

  it('should void and unvoid transaction entity preserving audit history', () => {
    const t = Transaction.createExpense({
      id: new TransactionId('t-1'),
      accountId: acc1,
      amount: new Money(500),
      currencyCode: inr,
      description: new TransactionDescription('Coffee'),
    });

    const voided = t.voidTransaction();
    expect(voided.isVoided).toBe(true);
    expect(voided.voidedAt).toBeInstanceOf(Date);

    const unvoided = voided.unvoidTransaction();
    expect(unvoided.isVoided).toBe(false);
    expect(unvoided.voidedAt).toBeNull();
  });

  it('should support occurredAt and soft archiving/restoration lifecycle', () => {
    const occurredDate = new Date('2026-07-27T10:00:00Z');
    const t = Transaction.createExpense({
      id: new TransactionId('t-arch-1'),
      accountId: acc1,
      amount: new Money(100),
      currencyCode: inr,
      description: new TransactionDescription('Lunch'),
      occurredAt: occurredDate,
    });

    expect(t.occurredAt.toISOString()).toBe(occurredDate.toISOString());
    expect(t.isArchived).toBe(false);

    const archived = t.archive();
    expect(archived.isArchived).toBe(true);
    expect(archived.archivedAt).toBeInstanceOf(Date);

    expect(() => archived.archive()).toThrow(TransactionDomainError);

    const restored = archived.restore();
    expect(restored.isArchived).toBe(false);
    expect(restored.archivedAt).toBeNull();

    expect(() => restored.restore()).toThrow(TransactionDomainError);
  });
});
