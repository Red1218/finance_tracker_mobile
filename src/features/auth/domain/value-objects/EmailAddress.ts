import { AuthDomainError } from '../errors/AuthDomainError';

export class EmailAddress {
  public readonly value: string;

  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(value: string) {
    if (!value || typeof value !== 'string' || !EmailAddress.EMAIL_REGEX.test(value.trim())) {
      throw new AuthDomainError('INVALID_EMAIL', `Invalid email address format: "${value}".`);
    }
    this.value = value.trim().toLowerCase();
    Object.freeze(this);
  }

  public equals(other: EmailAddress): boolean {
    return this.value === other.value;
  }
}
