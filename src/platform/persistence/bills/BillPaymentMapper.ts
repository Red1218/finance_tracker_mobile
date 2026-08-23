import {
  BillPayment,
  BillPaymentId,
  BillId,
  BillAmount,
  CurrencyCode,
} from '../../../features/bills/domain';
import { BillPaymentRow } from '../../../features/bills/contracts/BillPaymentRow';

export class BillPaymentMapper {
  public static toDomain(row: BillPaymentRow): BillPayment {
    return new BillPayment({
      id: new BillPaymentId(row.id),
      billId: new BillId(row.bill_id),
      userId: row.user_id,
      occurrenceKey: row.occurrence_key,
      paidAt: new Date(row.paid_at),
      amount: new BillAmount(row.amount, new CurrencyCode(row.currency_code ?? 'INR')),
      linkedTransactionId: row.linked_transaction_id ?? null,
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
    });
  }

  public static toPersistence(payment: BillPayment): BillPaymentRow {
    return {
      id: payment.id.value,
      bill_id: payment.billId.value,
      user_id: payment.userId,
      occurrence_key: payment.occurrenceKey,
      paid_at: payment.paidAt.toISOString(),
      amount: payment.amount.amount,
      currency_code: payment.amount.currencyCode.value,
      linked_transaction_id: payment.linkedTransactionId,
      created_at: payment.createdAt.toISOString(),
    };
  }
}
