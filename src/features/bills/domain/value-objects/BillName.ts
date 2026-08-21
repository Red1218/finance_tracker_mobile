import { BillDomainError } from '../errors/BillDomainError';

export class BillName {
  public readonly value: string;

  constructor(name: string) {
    if (typeof name !== 'string') {
      throw new BillDomainError('INVALID_BILL_NAME', 'Bill name must be a valid string.');
    }

    const trimmed = name.trim();
    if (trimmed.length === 0 || trimmed.length > 100) {
      throw new BillDomainError(
        'INVALID_BILL_NAME',
        'Bill name must be between 1 and 100 characters.'
      );
    }

    this.value = trimmed;
    Object.freeze(this);
  }

  public equals(other: BillName): boolean {
    return this.value === other.value;
  }
}
