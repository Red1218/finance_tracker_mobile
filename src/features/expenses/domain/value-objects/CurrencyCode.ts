import { ExpenseDomainError } from '../errors/ExpenseDomainError';

export type SupportedCurrency = 'INR';

export class CurrencyCode {
  public readonly value: SupportedCurrency;
  
  private static readonly SUPPORTED_CURRENCIES = new Set<string>(['INR']);

  constructor(value: string = 'INR') {
    const code = value.trim().toUpperCase();

    if (!CurrencyCode.SUPPORTED_CURRENCIES.has(code)) {
      throw new ExpenseDomainError(
        'INVALID_CURRENCY',
        `Currency code '${code}' is not supported. Supported currencies: ${Array.from(CurrencyCode.SUPPORTED_CURRENCIES).join(', ')}.`
      );
    }

    this.value = code as SupportedCurrency;
    Object.freeze(this);
  }

  public equals(other: CurrencyCode): boolean {
    return this.value === other.value;
  }
}
