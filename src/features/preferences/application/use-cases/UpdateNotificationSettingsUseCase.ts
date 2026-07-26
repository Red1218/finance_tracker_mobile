import { IPreferencesRepository } from '../repositories/IPreferencesRepository';
import { INotificationService } from '../services/INotificationService';
import { ReminderTime, NotificationSettings, Preferences } from '../../domain';
import { RepositoryResult, Result } from '../../../../platform/persistence';

export interface UpdateNotificationSettingsRequest {
  budgetAlertsEnabled: boolean;
  dailyReminderEnabled: boolean;
  reminderTime?: string | null;
  userId?: string;
}

export class UpdateNotificationSettingsUseCase {
  constructor(
    private readonly preferencesRepository: IPreferencesRepository,
    private readonly notificationService: INotificationService
  ) {
    Object.freeze(this);
  }

  public async execute(request: UpdateNotificationSettingsRequest): Promise<RepositoryResult<Preferences, Error>> {
    try {
      const reminderTimeVo = request.reminderTime ? new ReminderTime(request.reminderTime) : null;
      const newNotifications = new NotificationSettings({
        budgetAlertsEnabled: request.budgetAlertsEnabled,
        dailyReminderEnabled: request.dailyReminderEnabled,
        reminderTime: reminderTimeVo,
      });

      if (request.dailyReminderEnabled && reminderTimeVo) {
        await this.notificationService.scheduleDailyReminder(reminderTimeVo);
      } else {
        await this.notificationService.cancelDailyReminder();
      }

      const currentResult = await this.preferencesRepository.get(request.userId);
      if (!currentResult.success) {
        return currentResult as RepositoryResult<never, Error>;
      }

      const current = currentResult.data ?? Preferences.createDefault(undefined, request.userId);
      const updated = current.updateNotifications(newNotifications);

      const saveResult = await this.preferencesRepository.save(updated);
      if (!saveResult.success) {
        return saveResult as RepositoryResult<never, Error>;
      }

      return Result.success(updated);
    } catch (e) {
      return Result.failure(e instanceof Error ? e : new Error(String(e)));
    }
  }
}
