import { ReminderTime } from './ReminderTime';
import { PreferencesDomainError } from '../errors/PreferencesDomainError';

export interface NotificationSettingsProps {
  budgetAlertsEnabled: boolean;
  dailyReminderEnabled: boolean;
  reminderTime: ReminderTime | null;
}

export class NotificationSettings {
  public readonly budgetAlertsEnabled: boolean;
  public readonly dailyReminderEnabled: boolean;
  public readonly reminderTime: ReminderTime | null;

  constructor(props: NotificationSettingsProps) {
    if (props.dailyReminderEnabled && !props.reminderTime) {
      throw new PreferencesDomainError(
        'INVALID_NOTIFICATION_SETTINGS',
        'Reminder time is required when daily reminder is enabled.'
      );
    }

    this.budgetAlertsEnabled = props.budgetAlertsEnabled;
    this.dailyReminderEnabled = props.dailyReminderEnabled;
    this.reminderTime = props.reminderTime;

    Object.freeze(this);
  }

  public static createDefault(): NotificationSettings {
    return new NotificationSettings({
      budgetAlertsEnabled: true,
      dailyReminderEnabled: false,
      reminderTime: null,
    });
  }
}
