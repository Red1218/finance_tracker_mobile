import { describe, it, expect } from 'vitest';
import { OpeningBalance } from '../value-objects/OpeningBalance';
import { AccountDomainError } from '../errors/AccountDomainError';

describe('OpeningBalance Value Object', () => {
  it('should round numbers to 2 decimal places', () => {
    const bal1 = new OpeningBalance(1000.505);
    const bal2 = new OpeningBalance(50.1);

    expect(bal1.value).toBe(1000.51);
    expect(bal2.value).toBe(50.1);
  });

  it('should throw AccountDomainError for NaN or non-numeric values', () => {
    expect(() => new OpeningBalance(NaN)).toThrowError(AccountDomainError);
    expect(() => new OpeningBalance(Infinity)).toThrowError(AccountDomainError);
  });
});
