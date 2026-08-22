import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MarkBillPaidUseCase } from '../use-cases/MarkBillPaidUseCase';
import { IBillRepository } from '../ports/IBillRepository';
import { IBillPaymentRepository } from '../ports/IBillPaymentRepository';
import { IBillTransactionPort } from '../ports/IBillTransactionPort';
import { Bill, BillId, BillName, BillAmount, BillDueDate, RecurrenceRule, CurrencyCode, BillPayment, RecurrenceType } from '../../domain';
import { BillApplicationError } from '../errors/BillApplicationError';
import { MarkBillPaidCommand, BillPaymentExecutionMode } from '../dto/MarkBillPaidCommand';
import { RepositoryError } from '../../../../platform/persistence';

describe('MarkBillPaidUseCase', () => {
  let mockBillRepo: IBillRepository;
  let mockPaymentRepo: IBillPaymentRepository;
  let mockTxPort: IBillTransactionPort;

  const paidAt = new Date('2026-08-21T12:00:00.000Z');

  const createTestBill = (id: string = 'bill-100', recurrenceType: RecurrenceType = 'MONTHLY', isArchived: boolean = false): Bill => {
    let bill = new Bill({
      id: new BillId(id),
      userId: 'user-789',
      name: new BillName('Netflix Subscription'),
      amount: new BillAmount(500, new CurrencyCode('INR')),
      recurrence: new RecurrenceRule(recurrenceType, 21),
      nextDueDate: new BillDueDate(new Date('2026-08-21T00:00:00.000Z')),
    });

    if (isArchived) {
      bill = bill.archive(new Date('2026-08-01T00:00:00.000Z'));
    }

    return bill;
  };

  beforeEach(() => {
    mockBillRepo = {
      findById: vi.fn(),
      findUpcoming: vi.fn(),
      save: vi.fn(),
      savePaymentAndBill: vi.fn(),
    };

    mockPaymentRepo = {
      findPaymentByOccurrence: vi.fn(),
      save: vi.fn(),
    };

    mockTxPort = {
      createExpenseTransaction: vi.fn(),
      verifyTransactionExists: vi.fn(),
    };
  });

  it('successfully processes recurring AUTO_CREATE payment', async () => {
    const bill = createTestBill('bill-100', 'MONTHLY');
    vi.mocked(mockBillRepo.findById).mockResolvedValue({ success: true, data: bill });
    vi.mocked(mockPaymentRepo.findPaymentByOccurrence).mockResolvedValue({ success: true, data: null });
    vi.mocked(mockTxPort.createExpenseTransaction).mockResolvedValue({ success: true, data: 'tx-gen-123' });
    vi.mocked(mockBillRepo.savePaymentAndBill).mockResolvedValue({ success: true, data: undefined });

    const useCase = new MarkBillPaidUseCase(mockBillRepo, mockPaymentRepo, mockTxPort);
    const command: MarkBillPaidCommand = {
      billId: 'bill-100',
      amount: 500,
      currencyCode: 'INR',
      executionMode: 'AUTO_CREATE',
      accountId: 'acc-999',
      paidAt,
    };

    const result = await useCase.execute(command);

    expect(result.billId).toBe('bill-100');
    expect(result.occurrenceKey).toBe('2026-08-21');
    expect(result.linkedTransactionId).toBe('tx-gen-123');
    expect(result.isArchived).toBe(false);
    expect(result.updatedNextDueDate).toContain('2026-09-21');

    expect(mockTxPort.createExpenseTransaction).toHaveBeenCalledWith({
      userId: 'user-789',
      accountId: 'acc-999',
      amount: 500,
      currencyCode: 'INR',
      description: 'Netflix Subscription',
      categoryId: null,
      transactionDate: paidAt,
    });

    expect(mockBillRepo.savePaymentAndBill).toHaveBeenCalledOnce();
  });

  it('successfully processes non-recurring (NONE) AUTO_CREATE payment and archives bill', async () => {
    const bill = createTestBill('bill-200', 'NONE');
    vi.mocked(mockBillRepo.findById).mockResolvedValue({ success: true, data: bill });
    vi.mocked(mockPaymentRepo.findPaymentByOccurrence).mockResolvedValue({ success: true, data: null });
    vi.mocked(mockTxPort.createExpenseTransaction).mockResolvedValue({ success: true, data: 'tx-gen-456' });
    vi.mocked(mockBillRepo.savePaymentAndBill).mockResolvedValue({ success: true, data: undefined });

    const useCase = new MarkBillPaidUseCase(mockBillRepo, mockPaymentRepo, mockTxPort);
    const command: MarkBillPaidCommand = {
      billId: 'bill-200',
      amount: 500,
      currencyCode: 'INR',
      executionMode: 'AUTO_CREATE',
      accountId: 'acc-999',
      paidAt,
    };

    const result = await useCase.execute(command);

    expect(result.isArchived).toBe(true);
    expect(result.updatedNextDueDate).toBeNull();
  });

  it('successfully processes LINK_EXISTING mode for valid transaction', async () => {
    const bill = createTestBill('bill-100');
    vi.mocked(mockBillRepo.findById).mockResolvedValue({ success: true, data: bill });
    vi.mocked(mockPaymentRepo.findPaymentByOccurrence).mockResolvedValue({ success: true, data: null });
    vi.mocked(mockTxPort.verifyTransactionExists).mockResolvedValue({ success: true, data: true });
    vi.mocked(mockBillRepo.savePaymentAndBill).mockResolvedValue({ success: true, data: undefined });

    const useCase = new MarkBillPaidUseCase(mockBillRepo, mockPaymentRepo, mockTxPort);
    const command: MarkBillPaidCommand = {
      billId: 'bill-100',
      amount: 500,
      currencyCode: 'INR',
      executionMode: 'LINK_EXISTING',
      transactionId: 'tx-existing-789',
      paidAt,
    };

    const result = await useCase.execute(command);

    expect(result.linkedTransactionId).toBe('tx-existing-789');
    expect(mockTxPort.verifyTransactionExists).toHaveBeenCalledWith('tx-existing-789');
  });

  it('throws TRANSACTION_NOT_FOUND when LINK_EXISTING targets missing transaction', async () => {
    const bill = createTestBill('bill-100');
    vi.mocked(mockBillRepo.findById).mockResolvedValue({ success: true, data: bill });
    vi.mocked(mockPaymentRepo.findPaymentByOccurrence).mockResolvedValue({ success: true, data: null });
    vi.mocked(mockTxPort.verifyTransactionExists).mockResolvedValue({ success: true, data: false });

    const useCase = new MarkBillPaidUseCase(mockBillRepo, mockPaymentRepo, mockTxPort);
    const command: MarkBillPaidCommand = {
      billId: 'bill-100',
      amount: 500,
      currencyCode: 'INR',
      executionMode: 'LINK_EXISTING',
      transactionId: 'tx-missing-999',
      paidAt,
    };

    await expect(useCase.execute(command)).rejects.toThrow(
      new BillApplicationError('TRANSACTION_NOT_FOUND', 'Target transaction "tx-missing-999" not found.')
    );
  });

  it('successfully processes UNLINKED payment', async () => {
    const bill = createTestBill('bill-100');
    vi.mocked(mockBillRepo.findById).mockResolvedValue({ success: true, data: bill });
    vi.mocked(mockPaymentRepo.findPaymentByOccurrence).mockResolvedValue({ success: true, data: null });
    vi.mocked(mockBillRepo.savePaymentAndBill).mockResolvedValue({ success: true, data: undefined });

    const useCase = new MarkBillPaidUseCase(mockBillRepo, mockPaymentRepo, mockTxPort);
    const command: MarkBillPaidCommand = {
      billId: 'bill-100',
      amount: 500,
      currencyCode: 'INR',
      executionMode: 'UNLINKED',
      paidAt,
    };

    const result = await useCase.execute(command);

    expect(result.linkedTransactionId).toBeNull();
    expect(mockTxPort.createExpenseTransaction).not.toHaveBeenCalled();
    expect(mockTxPort.verifyTransactionExists).not.toHaveBeenCalled();
  });

  it('throws BILL_NOT_FOUND when bill does not exist', async () => {
    vi.mocked(mockBillRepo.findById).mockResolvedValue({ success: true, data: null });

    const useCase = new MarkBillPaidUseCase(mockBillRepo, mockPaymentRepo, mockTxPort);
    const command: MarkBillPaidCommand = {
      billId: 'bill-missing',
      amount: 500,
      currencyCode: 'INR',
      executionMode: 'UNLINKED',
    };

    await expect(useCase.execute(command)).rejects.toThrow(
      new BillApplicationError('BILL_NOT_FOUND', 'Bill "bill-missing" not found.')
    );
  });

  it('throws BILL_ALREADY_ARCHIVED when target bill is archived', async () => {
    const archivedBill = createTestBill('bill-archived', 'MONTHLY', true);
    vi.mocked(mockBillRepo.findById).mockResolvedValue({ success: true, data: archivedBill });

    const useCase = new MarkBillPaidUseCase(mockBillRepo, mockPaymentRepo, mockTxPort);
    const command: MarkBillPaidCommand = {
      billId: 'bill-archived',
      amount: 500,
      currencyCode: 'INR',
      executionMode: 'UNLINKED',
    };

    await expect(useCase.execute(command)).rejects.toThrow(
      new BillApplicationError('BILL_ALREADY_ARCHIVED', 'Cannot record payment against archived bill "Netflix Subscription".')
    );
  });

  it('throws ALREADY_PAID_FOR_PERIOD when occurrence has already been paid', async () => {
    const bill = createTestBill('bill-100');
    vi.mocked(mockBillRepo.findById).mockResolvedValue({ success: true, data: bill });
    vi.mocked(mockPaymentRepo.findPaymentByOccurrence).mockResolvedValue({
      success: true,
      data: {} as BillPayment,
    });

    const useCase = new MarkBillPaidUseCase(mockBillRepo, mockPaymentRepo, mockTxPort);
    const command: MarkBillPaidCommand = {
      billId: 'bill-100',
      amount: 500,
      currencyCode: 'INR',
      executionMode: 'UNLINKED',
    };

    await expect(useCase.execute(command)).rejects.toThrow(
      new BillApplicationError('ALREADY_PAID_FOR_PERIOD', 'Bill "Netflix Subscription" has already been paid for occurrence 2026-08-21.')
    );
  });

  it('throws PAYMENT_AMOUNT_MISMATCH when payment amount does not match bill amount', async () => {
    const bill = createTestBill('bill-100');
    vi.mocked(mockBillRepo.findById).mockResolvedValue({ success: true, data: bill });
    vi.mocked(mockPaymentRepo.findPaymentByOccurrence).mockResolvedValue({ success: true, data: null });

    const useCase = new MarkBillPaidUseCase(mockBillRepo, mockPaymentRepo, mockTxPort);
    const command: MarkBillPaidCommand = {
      billId: 'bill-100',
      amount: 400, // Mismatched
      currencyCode: 'INR',
      executionMode: 'UNLINKED',
    };

    await expect(useCase.execute(command)).rejects.toThrow(
      new BillApplicationError('PAYMENT_AMOUNT_MISMATCH', 'Requested payment amount (400 INR) does not match bill amount (500 INR).')
    );
  });

  it('throws INVALID_EXECUTION_MODE when accountId is missing for AUTO_CREATE', async () => {
    const bill = createTestBill('bill-100');
    vi.mocked(mockBillRepo.findById).mockResolvedValue({ success: true, data: bill });
    vi.mocked(mockPaymentRepo.findPaymentByOccurrence).mockResolvedValue({ success: true, data: null });

    const useCase = new MarkBillPaidUseCase(mockBillRepo, mockPaymentRepo, mockTxPort);
    const command: MarkBillPaidCommand = {
      billId: 'bill-100',
      amount: 500,
      currencyCode: 'INR',
      executionMode: 'AUTO_CREATE',
      // accountId missing
    };

    await expect(useCase.execute(command)).rejects.toThrow(
      new BillApplicationError('INVALID_EXECUTION_MODE', 'Account ID is required for AUTO_CREATE mode.')
    );
  });

  it('throws INVALID_EXECUTION_MODE when transactionId is missing for LINK_EXISTING', async () => {
    const bill = createTestBill('bill-100');
    vi.mocked(mockBillRepo.findById).mockResolvedValue({ success: true, data: bill });
    vi.mocked(mockPaymentRepo.findPaymentByOccurrence).mockResolvedValue({ success: true, data: null });

    const useCase = new MarkBillPaidUseCase(mockBillRepo, mockPaymentRepo, mockTxPort);
    const command: MarkBillPaidCommand = {
      billId: 'bill-100',
      amount: 500,
      currencyCode: 'INR',
      executionMode: 'LINK_EXISTING',
      // transactionId missing
    };

    await expect(useCase.execute(command)).rejects.toThrow(
      new BillApplicationError('INVALID_EXECUTION_MODE', 'Transaction ID is required for LINK_EXISTING mode.')
    );
  });

  it('throws INVALID_EXECUTION_MODE for unsupported mode', async () => {
    const bill = createTestBill('bill-100');
    vi.mocked(mockBillRepo.findById).mockResolvedValue({ success: true, data: bill });
    vi.mocked(mockPaymentRepo.findPaymentByOccurrence).mockResolvedValue({ success: true, data: null });

    const useCase = new MarkBillPaidUseCase(mockBillRepo, mockPaymentRepo, mockTxPort);
    const command: MarkBillPaidCommand = {
      billId: 'bill-100',
      amount: 500,
      currencyCode: 'INR',
      executionMode: 'INVALID_MODE' as BillPaymentExecutionMode,
    };

    await expect(useCase.execute(command)).rejects.toThrow(BillApplicationError);
  });

  it('throws TRANSACTION_INTEGRATION_FAILED when transaction creation fails', async () => {
    const bill = createTestBill('bill-100');
    vi.mocked(mockBillRepo.findById).mockResolvedValue({ success: true, data: bill });
    vi.mocked(mockPaymentRepo.findPaymentByOccurrence).mockResolvedValue({ success: true, data: null });
    vi.mocked(mockTxPort.createExpenseTransaction).mockResolvedValue({
      success: false,
      error: new RepositoryError('UNKNOWN_PERSISTENCE_ERROR', 'Database unavailable'),
    });

    const useCase = new MarkBillPaidUseCase(mockBillRepo, mockPaymentRepo, mockTxPort);
    const command: MarkBillPaidCommand = {
      billId: 'bill-100',
      amount: 500,
      currencyCode: 'INR',
      executionMode: 'AUTO_CREATE',
      accountId: 'acc-1',
    };

    await expect(useCase.execute(command)).rejects.toThrow(
      new BillApplicationError('TRANSACTION_INTEGRATION_FAILED', 'Transaction auto-creation failed: Database unavailable')
    );
  });

  it('throws REPOSITORY_ERROR when savePaymentAndBill fails atomically', async () => {
    const bill = createTestBill('bill-100');
    vi.mocked(mockBillRepo.findById).mockResolvedValue({ success: true, data: bill });
    vi.mocked(mockPaymentRepo.findPaymentByOccurrence).mockResolvedValue({ success: true, data: null });
    vi.mocked(mockBillRepo.savePaymentAndBill).mockResolvedValue({
      success: false,
      error: new RepositoryError('UNKNOWN_PERSISTENCE_ERROR', 'Atomic transaction write failed'),
    });

    const useCase = new MarkBillPaidUseCase(mockBillRepo, mockPaymentRepo, mockTxPort);
    const command: MarkBillPaidCommand = {
      billId: 'bill-100',
      amount: 500,
      currencyCode: 'INR',
      executionMode: 'UNLINKED',
    };

    await expect(useCase.execute(command)).rejects.toThrow(
      new BillApplicationError('REPOSITORY_ERROR', 'Atomic payment persistence failed: Atomic transaction write failed')
    );
  });
});
