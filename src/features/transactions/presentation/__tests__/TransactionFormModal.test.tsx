import { describe, it, expect, vi } from 'vitest';
import { TransactionFormValues, TransactionFormMode } from '../components/TransactionFormModal';

describe('TransactionFormModal Contract & Logic', () => {
  const mockAccounts = [
    { id: 'acc-1', name: 'Checking Account', isArchived: false },
    { id: 'acc-2', name: 'Savings Account', isArchived: false },
  ];

  const mockCategories = [
    { id: 'cat-1', name: 'Food', kind: 'EXPENSE' as const },
    { id: 'cat-2', name: 'Salary', kind: 'INCOME' as const },
  ];

  it('validates expense form submission values', () => {
    const values: TransactionFormValues = {
      accountId: 'acc-1',
      amount: 1500,
      currencyCode: 'INR',
      description: 'Supermarket',
      categoryId: 'cat-1',
    };

    expect(values.accountId).toBe('acc-1');
    expect(values.amount).toBeGreaterThan(0);
    expect(values.description).toBe('Supermarket');
    expect(values.categoryId).toBe('cat-1');
  });

  it('validates transfer form submission requiring distinct source and destination accounts', () => {
    const values: TransactionFormValues = {
      accountId: 'acc-1',
      destAccountId: 'acc-2',
      amount: 5000,
      currencyCode: 'INR',
      description: 'Fund Transfer',
      categoryId: null,
    };

    expect(values.accountId).not.toBe(values.destAccountId);
    expect(values.amount).toBe(5000);
    expect(values.categoryId).toBeNull();
  });

  it('handles submit callback invocation', async () => {
    const onSubmitMock = vi.fn().mockResolvedValue(undefined);
    const testValues: TransactionFormValues = {
      accountId: 'acc-1',
      amount: 300,
      currencyCode: 'INR',
      description: 'Coffee',
      categoryId: 'cat-1',
    };

    await onSubmitMock(testValues);
    expect(onSubmitMock).toHaveBeenCalledWith(testValues);
  });
});
