import { describe, it, expect } from 'vitest';
import { CurrencyCode } from '../value-objects/CurrencyCode';

describe('CurrencyCode', () => {
  it('should default to INR when instantiated without arguments', () => {
    const currency = new CurrencyCode();
    expect(currency.value).toBe('INR');
  });

  it('should accept valid ISO-4217 currency codes', () => {
    expect(new CurrencyCode('INR').value).toBe('INR');
    expect(new CurrencyCode('USD').value).toBe('USD');
    expect(new CurrencyCode('eur').value).toBe('EUR');
    expect(new CurrencyCode(' gbp ').value).toBe('GBP');
  });

  it('should fail if currency code is not a valid 3-letter ISO-4217 code', () => {
    expect(() => new CurrencyCode('US')).toThrow();
    expect(() => new CurrencyCode('USDD')).toThrow();
    expect(() => new CurrencyCode('123')).toThrow();
    expect(() => new CurrencyCode('')).toThrow();
  });

  it('should test equality correctly', () => {
    const curr1 = new CurrencyCode('USD');
    const curr2 = new CurrencyCode('USD');
    const curr3 = new CurrencyCode('INR');

    expect(curr1.equals(curr2)).toBe(true);
    expect(curr1.equals(curr3)).toBe(false);
  });
});

