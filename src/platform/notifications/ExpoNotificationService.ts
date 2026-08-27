import * as Notifications from 'expo-notifications';
import { INotificationSchedulerPort } from '../../features/preferences/application/ports/INotificationSchedulerPort';
import { INotificationPermissionPort, PermissionStatus } from '../../features/preferences/application/ports/INotificationPermissionPort';
import { NotificationIntent } from '../../features/preferences/domain/value-objects/NotificationIntent';
import { ReminderTime } from '../../features/preferences/domain/value-objects/ReminderTime';
import { INotificationService } from '../../features/preferences/application/services/INotificationService';

export interface NotificationResponseEvent {
  readonly intentId: string;
  readonly category: string;
  readonly payload: Record<string, unknown>;
}

export class ExpoNotificationService implements INotificationService, INotificationSchedulerPort, INotificationPermissionPort {
  constructor() {
    this.configureChannels();
  }

  private async configureChannels(): Promise<void> {
    try {
      await Notifications.setNotificationChannelAsync('bill_reminders', {
        name: 'Bill Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      });
      await Notifications.setNotificationChannelAsync('budget_alerts', {
        name: 'Budget Alerts',
        importance: Notifications.AndroidImportance.HIGH,
      });
      await Notifications.setNotificationChannelAsync('daily_digest', {
        name: 'Daily Spending Digest',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    } catch {
      // Platform fallback if channels not supported (e.g. iOS)
    }
  }

  public async checkPermissionStatus(): Promise<PermissionStatus> {
    const permissions: any = await Notifications.getPermissionsAsync();
    const status = permissions.status || (permissions.granted ? 'granted' : 'denied');
    if (status === 'granted') return 'GRANTED';
    if (status === 'denied') return 'DENIED';
    return 'NOT_REQUESTED';
  }

  public async requestPermission(): Promise<PermissionStatus> {
    const permissions: any = await Notifications.requestPermissionsAsync();
    const status = permissions.status || (permissions.granted ? 'granted' : 'denied');
    if (status === 'granted') return 'GRANTED';
    if (status === 'denied') return 'DENIED';
    return 'NOT_REQUESTED';
  }

  public async scheduleLocalNotification(intent: NotificationIntent): Promise<void> {
    const channelId =
      intent.category === 'BILL_DUE_REMINDER'
        ? 'bill_reminders'
        : intent.category === 'BUDGET_THRESHOLD_ALERT'
          ? 'budget_alerts'
          : 'daily_digest';

    await Notifications.scheduleNotificationAsync({
      identifier: intent.intentId,
      content: {
        title:
          intent.category === 'BILL_DUE_REMINDER'
            ? 'Upcoming Bill Reminder'
            : intent.category === 'BUDGET_THRESHOLD_ALERT'
              ? 'Budget Threshold Alert'
              : 'Daily Spending Summary',
        body: (intent.payload?.message as string) || 'Check your finance tracker for updates.',
        data: {
          intentId: intent.intentId,
          category: intent.category,
          destination: intent.destination,
          ...intent.payload,
        },
        categoryIdentifier: channelId,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: intent.scheduledTime,
        channelId,
      },
    });
  }

  public async cancelNotification(intentId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(intentId);
  }

  public async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  public async scheduleDailyReminder(reminderTime: ReminderTime): Promise<void> {
    const [hours, minutes] = reminderTime.value.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    if (date.getTime() <= Date.now()) {
      date.setDate(date.getDate() + 1);
    }

    await Notifications.scheduleNotificationAsync({
      identifier: 'daily_digest_reminder',
      content: {
        title: 'Daily Spending Summary',
        body: 'Tap to view today\'s spending and upcoming bills.',
        data: { destination: 'DASHBOARD' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
        channelId: 'daily_digest',
      },
    });
  }

  public async cancelDailyReminder(): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync('daily_digest_reminder');
  }

  public subscribeResponseEvents(handler: (event: NotificationResponseEvent) => void): () => void {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data || {};
      handler({
        intentId: (data.intentId as string) || response.notification.request.identifier,
        category: (data.category as string) || 'GENERAL',
        payload: data,
      });
    });

    return () => subscription.remove();
  }
}
