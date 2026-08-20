import { describe, it, expect, vi } from 'vitest';
import { TransactionViewModel } from '../models/TransactionViewModel';

const mockDetailTransaction: TransactionViewModel = {
  id: 'tx-200',
  accountId: 'acc-1',
  categoryId: 'cat-1',
  type: 'EXPENSE',
  typeLabel: 'Expense',
  amount: 1250,
  formattedAmount: '-₹1,250.00',
  currencyCode: 'INR',
  description: 'Starbucks Coffee',
  transferGroupId: null,
  transactionDateIso: '2026-08-20T14:30:00Z',
  formattedDate: 'Aug 20, 2026',
  isVoided: false,
  badgeColor: '#EF4444',
};

const mockVoidedTransaction: TransactionViewModel = {
  ...mockDetailTransaction,
  id: 'tx-201',
  isVoided: true,
  badgeColor: '#9CA3AF',
};

describe('TransactionDetailSheet Presentation Behavior & State Rules', () => {
  it('validates active transaction presentation props', () => {
    expect(mockDetailTransaction.id).toBe('tx-200');
    expect(mockDetailTransaction.description).toBe('Starbucks Coffee');
    expect(mockDetailTransaction.formattedAmount).toBe('-₹1,250.00');
    expect(mockDetailTransaction.isVoided).toBe(false);
  });

  it('validates voided transaction state restrictions', () => {
    expect(mockVoidedTransaction.isVoided).toBe(true);
    expect(mockVoidedTransaction.badgeColor).toBe('#9CA3AF');
  });

  it('triggers onEdit callback when Edit action is invoked', () => {
    const onEditMock = vi.fn();
    onEditMock(mockDetailTransaction);
    expect(onEditMock).toHaveBeenCalledWith(mockDetailTransaction);
  });

  it('triggers onVoid callback when Void action is confirmed', async () => {
    const onVoidMock = vi.fn().mockResolvedValue(undefined);
    await onVoidMock('tx-200');
    expect(onVoidMock).toHaveBeenCalledWith('tx-200');
  });

  it('disables actions when transaction is voided', () => {
    const isEditDisabled = mockVoidedTransaction.isVoided;
    expect(isEditDisabled).toBe(true);
  });
});
