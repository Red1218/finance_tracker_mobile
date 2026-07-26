import { TransactionDomainError } from '../errors/TransactionDomainError';

export class TransactionDescription {
  public static readonly MAX_LENGTH = 250;
  public readonly value: string;

  constructor(description: string = '') {
    const trimmed = description.trim();
    if (trimmed.length > TransactionDescription.MAX_LENGTH) {
      throw new TransactionDomainError(
        'INVALID_DESCRIPTION',
        `Transaction description cannot exceed ${TransactionDescription.MAX_LENGTH} characters.`
      );
    }
    this.value = trimmed;
    Object.freeze(this);
  }

  public equals(other: TransactionDescription): boolean {
    return this.value === other.value;
  }
}
