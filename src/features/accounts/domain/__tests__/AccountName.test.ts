import { describe, it, expect } from 'vitest';
import { AccountName } from '../value-objects/AccountName';
import { AccountDomainError } from '../errors/AccountDomainError';

describe('AccountName Value Object', () => {
  it('should create valid AccountName trimming surrounding whitespace', () => {
    const name = new AccountName('  HDFC Savings  ');
    expect(name.value).toBe('HDFC Savings');
  });

  it('should throw AccountDomainError for empty or whitespace-only names', () => {
    expect(() => new AccountName('')).toThrowError(AccountDomainError);
    expect(() => new AccountName('   ')).toThrowError(AccountDomainError);
  });

  it('should throw AccountDomainError for names exceeding maximum length', () => {
    const longName = 'A'.repeat(51);
    expect(() => new AccountName(longName)).toThrowError(AccountDomainError);
  });

  it('should compare names case-insensitively', () => {
    const name1 = new AccountName('HDFC Bank');
    const name2 = new AccountName('hdfc bank');
    expect(name1.equals(name2)).toBe(true);
  });
});
