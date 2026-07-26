import { describe, it, expect } from 'vitest';
import { NotificationSettings } from '../value-objects/NotificationSettings';
import { ReminderTime } from '../value-objects/ReminderTime';
import { PreferencesDomainError } from '../errors/PreferencesDomainError';

describe('NotificationSettings', () => {
  it('should create valid notification settings when daily reminder is disabled without reminder time', () => {
    const settings = new NotificationSettings({
      budgetAlertsEnabled: true,
      dailyReminderEnabled: false,
      reminderTime: null,
    });

    expect(settings.dailyReminderEnabled).toBe(false);
    expect(settings.reminderTime).toBeNull();
  });

  it('should create valid notification settings when daily reminder is enabled with reminder time', () => {
    const settings = new NotificationSettings({
      budgetAlertsEnabled: true,
      dailyReminderEnabled: true,
      reminderTime: new ReminderTime('21:00'),
    });

    expect(settings.dailyReminderEnabled).toBe(true);
    expect(settings.reminderTime?.value).toBe('21:00');
  });

  it('should throw PreferencesDomainError when daily reminder is enabled but reminder time is missing', () => {
    expect(() => {
      new NotificationSettings({
        budgetAlertsEnabled: true,
        dailyReminderEnabled: true,
        reminderTime: null,
      });
    }).toThrowError(PreferencesDomainError);
  });
});
