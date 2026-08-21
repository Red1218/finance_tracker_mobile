import { BillDomainError } from '../errors/BillDomainError';

export class BillId {
  public readonly value: string;

  constructor(id: string) {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new BillDomainError(
        'INVALID_BILL_ID',
        'Bill identifier cannot be empty.'
      );
    }

    this.value = id.trim();
    Object.freeze(this);
  }

  public equals(other: BillId): boolean {
    return this.value === other.value;
  }
}
