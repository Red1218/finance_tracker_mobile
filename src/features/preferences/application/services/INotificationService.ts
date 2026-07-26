import { ReminderTime } from '../../domain';

export interface INotificationService {
  scheduleDailyReminder(reminderTime: ReminderTime): Promise<void>;
  cancelDailyReminder(): Promise<void>;
}
