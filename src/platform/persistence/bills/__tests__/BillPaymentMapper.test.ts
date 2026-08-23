import { describe, it, expect } from 'vitest';
import { BillPaymentMapper } from '../BillPaymentMapper';
import { BillPaymentRow } from '../../../../features/bills/contracts/BillPaymentRow';
import { BillPayment, BillPaymentId, BillId, BillAmount, CurrencyCode } from '../../../../features/bills/domain';

describe('BillPaymentMapper', () => {
  const sampleRow: BillPaymentRow = {
    id: 'pay-123',
    bill_id: 'bill-100',
    user_id: 'user-789',
    occurrence_key: '2026-08-21',
    paid_at: '2026-08-21T12:00:00.000Z',
    amount: 500,
    currency_code: 'INR',
    linked_transaction_id: 'tx-555',
    created_at: '2026-08-21T12:00:00.000Z',
  };

  it('maps BillPaymentRow with linked transaction to BillPayment domain entity', () => {
    const payment = BillPaymentMapper.toDomain(sampleRow);

    expect(payment.id.value).toBe('pay-123');
    expect(payment.billId.value).toBe('bill-100');
    expect(payment.userId).toBe('user-789');
    expect(payment.occurrenceKey).toBe('2026-08-21');
    expect(payment.amount.amount).toBe(500);
    expect(payment.amount.currencyCode.value).toBe('INR');
    expect(payment.linkedTransactionId).toBe('tx-555');
  });

  it('maps unlinked BillPaymentRow (linked_transaction_id === null)', () => {
    const unlinkedRow: BillPaymentRow = {
      ...sampleRow,
      linked_transaction_id: null,
    };

    const payment = BillPaymentMapper.toDomain(unlinkedRow);
    expect(payment.linkedTransactionId).toBeNull();
  });

  it('maps BillPayment domain entity to BillPaymentRow persistence object', () => {
    const payment = new BillPayment({
      id: new BillPaymentId('pay-999'),
      billId: new BillId('bill-100'),
      occurrenceKey: '2026-08-21',
      userId: 'user-789',
      paidAt: new Date('2026-08-21T14:30:00.000Z'),
      amount: new BillAmount(500, new CurrencyCode('INR')),
      linkedTransactionId: 'tx-777',
    });

    const row = BillPaymentMapper.toPersistence(payment);

    expect(row.id).toBe('pay-999');
    expect(row.bill_id).toBe('bill-100');
    expect(row.user_id).toBe('user-789');
    expect(row.occurrence_key).toBe('2026-08-21');
    expect(row.amount).toBe(500);
    expect(row.currency_code).toBe('INR');
    expect(row.linked_transaction_id).toBe('tx-777');
    expect(row.paid_at).toBe('2026-08-21T14:30:00.000Z');
  });
});
