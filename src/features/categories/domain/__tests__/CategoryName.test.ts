import { describe, it, expect } from 'vitest';
import { CategoryName } from '../value-objects/CategoryName';
import { CategoryDomainError } from '../errors/CategoryDomainError';

describe('CategoryName', () => {
  it('should store and trim valid names', () => {
    const name = new CategoryName('  Groceries  ');
    expect(name.value).toBe('Groceries');
  });

  it('should throw CategoryDomainError if name is empty', () => {
    expect(() => new CategoryName('')).toThrowError(CategoryDomainError);
    expect(() => new CategoryName('   ')).toThrowError(CategoryDomainError);
  });
});
