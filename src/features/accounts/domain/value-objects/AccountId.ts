import { AccountDomainError } from '../errors/AccountDomainError';

export class AccountId {
  public readonly value: string;

  constructor(id: string) {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new AccountDomainError(
        'INVALID_ACCOUNT_ID',
        'Account identifier cannot be empty.'
      );
    }

    this.value = id.trim();
    Object.freeze(this);
  }

  public equals(other: AccountId): boolean {
    return this.value === other.value;
  }
}
