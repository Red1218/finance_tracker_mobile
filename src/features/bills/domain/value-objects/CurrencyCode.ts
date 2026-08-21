import { BillDomainError } from '../errors/BillDomainError';

export class CurrencyCode {
  private static readonly ISO_4217_REGEX = /^[A-Z]{3}$/;
  public readonly value: string;

  constructor(code: string = 'INR') {
    if (!code || typeof code !== 'string') {
      throw new BillDomainError(
        'INVALID_CURRENCY_CODE',
        'Currency code is required.'
      );
    }

    const formatted = code.trim().toUpperCase();
    if (!CurrencyCode.ISO_4217_REGEX.test(formatted)) {
      throw new BillDomainError(
        'INVALID_CURRENCY_CODE',
        `Invalid ISO-4217 currency code: "${code}". Must be 3 uppercase letters (e.g. INR, USD, EUR).`
      );
    }

    this.value = formatted;
    Object.freeze(this);
  }

  public equals(other: CurrencyCode): boolean {
    return this.value === other.value;
  }
}
