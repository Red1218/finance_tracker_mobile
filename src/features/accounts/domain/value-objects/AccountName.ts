import { AccountDomainError } from '../errors/AccountDomainError';

export class AccountName {
  public static readonly MAX_LENGTH = 50;
  public readonly value: string;

  constructor(name: string) {
    if (!name || typeof name !== 'string') {
      throw new AccountDomainError(
        'INVALID_ACCOUNT_NAME',
        'Account name is required.'
      );
    }

    const trimmed = name.trim();
    if (trimmed.length === 0) {
      throw new AccountDomainError(
        'INVALID_ACCOUNT_NAME',
        'Account name cannot be empty or whitespace-only.'
      );
    }

    if (trimmed.length > AccountName.MAX_LENGTH) {
      throw new AccountDomainError(
        'INVALID_ACCOUNT_NAME',
        `Account name cannot exceed ${AccountName.MAX_LENGTH} characters.`
      );
    }

    this.value = trimmed;
    Object.freeze(this);
  }

  public equals(other: AccountName): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }
}
