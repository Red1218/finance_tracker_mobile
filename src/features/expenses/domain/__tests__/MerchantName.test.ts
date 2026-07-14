import { describe, it, expect } from 'vitest';
import { MerchantName } from '../value-objects/MerchantName';

describe('MerchantName', () => {
  it('should create a valid merchant name', () => {
    const merchant = new MerchantName('Amazon');
    expect(merchant.value).toBe('Amazon');
  });

  it('should trim the merchant name', () => {
    const merchant = new MerchantName('  Starbucks  ');
    expect(merchant.value).toBe('Starbucks');
  });

  it('should fail if merchant name exceeds 100 characters', () => {
    const longText = 'a'.repeat(101);
    expect(() => new MerchantName(longText)).toThrow();
  });
});
