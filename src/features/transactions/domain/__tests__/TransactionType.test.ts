import { describe, it, expect } from 'vitest';
import { TransactionType, TransactionTypeKind } from '../value-objects/TransactionType';
import { TransactionDomainError } from '../errors/TransactionDomainError';

describe('TransactionType Value Object', () => {
  it('should create valid Expense, Income, TransferOut, and TransferIn kinds', () => {
    const expense = new TransactionType(TransactionTypeKind.Expense);
    const income = new TransactionType('INCOME');
    const transferOut = new TransactionType('TRANSFER_OUT');
    const transferIn = new TransactionType('TRANSFER_IN');

    expect(expense.isExpense()).toBe(true);
    expect(income.isIncome()).toBe(true);
    expect(transferOut.isTransferOut()).toBe(true);
    expect(transferOut.isTransfer()).toBe(true);
    expect(transferIn.isTransferIn()).toBe(true);
    expect(transferIn.isTransfer()).toBe(true);
  });

  it('should reject invalid transaction types', () => {
    expect(() => new TransactionType('INVESTMENT')).toThrow(TransactionDomainError);
  });
});
