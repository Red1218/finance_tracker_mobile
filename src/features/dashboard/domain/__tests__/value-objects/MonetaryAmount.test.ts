import { describe, it, expect } from 'vitest';
import { MonetaryAmount } from '../../value-objects/MonetaryAmount';

describe('MonetaryAmount', () => {
  it('should create a valid instance', () => {
    const amount = new MonetaryAmount(100, 'USD');
    expect(amount.amount).toBe(100);
    expect(amount.currency).toBe('USD');
  });

  it('should throw an error if currency is missing', () => {
    expect(() => new MonetaryAmount(100, '')).toThrow('MonetaryAmount must carry a valid currency code');
    expect(() => new MonetaryAmount(100, '   ')).toThrow('MonetaryAmount must carry a valid currency code');
  });

  it('should add amounts with the same currency', () => {
    const a1 = new MonetaryAmount(100, 'USD');
    const a2 = new MonetaryAmount(50, 'USD');
    const result = a1.add(a2);
    expect(result.amount).toBe(150);
    expect(result.currency).toBe('USD');
  });

  it('should subtract amounts with the same currency', () => {
    const a1 = new MonetaryAmount(100, 'USD');
    const a2 = new MonetaryAmount(30, 'USD');
    const result = a1.subtract(a2);
    expect(result.amount).toBe(70);
    expect(result.currency).toBe('USD');
  });

  it('should throw when adding amounts with different currencies', () => {
    const a1 = new MonetaryAmount(100, 'USD');
    const a2 = new MonetaryAmount(50, 'EUR');
    expect(() => a1.add(a2)).toThrow('Cannot add amounts with different currencies');
  });

  it('should throw when subtracting amounts with different currencies', () => {
    const a1 = new MonetaryAmount(100, 'USD');
    const a2 = new MonetaryAmount(50, 'EUR');
    expect(() => a1.subtract(a2)).toThrow('Cannot subtract amounts with different currencies');
  });
});
