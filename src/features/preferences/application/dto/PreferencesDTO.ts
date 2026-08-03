export interface PreferencesDTO {
  id: string;
  userId: string | null;
  theme: string;
  currencyCode: string;
  weekStart: string;
  decimalPrecision: number;
  defaultExpenseCategoryId: string | null;
  defaultIncomeCategoryId: string | null;
  budgetAlertsEnabled: boolean;
  dailyReminderEnabled: boolean;
  reminderTime: string | null;
}
