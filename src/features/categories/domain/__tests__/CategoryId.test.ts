import { describe, it, expect } from 'vitest';
import { CategoryId } from '../value-objects/CategoryId';

describe('CategoryId', () => {
  it('should store and return the exact identifier value', () => {
    const idValue = '123e4567-e89b-12d3-a456-426614174000';
    const categoryId = new CategoryId(idValue);
    
    expect(categoryId.value).toBe(idValue);
  });
});
