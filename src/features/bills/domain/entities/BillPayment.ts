import { BillPaymentId } from '../value-objects/BillPaymentId';
import { BillId } from '../value-objects/BillId';
import { BillAmount } from '../value-objects/BillAmount';
import { BillDomainError } from '../errors/BillDomainError';

export interface BillPaymentProps {
  id: BillPaymentId;
  billId: BillId;
  occurrenceKey: string;
  userId: string;
  paidAt?: Date;
  amount: BillAmount;
  linkedTransactionId?: string | null;
  createdAt?: Date;
}

export class BillPayment {
  public readonly id: BillPaymentId;
  public readonly billId: BillId;
  public readonly occurrenceKey: string;
  public readonly userId: string;
  public readonly paidAt: Date;
  public readonly amount: BillAmount;
  public readonly linkedTransactionId: string | null;
  public readonly createdAt: Date;

  constructor(props: BillPaymentProps) {
    if (!props.occurrenceKey || typeof props.occurrenceKey !== 'string' || props.occurrenceKey.trim().length === 0) {
      throw new BillDomainError('INVALID_DUE_DATE', 'Occurrence key cannot be empty.');
    }

    if (!props.userId || typeof props.userId !== 'string' || props.userId.trim().length === 0) {
      throw new BillDomainError('INVALID_BILL_PAYMENT_ID', 'User identifier cannot be empty.');
    }

    const paidAt = props.paidAt ?? new Date();
    if (!(paidAt instanceof Date) || isNaN(paidAt.getTime())) {
      throw new BillDomainError('INVALID_DUE_DATE', 'Payment date must be a valid date.');
    }

    this.id = props.id;
    this.billId = props.billId;
    this.occurrenceKey = props.occurrenceKey.trim();
    this.userId = props.userId.trim();
    this.paidAt = paidAt;
    this.amount = props.amount;
    this.linkedTransactionId = props.linkedTransactionId ?? null;
    this.createdAt = props.createdAt ?? new Date();

    Object.freeze(this);
  }
}
