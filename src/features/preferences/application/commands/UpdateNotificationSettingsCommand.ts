export interface UpdateNotificationSettingsCommand {
  budgetAlertsEnabled?: boolean;
  dailyReminderEnabled?: boolean;
  reminderTime?: string | null;
  userId?: string;
}
