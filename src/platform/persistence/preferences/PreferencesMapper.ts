import {
  Preferences,
  PreferencesId,
  Theme,
  CurrencyCode,
  WeekStart,
  DecimalPrecision,
  ReminderTime,
  AppearanceSettings,
  FinanceSettings,
  DefaultSettings,
  NotificationSettings,
} from '../../../features/preferences/domain';
import { PreferencesRow } from '../../../features/preferences/contracts';
import { CategoryId } from '../../../features/categories/domain';

export class PreferencesMapper {
  public static toDomain(row: PreferencesRow): Preferences {
    const theme = row.theme as Theme;
    const currencyCode = new CurrencyCode(row.currency_code);
    const weekStart = row.week_start as WeekStart;
    const decimalPrecision = row.decimal_precision as DecimalPrecision;
    const reminderTime = row.reminder_time ? new ReminderTime(row.reminder_time) : null;

    const defaultExpenseCategoryId = row.default_expense_category_id
      ? new CategoryId(row.default_expense_category_id)
      : null;
    const defaultIncomeCategoryId = row.default_income_category_id
      ? new CategoryId(row.default_income_category_id)
      : null;

    return new Preferences({
      id: new PreferencesId(row.id),
      userId: row.user_id,
      appearance: new AppearanceSettings({ theme }),
      finance: new FinanceSettings({ currencyCode, weekStart, decimalPrecision }),
      defaults: new DefaultSettings({ defaultExpenseCategoryId, defaultIncomeCategoryId }),
      notifications: new NotificationSettings({
        budgetAlertsEnabled: row.budget_alerts_enabled,
        dailyReminderEnabled: row.daily_reminder_enabled,
        reminderTime,
      }),
    });
  }

  public static toPersistence(entity: Preferences): PreferencesRow {
    return {
      id: entity.id.value,
      user_id: entity.userId,
      theme: entity.appearance.theme,
      currency_code: entity.finance.currencyCode.value,
      week_start: entity.finance.weekStart,
      decimal_precision: entity.finance.decimalPrecision,
      default_expense_category_id: entity.defaults.defaultExpenseCategoryId?.value ?? null,
      default_income_category_id: entity.defaults.defaultIncomeCategoryId?.value ?? null,
      budget_alerts_enabled: entity.notifications.budgetAlertsEnabled,
      daily_reminder_enabled: entity.notifications.dailyReminderEnabled,
      reminder_time: entity.notifications.reminderTime?.value ?? null,
    };
  }
}
