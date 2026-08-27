import { NotificationIntent } from '../../domain/value-objects/NotificationIntent';

export interface INotificationSchedulerPort {
  scheduleLocalNotification(intent: NotificationIntent): Promise<void>;
  cancelNotification(intentId: string): Promise<void>;
  cancelAllNotifications(): Promise<void>;
}
