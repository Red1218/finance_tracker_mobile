import { INotificationService } from '../services/INotificationService';
import { ReminderTime } from '../../domain';

export class MockNotificationService implements INotificationService {
  public scheduledTime: ReminderTime | null = null;
  public cancelCount = 0;

  async scheduleDailyReminder(reminderTime: ReminderTime): Promise<void> {
    this.scheduledTime = reminderTime;
  }

  async cancelDailyReminder(): Promise<void> {
    this.scheduledTime = null;
    this.cancelCount++;
  }
}
