import { TransactionDomainError } from '../errors/TransactionDomainError';

export class Money {
  public readonly value: number;

  constructor(amount: number) {
    if (typeof amount !== 'number' || isNaN(amount)) {
      throw new TransactionDomainError('INVALID_AMOUNT', 'Amount must be a valid number.');
    }

    if (amount <= 0) {
      throw new TransactionDomainError('INVALID_AMOUNT', 'Transaction amount must be strictly greater than zero.');
    }

    // Exact integer cent rounding to prevent floating-point representation bugs
    const roundedCents = Math.round(amount * 100);
    this.value = roundedCents / 100;

    Object.freeze(this);
  }

  public add(other: Money): Money {
    const centsA = Math.round(this.value * 100);
    const centsB = Math.round(other.value * 100);
    return new Money((centsA + centsB) / 100);
  }

  public equals(other: Money): boolean {
    return Math.round(this.value * 100) === Math.round(other.value * 100);
  }
}
