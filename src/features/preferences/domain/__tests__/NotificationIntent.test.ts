import { describe, it, expect } from 'vitest';
import { NotificationIntent } from '../value-objects/NotificationIntent';
import { NotificationDestination } from '../value-objects/NotificationDestination';

describe('NotificationIntent', () => {
  it('creates valid NotificationIntent with frozen properties', () => {
    const now = new Date();
    const intent = new NotificationIntent({
      intentId: 'intent-123',
      category: 'BILL_DUE_REMINDER',
      scheduledTime: now,
      destination: NotificationDestination.BILLS,
      payload: { billId: 'b-1' },
    });

    expect(intent.intentId).toBe('intent-123');
    expect(intent.category).toBe('BILL_DUE_REMINDER');
    expect(intent.destination).toBe(NotificationDestination.BILLS);
    expect(intent.payload).toEqual({ billId: 'b-1' });
    expect(Object.isFrozen(intent)).toBe(true);
  });

  it('throws error if intentId is empty', () => {
    expect(() => new NotificationIntent({
      intentId: '',
      category: 'DAILY_DIGEST',
      scheduledTime: new Date(),
      destination: NotificationDestination.DASHBOARD,
    })).toThrow('NotificationIntent ID is required.');
  });
});
