import { describe, it, expect, beforeEach } from 'vitest';
import { UpdateNotificationSettingsUseCase } from '../use-cases/UpdateNotificationSettingsUseCase';
import { InMemoryPreferencesRepository } from './InMemoryPreferencesRepository';
import { MockNotificationService } from './MockNotificationService';
import { PreferencesDomainError } from '../../domain';

describe('UpdateNotificationSettingsUseCase', () => {
  let preferencesRepo: InMemoryPreferencesRepository;
  let notificationService: MockNotificationService;
  let useCase: UpdateNotificationSettingsUseCase;

  beforeEach(() => {
    preferencesRepo = new InMemoryPreferencesRepository();
    notificationService = new MockNotificationService();
    useCase = new UpdateNotificationSettingsUseCase(preferencesRepo, notificationService);
  });

  it('should schedule daily reminder service call when daily reminder is enabled with time', async () => {
    const result = await useCase.execute({
      budgetAlertsEnabled: true,
      dailyReminderEnabled: true,
      reminderTime: '20:00',
    });

    expect(result.success).toBe(true);
    expect(notificationService.scheduledTime?.value).toBe('20:00');
  });

  it('should cancel daily reminder service call when daily reminder is disabled', async () => {
    const result = await useCase.execute({
      budgetAlertsEnabled: true,
      dailyReminderEnabled: false,
      reminderTime: null,
    });

    expect(result.success).toBe(true);
    expect(notificationService.cancelCount).toBe(1);
    expect(notificationService.scheduledTime).toBeNull();
  });

  it('should fail if daily reminder is enabled but reminder time is missing', async () => {
    const result = await useCase.execute({
      budgetAlertsEnabled: true,
      dailyReminderEnabled: true,
      reminderTime: null,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(PreferencesDomainError);
      expect((result.error as PreferencesDomainError).code).toBe('INVALID_NOTIFICATION_SETTINGS');
    }
  });
});
