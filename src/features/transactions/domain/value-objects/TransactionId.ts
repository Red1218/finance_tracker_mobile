import { TransactionDomainError } from '../errors/TransactionDomainError';

export class TransactionId {
  public readonly value: string;

  constructor(id: string) {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new TransactionDomainError('TRANSACTION_NOT_FOUND', 'Transaction ID cannot be empty.');
    }
    this.value = id.trim();
    Object.freeze(this);
  }

  public equals(other: TransactionId): boolean {
    return this.value === other.value;
  }
}
