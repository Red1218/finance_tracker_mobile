import { BillDomainError } from '../errors/BillDomainError';

export class BillPaymentId {
  public readonly value: string;

  constructor(id: string) {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new BillDomainError(
        'INVALID_BILL_PAYMENT_ID',
        'Bill payment identifier cannot be empty.'
      );
    }

    this.value = id.trim();
    Object.freeze(this);
  }

  public equals(other: BillPaymentId): boolean {
    return this.value === other.value;
  }
}
