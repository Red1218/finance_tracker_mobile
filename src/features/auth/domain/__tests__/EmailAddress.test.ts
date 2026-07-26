import { describe, it, expect } from 'vitest';
import { EmailAddress } from '../value-objects/EmailAddress';
import { AuthDomainError } from '../errors/AuthDomainError';

describe('EmailAddress Value Object', () => {
  it('creates a valid EmailAddress and normalizes lowercase', () => {
    const email = new EmailAddress('User.Name@Example.COM');
    expect(email.value).toBe('user.name@example.com');
  });

  it('rejects invalid email formats', () => {
    expect(() => new EmailAddress('invalid-email')).toThrow(AuthDomainError);
    expect(() => new EmailAddress('user@domain')).toThrow(AuthDomainError);
    expect(() => new EmailAddress('')).toThrow(AuthDomainError);
  });

  it('supports equality check', () => {
    const email1 = new EmailAddress('test@example.com');
    const email2 = new EmailAddress('TEST@example.com');
    const email3 = new EmailAddress('other@example.com');

    expect(email1.equals(email2)).toBe(true);
    expect(email1.equals(email3)).toBe(false);
  });
});
