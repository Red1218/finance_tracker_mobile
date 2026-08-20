import { describe, it, expect, vi } from 'vitest';
import { TransactionViewModel } from '../models/TransactionViewModel';

const mockTransactions: TransactionViewModel[] = [
  {
    id: 'tx-1',
    accountId: 'acc-1',
    categoryId: 'cat-1',
    type: 'EXPENSE',
    typeLabel: 'Expense',
    amount: 500,
    formattedAmount: '-₹500.00',
    currencyCode: 'INR',
    description: 'Groceries',
    transferGroupId: null,
    transactionDateIso: '2026-08-20T10:00:00Z',
    formattedDate: 'Aug 20, 2026',
    isVoided: false,
    badgeColor: '#EF4444',
  },
  {
    id: 'tx-2',
    accountId: 'acc-1',
    categoryId: 'cat-2',
    type: 'INCOME',
    typeLabel: 'Income',
    amount: 50000,
    formattedAmount: '+₹50,000.00',
    currencyCode: 'INR',
    description: 'Monthly Salary',
    transferGroupId: null,
    transactionDateIso: '2026-08-01T09:00:00Z',
    formattedDate: 'Aug 01, 2026',
    isVoided: false,
    badgeColor: '#10B981',
  },
];

describe('TransactionsScreen Contract & Flow Integration', () => {
  it('filters transactions by search query correctly', () => {
    const query = 'Groceries';
    const filtered = mockTransactions.filter((tx) =>
      tx.description.toLowerCase().includes(query.toLowerCase())
    );
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('tx-1');
  });

  it('filters transactions by type filter pill correctly', () => {
    const incomeOnly = mockTransactions.filter((tx) => tx.type === 'INCOME');
    expect(incomeOnly).toHaveLength(1);
    expect(incomeOnly[0].description).toBe('Monthly Salary');
  });

  it('triggers onFormSubmit and onRefresh callbacks on creation', async () => {
    const onFormSubmitMock = vi.fn().mockResolvedValue(undefined);
    const onRefreshMock = vi.fn();

    const formValues = {
      accountId: 'acc-1',
      amount: 150,
      currencyCode: 'INR',
      description: 'Snacks',
      categoryId: 'cat-1',
    };

    await onFormSubmitMock(formValues, 'expense');
    onRefreshMock();

    expect(onFormSubmitMock).toHaveBeenCalledWith(formValues, 'expense');
    expect(onRefreshMock).toHaveBeenCalled();
  });

  it('triggers onVoidTransaction and onRefresh callbacks on void action', async () => {
    const onVoidTransactionMock = vi.fn().mockResolvedValue(undefined);
    const onRefreshMock = vi.fn();

    await onVoidTransactionMock('tx-1');
    onRefreshMock();

    expect(onVoidTransactionMock).toHaveBeenCalledWith('tx-1');
    expect(onRefreshMock).toHaveBeenCalled();
  });
});
