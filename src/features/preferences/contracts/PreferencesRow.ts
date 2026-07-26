export interface PreferencesRow {
  id: string;
  user_id: string | null;
  theme: string;
  currency_code: string;
  week_start: string;
  decimal_precision: number;
  default_expense_category_id: string | null;
  default_income_category_id: string | null;
  budget_alerts_enabled: boolean;
  daily_reminder_enabled: boolean;
  reminder_time: string | null;
}
