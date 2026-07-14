import { describe, it, expect } from 'vitest';
import { ExpenseNote } from '../value-objects/ExpenseNote';

describe('ExpenseNote', () => {
  it('should create a valid note', () => {
    const note = new ExpenseNote('Dinner with friends');
    expect(note.value).toBe('Dinner with friends');
  });

  it('should fail if note exceeds 500 characters', () => {
    const longText = 'a'.repeat(501);
    expect(() => new ExpenseNote(longText)).toThrow();
  });

  it('should trim note text', () => {
    const note = new ExpenseNote('  some note  ');
    expect(note.value).toBe('some note');
  });
});
