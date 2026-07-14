import { ExpenseDomainError } from '../errors/ExpenseDomainError';

export class MerchantName {
  public readonly value: string;
  private static readonly MAX_LENGTH = 100;

  constructor(value?: string) {
    const trimmed = value ? value.trim() : '';

    if (trimmed.length > MerchantName.MAX_LENGTH) {
      throw new ExpenseDomainError(
        'INVALID_MERCHANT_NAME_LENGTH',
        `Merchant name cannot exceed ${MerchantName.MAX_LENGTH} characters.`
      );
    }

    this.value = trimmed;
    Object.freeze(this);
  }

  public equals(other: MerchantName): boolean {
    return this.value === other.value;
  }
}
