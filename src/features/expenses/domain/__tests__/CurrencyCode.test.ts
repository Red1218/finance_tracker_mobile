import { describe, it, expect } from 'vitest';
import { CurrencyCode } from '../value-objects/CurrencyCode';

describe('CurrencyCode', () => {
  it('should create a valid currency code', () => {
    const currency = new CurrencyCode('INR');
    expect(currency.value).toBe('INR');
  });

  it('should fail if currency is not supported', () => {
    expect(() => new CurrencyCode('USD')).toThrow();
  });

  it('should test equality correctly', () => {
    const curr1 = new CurrencyCode('INR');
    const curr2 = new CurrencyCode('INR');

    expect(curr1.equals(curr2)).toBe(true);
  });
});
