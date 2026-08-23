import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BillTransactionAdapter } from '../BillTransactionAdapter';
import { CreateExpenseTransactionUseCase, ITransactionRepository, VoidTransactionUseCase } from '../../../transactions/application';
import { Transaction, TransactionId, Money, TransactionType, TransactionTypeKind, TransactionDescription } from '../../../transactions/domain';
import { AccountId, CurrencyCode } from '../../../accounts/domain';

describe('BillTransactionAdapter', () => {
  let mockCreateExpenseUseCase: CreateExpenseTransactionUseCase;
  let mockTransactionRepository: ITransactionRepository;
  let mockVoidTransactionUseCase: VoidTransactionUseCase;
  let adapter: BillTransactionAdapter;

  const createDummyTransaction = (id: string, isVoided: boolean = false): Transaction => {
    return new Transaction({
      id: new TransactionId(id),
      accountId: new AccountId('acc-123'),
      type: new TransactionType(TransactionTypeKind.Expense),
      amount: new Money(500),
      currencyCode: new CurrencyCode('INR'),
      description: new TransactionDescription('Electricity Bill'),
      voidedAt: isVoided ? new Date('2026-08-21T12:00:00.000Z') : null,
    });
  };

  beforeEach(() => {
    mockCreateExpenseUseCase = {
      execute: vi.fn(),
    } as unknown as CreateExpenseTransactionUseCase;

    mockTransactionRepository = {
      getById: vi.fn(),
      getByAccountId: vi.fn(),
      listTransactions: vi.fn(),
      getByTransferGroupId: vi.fn(),
      save: vi.fn(),
      saveMany: vi.fn(),
      voidTransaction: vi.fn(),
      voidTransferGroup: vi.fn(),
      getAccountLedgerSummary: vi.fn(),
    };

    mockVoidTransactionUseCase = {
      execute: vi.fn(),
    } as unknown as VoidTransactionUseCase;

    adapter = new BillTransactionAdapter(
      mockCreateExpenseUseCase,
      mockTransactionRepository,
      mockVoidTransactionUseCase
    );
  });

  describe('createExpenseTransaction', () => {
    it('delegates to CreateExpenseTransactionUseCase and returns transactionId', async () => {
      const dummyTx = {
        id: 'tx-gen-123',
        accountId: 'acc-123',
        type: 'EXPENSE',
        amount: 500,
        currencyCode: 'INR',
        description: 'Electricity Bill',
        categoryId: 'cat-util',
        transferGroupId: null,
        occurredAt: '2026-08-21T00:00:00.000Z',
        createdAt: '2026-08-21T00:00:00.000Z',
        archivedAt: null,
        isArchived: false,
        isVoided: false,
      };
      vi.mocked(mockCreateExpenseUseCase.execute).mockResolvedValue(dummyTx);

      const result = await adapter.createExpenseTransaction({
        userId: 'user-789',
        accountId: 'acc-123',
        amount: 500,
        currencyCode: 'INR',
        description: 'Electricity Bill',
        categoryId: 'cat-util',
        transactionDate: new Date('2026-08-21T00:00:00.000Z'),
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('tx-gen-123');
      }
      expect(mockCreateExpenseUseCase.execute).toHaveBeenCalledOnce();
      expect(mockCreateExpenseUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          accountId: 'acc-123',
          amount: 500,
          currencyCode: 'INR',
          description: 'Electricity Bill',
          categoryId: 'cat-util',
        })
      );
    });

    it('maps thrown error to Result.failure(RepositoryError)', async () => {
      vi.mocked(mockCreateExpenseUseCase.execute).mockRejectedValue(new Error('Account not found'));

      const result = await adapter.createExpenseTransaction({
        userId: 'user-789',
        accountId: 'acc-missing',
        amount: 500,
        currencyCode: 'INR',
        description: 'Electricity Bill',
        transactionDate: new Date(),
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNKNOWN_PERSISTENCE_ERROR');
        expect(result.error.message).toContain('Account not found');
      }
    });
  });

  describe('verifyTransactionExists', () => {
    it('returns Result.success(true) when valid non-voided transaction exists', async () => {
      const dummyTx = createDummyTransaction('tx-existing-123', false);
      vi.mocked(mockTransactionRepository.getById).mockResolvedValue({ success: true, data: dummyTx });

      const result = await adapter.verifyTransactionExists('tx-existing-123');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(true);
      }
    });

    it('returns Result.success(false) when transaction is missing or voided', async () => {
      vi.mocked(mockTransactionRepository.getById).mockResolvedValue({ success: true, data: null });
      const resultMissing = await adapter.verifyTransactionExists('tx-missing');
      expect(resultMissing.success).toBe(true);
      if (resultMissing.success) {
        expect(resultMissing.data).toBe(false);
      }

      const voidedTx = createDummyTransaction('tx-voided', true);
      vi.mocked(mockTransactionRepository.getById).mockResolvedValue({ success: true, data: voidedTx });
      const resultVoided = await adapter.verifyTransactionExists('tx-voided');
      expect(resultVoided.success).toBe(true);
      if (resultVoided.success) {
        expect(resultVoided.data).toBe(false);
      }
    });
  });

  describe('rollbackExpenseTransaction', () => {
    it('calls VoidTransactionUseCase and returns Result.success(undefined)', async () => {
      vi.mocked(mockVoidTransactionUseCase.execute).mockResolvedValue(undefined);

      const result = await adapter.rollbackExpenseTransaction('tx-auto-001');

      expect(result.success).toBe(true);
      expect(mockVoidTransactionUseCase.execute).toHaveBeenCalledWith('tx-auto-001');
    });

    it('maps thrown void error to Result.failure(RepositoryError)', async () => {
      vi.mocked(mockVoidTransactionUseCase.execute).mockRejectedValue(new Error('Void failed'));

      const result = await adapter.rollbackExpenseTransaction('tx-auto-001');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNKNOWN_PERSISTENCE_ERROR');
        expect(result.error.message).toContain('Void failed');
      }
    });
  });
});
