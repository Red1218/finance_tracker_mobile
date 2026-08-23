import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BillsModule } from '../../composition/BillsModule';
import { InMemoryBillRepository } from '../../application/__tests__/InMemoryBillRepository';
import { InMemoryBillPaymentRepository } from '../../application/__tests__/InMemoryBillPaymentRepository';
import { Bill, BillId, BillName, BillAmount, BillDueDate, RecurrenceRule, CurrencyCode } from '../../domain';
import { IBillTransactionPort } from '../../application/ports/IBillTransactionPort';
import { Result } from '../../../../platform/persistence';
import { BillApplicationError } from '../../application/errors/BillApplicationError';

describe('Bills Lifecycle Integration Test', () => {
  let inMemoryBillRepo: InMemoryBillRepository;
  let inMemoryPaymentRepo: InMemoryBillPaymentRepository;
  let mockTxPort: IBillTransactionPort;
  let billsModule: BillsModule;

  const paidAt = new Date('2026-08-21T12:00:00.000Z');

  const createTestBill = (
    id: string = 'bill-100',
    recurrenceType: 'MONTHLY' | 'NONE' = 'MONTHLY',
    dueDate: Date = new Date('2026-08-21T00:00:00.000Z')
  ): Bill => {
    return new Bill({
      id: new BillId(id),
      userId: 'user-789',
      name: new BillName('Electricity Bill'),
      amount: new BillAmount(1500, new CurrencyCode('INR')),
      recurrence: new RecurrenceRule(recurrenceType, 21),
      nextDueDate: new BillDueDate(dueDate),
    });
  };

  beforeEach(() => {
    inMemoryPaymentRepo = new InMemoryBillPaymentRepository();
    inMemoryBillRepo = new InMemoryBillRepository(inMemoryPaymentRepo);

    mockTxPort = {
      createExpenseTransaction: vi.fn().mockResolvedValue(Result.success('tx-auto-001')),
      verifyTransactionExists: vi.fn().mockResolvedValue(Result.success(true)),
      rollbackExpenseTransaction: vi.fn().mockResolvedValue(Result.success(undefined)),
    };

    billsModule = new BillsModule({
      billRepository: inMemoryBillRepo,
      billPaymentRepository: inMemoryPaymentRepo,
      billTransactionPort: mockTxPort,
    });
  });

  it('AUTO_CREATE happy path: creates transaction, advances recurring bill, records payment', async () => {
    const bill = createTestBill('bill-auto-1', 'MONTHLY');
    await inMemoryBillRepo.save(bill);

    const result = await billsModule.markBillPaidUseCase.execute({
      billId: 'bill-auto-1',
      amount: 1500,
      currencyCode: 'INR',
      executionMode: 'AUTO_CREATE',
      accountId: 'acc-main',
      paidAt,
    });

    expect(result.paymentId).toBeDefined();
    expect(result.linkedTransactionId).toBe('tx-auto-001');

    // Verify transaction created via port
    expect(mockTxPort.createExpenseTransaction).toHaveBeenCalledOnce();

    // Verify payment stored
    const paymentResult = await inMemoryPaymentRepo.findPaymentByOccurrence(new BillId('bill-auto-1'), '2026-08-21');
    expect(paymentResult.success).toBe(true);
    if (paymentResult.success) {
      expect(paymentResult.data?.linkedTransactionId).toBe('tx-auto-001');
    }

    // Verify bill advanced to next month (Sept 21)
    const updatedBillResult = await inMemoryBillRepo.findById(new BillId('bill-auto-1'));
    expect(updatedBillResult.success).toBe(true);
    if (updatedBillResult.success) {
      expect(updatedBillResult.data?.nextDueDate.value.toISOString()).toBe('2026-09-21T00:00:00.000Z');
    }
  });

  it('AUTO_CREATE atomic failure: triggers transaction rollback when payment save fails', async () => {
    const bill = createTestBill('bill-fail-1', 'MONTHLY');
    await inMemoryBillRepo.save(bill);

    // Force savePaymentAndBill to fail
    vi.spyOn(inMemoryBillRepo, 'savePaymentAndBill').mockResolvedValueOnce(
      Result.failure(new (await import('../../../../platform/persistence')).RepositoryError('UNKNOWN_PERSISTENCE_ERROR', 'Simulated RPC failure'))
    );

    await expect(
      billsModule.markBillPaidUseCase.execute({
        billId: 'bill-fail-1',
        amount: 1500,
        currencyCode: 'INR',
        executionMode: 'AUTO_CREATE',
        accountId: 'acc-main',
        paidAt,
      })
    ).rejects.toThrow(BillApplicationError);

    // Compensation triggered
    expect(mockTxPort.rollbackExpenseTransaction).toHaveBeenCalledWith('tx-auto-001');
  });

  it('LINK_EXISTING happy path: verifies existing transaction, advances bill, records linked payment', async () => {
    const bill = createTestBill('bill-link-1', 'MONTHLY');
    await inMemoryBillRepo.save(bill);

    const result = await billsModule.markBillPaidUseCase.execute({
      billId: 'bill-link-1',
      amount: 1500,
      currencyCode: 'INR',
      executionMode: 'LINK_EXISTING',
      transactionId: 'tx-user-existing-555',
      paidAt,
    });

    expect(result.paymentId).toBeDefined();
    expect(result.linkedTransactionId).toBe('tx-user-existing-555');
    expect(mockTxPort.verifyTransactionExists).toHaveBeenCalledWith('tx-user-existing-555');
  });

  it('UNLINKED happy path: records payment without touching transactions context', async () => {
    const bill = createTestBill('bill-unlink-1', 'MONTHLY');
    await inMemoryBillRepo.save(bill);

    const result = await billsModule.markBillPaidUseCase.execute({
      billId: 'bill-unlink-1',
      amount: 1500,
      currencyCode: 'INR',
      executionMode: 'UNLINKED',
      paidAt,
    });

    expect(result.paymentId).toBeDefined();
    expect(result.linkedTransactionId).toBeNull();
    expect(mockTxPort.createExpenseTransaction).not.toHaveBeenCalled();
    expect(mockTxPort.verifyTransactionExists).not.toHaveBeenCalled();
  });

  it('occurrence idempotency: rejects duplicate payment for same cycle occurrence', async () => {
    const bill = createTestBill('bill-idempotent-1', 'MONTHLY');
    await inMemoryBillRepo.save(bill);

    // Pre-seed a payment for occurrence 2026-08-21
    const existingPayment = new (await import('../../domain')).BillPayment({
      id: new (await import('../../domain')).BillPaymentId('pay-exist'),
      billId: bill.id,
      occurrenceKey: '2026-08-21',
      userId: 'user-789',
      amount: bill.amount,
      paidAt,
    });
    await inMemoryPaymentRepo.save(existingPayment);

    // Payment attempt for same occurrence key throws ALREADY_PAID_FOR_PERIOD
    await expect(
      billsModule.markBillPaidUseCase.execute({
        billId: 'bill-idempotent-1',
        amount: 1500,
        currencyCode: 'INR',
        executionMode: 'UNLINKED',
        paidAt,
      })
    ).rejects.toThrow(BillApplicationError);
  });

  it('non-recurring bill (NONE): is archived after payment settlement', async () => {
    const bill = createTestBill('bill-single-1', 'NONE');
    await inMemoryBillRepo.save(bill);

    await billsModule.markBillPaidUseCase.execute({
      billId: 'bill-single-1',
      amount: 1500,
      currencyCode: 'INR',
      executionMode: 'UNLINKED',
      paidAt,
    });

    const updatedBillResult = await inMemoryBillRepo.findById(new BillId('bill-single-1'));
    expect(updatedBillResult.success).toBe(true);
    if (updatedBillResult.success) {
      expect(updatedBillResult.data?.isArchived).toBe(true);
    }
  });

  it('overdue bills: all overdue bills remain visible in findUpcoming without lower date bound', async () => {
    const asOfDate = new Date('2026-08-21T12:00:00.000Z');

    // Bill due in 5 days
    const upcomingBill = createTestBill('bill-up-1', 'MONTHLY', new Date('2026-08-26T00:00:00.000Z'));
    // Bill overdue by 60 days
    const overdueBill = createTestBill('bill-over-1', 'MONTHLY', new Date('2026-06-22T00:00:00.000Z'));

    await inMemoryBillRepo.save(upcomingBill);
    await inMemoryBillRepo.save(overdueBill);

    const dtos = await billsModule.getUpcomingBillsUseCase.execute({
      userId: 'user-789',
      asOfDate,
      windowDays: 30,
    });

    expect(dtos).toHaveLength(2);
    // Overdue bill comes first chronologically
    expect(dtos[0].billId).toBe('bill-over-1');
    expect(dtos[0].status).toBe('Overdue');
    expect(dtos[0].urgency).toBe('critical');

    expect(dtos[1].billId).toBe('bill-up-1');
    expect(dtos[1].status).toBe('Upcoming');
  });
});
