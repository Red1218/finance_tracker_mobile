import { describe, it, expect } from 'vitest';
import { InMemoryBillRepository } from './InMemoryBillRepository';
import { InMemoryBillPaymentRepository } from './InMemoryBillPaymentRepository';
import { Bill, BillId, BillName, BillAmount, BillDueDate, RecurrenceRule, CurrencyCode, BillPayment, BillPaymentId } from '../../domain';
import { Result, RepositoryError } from '../../../../platform/persistence';

describe('InMemoryBillRepository Atomicity', () => {
  it('savePaymentAndBill is atomic: if payment save fails, Bill remains unchanged and no payment is stored', async () => {
    const paymentRepo = new InMemoryBillPaymentRepository();
    const billRepo = new InMemoryBillRepository(paymentRepo);

    const originalBill = new Bill({
      id: new BillId('bill-atomic-1'),
      userId: 'user-789',
      name: new BillName('Rent'),
      amount: new BillAmount(15000, new CurrencyCode('INR')),
      recurrence: new RecurrenceRule('MONTHLY', 1),
      nextDueDate: new BillDueDate(new Date('2026-09-01T00:00:00.000Z')),
    });

    await billRepo.save(originalBill);

    const updatedBill = originalBill.advanceToNextOccurrence(new Date('2026-09-01T10:00:00.000Z'));
    const payment = new BillPayment({
      id: new BillPaymentId('pay-fail-1'),
      billId: originalBill.id,
      occurrenceKey: '2026-09-01',
      userId: 'user-789',
      amount: originalBill.amount,
      paidAt: new Date('2026-09-01T10:00:00.000Z'),
    });

    // Simulate payment repository save failure
    paymentRepo.save = async () => Result.failure(new RepositoryError('UNKNOWN_PERSISTENCE_ERROR', 'Simulated payment save failure'));

    const result = await billRepo.savePaymentAndBill(payment, updatedBill);

    // Operation fails
    expect(result.success).toBe(false);

    // Bill remains in original state (not updated to 2026-10-01)
    const billAfter = await billRepo.findById(originalBill.id);
    expect(billAfter.success).toBe(true);
    if (billAfter.success) {
      expect(billAfter.data?.nextDueDate.value.toISOString()).toBe('2026-09-01T00:00:00.000Z');
    }

    // Payment is not stored
    const paymentAfter = await paymentRepo.findPaymentByOccurrence(originalBill.id, '2026-09-01');
    expect(paymentAfter.success).toBe(true);
    if (paymentAfter.success) {
      expect(paymentAfter.data).toBeNull();
    }
  });
});
