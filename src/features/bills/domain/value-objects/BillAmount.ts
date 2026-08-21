import { CurrencyCode } from './CurrencyCode';
import { BillDomainError } from '../errors/BillDomainError';

export class BillAmount {
  public readonly amount: number;
  public readonly currencyCode: CurrencyCode;

  constructor(amount: number, currencyCode: CurrencyCode) {
    if (typeof amount !== 'number' || isNaN(amount)) {
      throw new BillDomainError('INVALID_AMOUNT', 'Bill amount must be a valid number.');
    }

    if (amount <= 0) {
      throw new BillDomainError('INVALID_AMOUNT', 'Bill amount must be strictly greater than zero.');
    }

    if (!currencyCode) {
      throw new BillDomainError('INVALID_CURRENCY_CODE', 'Bill currency code cannot be empty.');
    }

    // Exact integer cent rounding to eliminate floating point issues
    const roundedCents = Math.round(amount * 100);
    this.amount = roundedCents / 100;
    this.currencyCode = currencyCode;

    Object.freeze(this);
  }

  public equals(other: BillAmount): boolean {
    return (
      Math.round(this.amount * 100) === Math.round(other.amount * 100) &&
      this.currencyCode.equals(other.currencyCode)
    );
  }
}
