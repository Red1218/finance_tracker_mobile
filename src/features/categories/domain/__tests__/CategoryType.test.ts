import { describe, it, expect } from 'vitest';
import { CategoryType } from '../value-objects/CategoryType';

describe('CategoryType', () => {
  it('should define the correct enum values', () => {
    expect(CategoryType.Custom).toBe('CUSTOM');
    expect(CategoryType.Protected).toBe('PROTECTED');
  });
});
