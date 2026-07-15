import { describe, it, expect } from 'vitest';
import { CategoryDomainError } from '../errors/CategoryDomainError';

describe('CategoryDomainError', () => {
  it('should store the code and message correctly', () => {
    const error = new CategoryDomainError('INVALID_NAME', 'Test message');
    
    expect(error).toBeInstanceOf(Error);
    expect(error.code).toBe('INVALID_NAME');
    expect(error.message).toBe('Test message');
    expect(error.name).toBe('CategoryDomainError');
  });
});
