import { describe, it, expect } from 'vitest';
import { PaymentMethod } from '../value-objects/PaymentMethod';

describe('PaymentMethod', () => {
  it('should create a valid payment method', () => {
    const method = new PaymentMethod('CASH');
    expect(method.value).toBe('CASH');
  });

  it('should fail if payment method is not supported', () => {
    expect(() => new PaymentMethod('BITCOIN' as any)).toThrow();
  });
});
