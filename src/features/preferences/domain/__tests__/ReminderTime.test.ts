import { describe, it, expect } from 'vitest';
import { ReminderTime } from '../value-objects/ReminderTime';
import { PreferencesDomainError } from '../errors/PreferencesDomainError';

describe('ReminderTime', () => {
  it('should accept valid 24-hour HH:MM strings', () => {
    const t1 = new ReminderTime('08:00');
    const t2 = new ReminderTime('23:59');
    const t3 = new ReminderTime('00:00');

    expect(t1.value).toBe('08:00');
    expect(t2.value).toBe('23:59');
    expect(t3.value).toBe('00:00');
  });

  it('should throw PreferencesDomainError for invalid time formats', () => {
    expect(() => new ReminderTime('24:00')).toThrowError(PreferencesDomainError);
    expect(() => new ReminderTime('8:00')).toThrowError(PreferencesDomainError);
    expect(() => new ReminderTime('invalid')).toThrowError(PreferencesDomainError);
    expect(() => new ReminderTime('12:60')).toThrowError(PreferencesDomainError);
  });
});
