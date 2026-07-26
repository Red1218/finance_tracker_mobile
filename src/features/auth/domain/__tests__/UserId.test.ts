import { describe, it, expect } from 'vitest';
import { UserId } from '../value-objects/UserId';
import { AuthDomainError } from '../errors/AuthDomainError';

describe('UserId Value Object', () => {
  it('creates a valid UserId', () => {
    const userId = new UserId('123e4567-e89b-12d3-a456-426614174000');
    expect(userId.value).toBe('123e4567-e89b-12d3-a456-426614174000');
  });

  it('trims whitespace', () => {
    const userId = new UserId('   usr-123   ');
    expect(userId.value).toBe('usr-123');
  });

  it('throws AuthDomainError for empty string', () => {
    expect(() => new UserId('')).toThrow(AuthDomainError);
    expect(() => new UserId('   ')).toThrow(AuthDomainError);
  });

  it('supports equality check', () => {
    const id1 = new UserId('usr-1');
    const id2 = new UserId('usr-1');
    const id3 = new UserId('usr-2');

    expect(id1.equals(id2)).toBe(true);
    expect(id1.equals(id3)).toBe(false);
  });
});
