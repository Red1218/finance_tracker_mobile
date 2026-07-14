import { describe, it, expect } from 'vitest';
import { CategoryDomainError } from '../errors/CategoryDomainError';

describe('CategoryDomainError', () => {
  it('should store the code and message correctly', () => {
    const error = new CategoryDomainError('TEST_CODE', 'Test message');
    
    expect(error).toBeInstanceOf(Error);
    expect(error.code).toBe('TEST_CODE');
    expect(error.message).toBe('Test message');
    expect(error.name).toBe('CategoryDomainError');
  });
});
