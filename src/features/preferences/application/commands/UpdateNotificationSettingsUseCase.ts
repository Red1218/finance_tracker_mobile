import { NotificationSettings, ReminderTime } from '../../domain';
import { IPreferencesRepository } from '../repositories/IPreferencesRepository';
import { UpdateNotificationSettingsCommand } from './UpdateNotificationSettingsCommand';
import { PreferencesDTO } from '../dto/PreferencesDTO';
import { PreferencesDTOMapper } from '../mappers/PreferencesDTOMapper';
import { PreferencesNotFoundError } from '../errors/PreferencesApplicationError';

export class UpdateNotificationSettingsUseCase {
  constructor(
    private readonly preferencesRepository: IPreferencesRepository,
    _notificationService?: any
  ) {
    Object.freeze(this);
  }

  public async execute(command: UpdateNotificationSettingsCommand): Promise<PreferencesDTO> {
    const getResult = await this.preferencesRepository.get();
    if (!getResult.success || !getResult.data) {
      throw new PreferencesNotFoundError();
    }

    const currentNotifications = getResult.data.notifications;
    const updatedNotifications = new NotificationSettings({
      budgetAlertsEnabled: command.budgetAlertsEnabled ?? currentNotifications.budgetAlertsEnabled,
      dailyReminderEnabled: command.dailyReminderEnabled ?? currentNotifications.dailyReminderEnabled,
      reminderTime: command.reminderTime !== undefined
        ? (command.reminderTime ? new ReminderTime(command.reminderTime) : null)
        : currentNotifications.reminderTime,
    });

    const updated = getResult.data.updateNotifications(updatedNotifications);
    const saveResult = await this.preferencesRepository.save(updated);
    if (!saveResult.success) {
      throw saveResult.error;
    }

    return PreferencesDTOMapper.toDTO(updated);
  }
}
