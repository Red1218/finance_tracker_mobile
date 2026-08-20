import { describe, it, expect, vi } from 'vitest';
import { TransactionController } from '../controllers/TransactionController';

describe('TransactionController', () => {
  const mockCreateExpenseUseCase = { execute: vi.fn() } as any;
  const mockCreateIncomeUseCase = { execute: vi.fn() } as any;
  const mockExecuteTransferUseCase = { execute: vi.fn() } as any;
  const mockUpdateTransactionUseCase = { execute: vi.fn() } as any;
  const mockVoidTransactionUseCase = { execute: vi.fn() } as any;
  const mockLoadTransactionsUseCase = { execute: vi.fn() } as any;
  const mockLoadAccountLedgerUseCase = { execute: vi.fn() } as any;

  const controller = new TransactionController(
    mockCreateExpenseUseCase,
    mockCreateIncomeUseCase,
    mockExecuteTransferUseCase,
    mockUpdateTransactionUseCase,
    mockVoidTransactionUseCase,
    mockLoadTransactionsUseCase,
    mockLoadAccountLedgerUseCase
  );

  it('forwards createExpense payload correctly', async () => {
    const expenseData = {
      id: 'tx-1',
      accountId: 'acc-1',
      amount: 250,
      currencyCode: 'INR',
      description: 'Coffee',
      categoryId: 'cat-1',
    };
    mockCreateExpenseUseCase.execute.mockResolvedValueOnce({
      id: { value: 'tx-1' },
      accountId: { value: 'acc-1' },
      type: { kind: 'EXPENSE' },
      amount: { value: 250 },
      currencyCode: { value: 'INR' },
      description: { value: 'Coffee' },
      categoryId: 'cat-1',
      transferGroupId: null,
      transactionDate: { value: new Date('2026-08-20') },
      isVoided: false,
    });

    await controller.createExpense(expenseData);
    expect(mockCreateExpenseUseCase.execute).toHaveBeenCalledWith(expenseData);
  });

  it('forwards createIncome payload correctly', async () => {
    const incomeData = {
      id: 'tx-2',
      accountId: 'acc-1',
      amount: 50000,
      currencyCode: 'INR',
      description: 'Salary',
      categoryId: 'cat-2',
    };
    mockCreateIncomeUseCase.execute.mockResolvedValueOnce({
      id: { value: 'tx-2' },
      accountId: { value: 'acc-1' },
      type: { kind: 'INCOME' },
      amount: { value: 50000 },
      currencyCode: { value: 'INR' },
      description: { value: 'Salary' },
      categoryId: 'cat-2',
      transferGroupId: null,
      transactionDate: { value: new Date('2026-08-20') },
      isVoided: false,
    });

    await controller.createIncome(incomeData);
    expect(mockCreateIncomeUseCase.execute).toHaveBeenCalledWith(incomeData);
  });

  it('forwards executeTransfer payload correctly', async () => {
    const transferData = {
      sourceTransactionId: 'tx-src',
      destTransactionId: 'tx-dest',
      sourceAccountId: 'acc-1',
      destAccountId: 'acc-2',
      amount: 1000,
      currencyCode: 'INR',
      description: 'Savings Transfer',
      transferGroupId: 'tg-1',
    };
    mockExecuteTransferUseCase.execute.mockResolvedValueOnce({
      sourceEntry: {
        id: { value: 'tx-src' },
        accountId: { value: 'acc-1' },
        type: { kind: 'TRANSFER_OUT' },
        amount: { value: 1000 },
        currencyCode: { value: 'INR' },
        description: { value: 'Savings Transfer' },
        categoryId: null,
        transferGroupId: { value: 'tg-1' },
        transactionDate: { value: new Date('2026-08-20') },
        isVoided: false,
      },
      destEntry: {
        id: { value: 'tx-dest' },
        accountId: { value: 'acc-2' },
        type: { kind: 'TRANSFER_IN' },
        amount: { value: 1000 },
        currencyCode: { value: 'INR' },
        description: { value: 'Savings Transfer' },
        categoryId: null,
        transferGroupId: { value: 'tg-1' },
        transactionDate: { value: new Date('2026-08-20') },
        isVoided: false,
      },
    });

    await controller.executeTransfer(transferData);
    expect(mockExecuteTransferUseCase.execute).toHaveBeenCalledWith(transferData);
  });

  it('forwards complete updateTransaction payload correctly', async () => {
    const updateData = {
      id: 'tx-1',
      amount: 300,
      description: 'Updated Coffee',
      categoryId: 'cat-3',
      transactionDate: new Date('2026-08-21'),
    };
    mockUpdateTransactionUseCase.execute.mockResolvedValueOnce({});

    await controller.updateTransaction(updateData);
    expect(mockUpdateTransactionUseCase.execute).toHaveBeenCalledWith({
      id: 'tx-1',
      amount: 300,
      description: 'Updated Coffee',
      categoryId: 'cat-3',
      transactionDate: updateData.transactionDate,
    });
  });

  it('forwards voidTransaction transaction ID correctly', async () => {
    mockVoidTransactionUseCase.execute.mockResolvedValueOnce(undefined);

    await controller.voidTransaction('tx-1');
    expect(mockVoidTransactionUseCase.execute).toHaveBeenCalledWith('tx-1', undefined);
  });
});
