import { AuthDomainError } from '../errors/AuthDomainError';

export class UserId {
  public readonly value: string;

  constructor(value: string) {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      throw new AuthDomainError('INVALID_USER_ID', 'User ID must be a non-empty string.');
    }
    this.value = value.trim();
    Object.freeze(this);
  }

  public equals(other: UserId): boolean {
    return this.value === other.value;
  }
}
