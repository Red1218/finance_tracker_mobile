import { describe, it, expect, beforeEach } from 'vitest';
import { UpdateNotificationSettingsUseCase } from '../commands/UpdateNotificationSettingsUseCase';
import { InitializePreferencesUseCase } from '../commands/InitializePreferencesUseCase';
import { InMemoryPreferencesRepository } from './InMemoryPreferencesRepository';
import { MockNotificationService } from './MockNotificationService';

describe('UpdateNotificationSettingsUseCase', () => {
  let preferencesRepo: InMemoryPreferencesRepository;
  let notificationService: MockNotificationService;
  let initUseCase: InitializePreferencesUseCase;
  let useCase: UpdateNotificationSettingsUseCase;

  beforeEach(async () => {
    preferencesRepo = new InMemoryPreferencesRepository();
    notificationService = new MockNotificationService();
    initUseCase = new InitializePreferencesUseCase(preferencesRepo);
    await initUseCase.execute('user-notif-1');

    useCase = new UpdateNotificationSettingsUseCase(preferencesRepo, notificationService);
  });

  it('should update notification settings when valid reminder time is provided', async () => {
    const dto = await useCase.execute({
      budgetAlertsEnabled: true,
      dailyReminderEnabled: true,
      reminderTime: '20:00',
      userId: 'user-notif-1',
    });

    expect(dto.budgetAlertsEnabled).toBe(true);
    expect(dto.dailyReminderEnabled).toBe(true);
    expect(dto.reminderTime).toBe('20:00');
  });

  it('should update daily reminder setting to disabled', async () => {
    const dto = await useCase.execute({
      budgetAlertsEnabled: true,
      dailyReminderEnabled: false,
      reminderTime: null,
      userId: 'user-notif-1',
    });

    expect(dto.dailyReminderEnabled).toBe(false);
    expect(dto.reminderTime).toBeNull();
  });

  it('should fail if daily reminder is enabled but reminder time is invalid format', async () => {
    await expect(
      useCase.execute({
        budgetAlertsEnabled: true,
        dailyReminderEnabled: true,
        reminderTime: 'invalid-time',
        userId: 'user-notif-1',
      })
    ).rejects.toThrow();
  });
});
