import { describe, it, expect } from 'vitest';
import { Money } from '../value-objects/Money';
import { TransactionDomainError } from '../errors/TransactionDomainError';

describe('Money Value Object', () => {
  it('should accept valid positive monetary amounts', () => {
    const m = new Money(250.5);
    expect(m.value).toBe(250.5);
  });

  it('should round amounts to 2 decimal places using exact cent math', () => {
    const m = new Money(10.556);
    expect(m.value).toBe(10.56);
  });

  it('should reject zero or negative amounts', () => {
    expect(() => new Money(0)).toThrow(TransactionDomainError);
    expect(() => new Money(-50)).toThrow(TransactionDomainError);
  });

  it('should accurately perform addition without floating-point errors', () => {
    const m1 = new Money(0.1);
    const m2 = new Money(0.2);
    const sum = m1.add(m2);
    expect(sum.value).toBe(0.3);
  });
});
