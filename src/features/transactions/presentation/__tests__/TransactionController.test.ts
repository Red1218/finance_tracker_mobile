import { describe, it, expect, vi, Mock } from 'vitest';
import { TransactionController } from '../controllers/TransactionController';
import {
  CreateExpenseTransactionUseCase,
  CreateIncomeTransactionUseCase,
  ExecuteTransferUseCase,
  VoidTransactionUseCase,
  LoadTransactionsUseCase,
  LoadAccountLedgerUseCase,
} from '../../application';
import { UpdateTransactionUseCase } from '../../application/use-cases/UpdateTransactionUseCase';

interface MockUseCase {
  execute: Mock;
}

describe('TransactionController', () => {
  const mockCreateExpenseUseCase: MockUseCase = { execute: vi.fn() };
  const mockCreateIncomeUseCase: MockUseCase = { execute: vi.fn() };
  const mockExecuteTransferUseCase: MockUseCase = { execute: vi.fn() };
  const mockUpdateTransactionUseCase: MockUseCase = { execute: vi.fn() };
  const mockVoidTransactionUseCase: MockUseCase = { execute: vi.fn() };
  const mockLoadTransactionsUseCase: MockUseCase = { execute: vi.fn() };
  const mockLoadAccountLedgerUseCase: MockUseCase = { execute: vi.fn() };

  const controller = new TransactionController(
    mockCreateExpenseUseCase as unknown as CreateExpenseTransactionUseCase,
    mockCreateIncomeUseCase as unknown as CreateIncomeTransactionUseCase,
    mockExecuteTransferUseCase as unknown as ExecuteTransferUseCase,
    mockUpdateTransactionUseCase as unknown as UpdateTransactionUseCase,
    mockVoidTransactionUseCase as unknown as VoidTransactionUseCase,
    mockLoadTransactionsUseCase as unknown as LoadTransactionsUseCase,
    mockLoadAccountLedgerUseCase as unknown as LoadAccountLedgerUseCase
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
      createdAt: new Date('2026-08-20T09:13:00'),
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
      createdAt: new Date('2026-08-20T09:13:00'),
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
        createdAt: new Date('2026-08-20T09:13:00'),
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
        createdAt: new Date('2026-08-20T09:13:00'),
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
