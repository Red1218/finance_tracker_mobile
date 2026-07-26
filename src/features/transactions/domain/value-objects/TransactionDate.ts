import { TransactionDomainError } from '../errors/TransactionDomainError';

export class TransactionDate {
  public readonly value: Date;

  constructor(date: Date | string | number = new Date()) {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      throw new TransactionDomainError('INVALID_AMOUNT', 'Invalid transaction date.');
    }
    this.value = d;
    Object.freeze(this);
  }

  public toISOString(): string {
    return this.value.toISOString();
  }

  public equals(other: TransactionDate): boolean {
    return this.value.getTime() === other.value.getTime();
  }
}
