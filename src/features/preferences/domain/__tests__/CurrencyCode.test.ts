import { describe, it, expect } from 'vitest';
import { CurrencyCode } from '../value-objects/CurrencyCode';

describe('Preferences CurrencyCode', () => {
  it('should default to INR when instantiated without arguments', () => {
    const currency = new CurrencyCode();
    expect(currency.value).toBe('INR');
  });

  it('should accept valid 3-letter ISO-4217 currency codes', () => {
    expect(new CurrencyCode('INR').value).toBe('INR');
    expect(new CurrencyCode('USD').value).toBe('USD');
    expect(new CurrencyCode('eur').value).toBe('EUR');
  });

  it('should throw for invalid currency codes', () => {
    expect(() => new CurrencyCode('')).toThrow();
    expect(() => new CurrencyCode('US')).toThrow();
    expect(() => new CurrencyCode('USDD')).toThrow();
  });

  it('should test equality correctly', () => {
    const c1 = new CurrencyCode('EUR');
    const c2 = new CurrencyCode('EUR');
    const c3 = new CurrencyCode('USD');

    expect(c1.equals(c2)).toBe(true);
    expect(c1.equals(c3)).toBe(false);
  });
});
