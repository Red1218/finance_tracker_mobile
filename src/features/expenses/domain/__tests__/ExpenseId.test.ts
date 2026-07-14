import { describe, it, expect } from 'vitest';
import { ExpenseId } from '../value-objects/ExpenseId';
import { v4 as uuidv4 } from 'uuid';

describe('ExpenseId', () => {
  it('should create a valid expense id', () => {
    const validUuid = uuidv4();
    const id = new ExpenseId(validUuid);
    expect(id.value).toBe(validUuid);
  });

  it('should fail if uuid is invalid format', () => {
    expect(() => new ExpenseId('invalid-uuid')).toThrow();
  });
});
