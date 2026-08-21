import { describe, it, expect } from 'vitest';
import { BillPayment, BillPaymentProps } from '../entities/BillPayment';
import { BillPaymentId } from '../value-objects/BillPaymentId';
import { BillId } from '../value-objects/BillId';
import { BillAmount } from '../value-objects/BillAmount';
import { CurrencyCode } from '../../../accounts/domain';
import { BillDomainError } from '../errors/BillDomainError';

describe('BillPayment Entity', () => {
  const createValidProps = (): BillPaymentProps => ({
    id: new BillPaymentId('pay-123'),
    billId: new BillId('bill-456'),
    occurrenceKey: '2026-08-21',
    userId: 'user-789',
    paidAt: new Date('2026-08-21T12:00:00.000Z'),
    amount: new BillAmount(500, new CurrencyCode('INR')),
    linkedTransactionId: 'tx-999',
  });

  describe('Instantiation & Invariants', () => {
    it('instantiates a valid BillPayment entity', () => {
      const props = createValidProps();
      const payment = new BillPayment(props);

      expect(payment.id.value).toBe('pay-123');
      expect(payment.billId.value).toBe('bill-456');
      expect(payment.occurrenceKey).toBe('2026-08-21');
      expect(payment.userId).toBe('user-789');
      expect(payment.amount.amount).toBe(500);
      expect(payment.linkedTransactionId).toBe('tx-999');
    });

    it('rejects invalid BillPaymentId', () => {
      expect(() => new BillPaymentId('')).toThrow(BillDomainError);
      expect(() => new BillPaymentId('   ')).toThrow('Bill payment identifier cannot be empty.');
    });

    it('rejects empty occurrenceKey', () => {
      const props = { ...createValidProps(), occurrenceKey: '   ' };
      expect(() => new BillPayment(props)).toThrow('Occurrence key cannot be empty.');
    });

    it('rejects empty userId', () => {
      const props = { ...createValidProps(), userId: '' };
      expect(() => new BillPayment(props)).toThrow('User identifier cannot be empty.');
    });

    it('allows unlinked payment (linkedTransactionId === null)', () => {
      const props = { ...createValidProps(), linkedTransactionId: null };
      const payment = new BillPayment(props);

      expect(payment.linkedTransactionId).toBeNull();
    });
  });
});
