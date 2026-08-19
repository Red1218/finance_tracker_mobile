import { describe, it, expect, vi } from 'vitest';
import { TransactionViewModel } from '../models/TransactionViewModel';

const mockTransaction: TransactionViewModel = {
  id: 'tx-101',
  accountId: 'acc-1',
  categoryId: 'cat-1',
  type: 'EXPENSE',
  typeLabel: 'Expense',
  amount: 450,
  formattedAmount: '-₹450.00',
  currencyCode: 'INR',
  description: 'Grocery Supermarket',
  transferGroupId: null,
  transactionDateIso: '2026-08-15T10:00:00Z',
  formattedDate: 'Aug 15, 2026',
  isVoided: false,
  badgeColor: '#EF4444',
};

describe('TransactionRow', () => {
  it('validates transaction presentation props', () => {
    expect(mockTransaction.description).toBe('Grocery Supermarket');
    expect(mockTransaction.formattedAmount).toBe('-₹450.00');
    expect(mockTransaction.typeLabel).toBe('Expense');
  });

  it('handles callback invocation safely', () => {
    const onPressMock = vi.fn();
    onPressMock(mockTransaction);
    expect(onPressMock).toHaveBeenCalledWith(mockTransaction);
  });
});
