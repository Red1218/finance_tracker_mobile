import { AccountDomainError } from '../errors/AccountDomainError';

export class OpeningBalance {
  public readonly value: number;

  constructor(amount: number) {
    if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount)) {
      throw new AccountDomainError(
        'INVALID_OPENING_BALANCE',
        'Opening balance must be a valid number.'
      );
    }

    // Round to 2 decimal places to ensure monetary precision
    this.value = Math.round(amount * 100) / 100;
    Object.freeze(this);
  }

  public equals(other: OpeningBalance): boolean {
    return this.value === other.value;
  }
}
