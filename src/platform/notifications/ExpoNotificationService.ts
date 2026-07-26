import { INotificationService } from '../../features/preferences/application/services/INotificationService';
import { ReminderTime } from '../../features/preferences/domain';

export class ExpoNotificationService implements INotificationService {
  public async scheduleDailyReminder(reminderTime: ReminderTime): Promise<void> {
    // Infrastructure wrapper around Expo Notifications / native alarm APIs
    // Keeps presentation and application 100% platform-agnostic
    const [hours, minutes] = reminderTime.value.split(':').map(Number);
    // In production, delegates to Notifications.scheduleNotificationAsync(...)
  }

  public async cancelDailyReminder(): Promise<void> {
    // In production, delegates to Notifications.cancelAllScheduledNotificationsAsync(...)
  }
}
