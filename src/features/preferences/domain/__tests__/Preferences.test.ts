import { describe, it, expect } from 'vitest';
import { Preferences } from '../entities/Preferences';
import { PreferencesId } from '../value-objects/PreferencesId';
import { AppearanceSettings } from '../value-objects/AppearanceSettings';
import { Theme } from '../value-objects/Theme';
import { FinanceSettings } from '../value-objects/FinanceSettings';
import { CurrencyCode } from '../value-objects/CurrencyCode';
import { WeekStart } from '../value-objects/WeekStart';
import { DecimalPrecision } from '../value-objects/DecimalPrecision';
import { NotificationSettings } from '../value-objects/NotificationSettings';
import { ReminderTime } from '../value-objects/ReminderTime';
import { DefaultSettings } from '../value-objects/DefaultSettings';
import { CategoryId } from '../../../categories/domain';

describe('Preferences Aggregate', () => {
  it('should create default preferences with expected initial values', () => {
    const prefs = Preferences.createDefault();

    expect(prefs.id.value).toBe('default-preferences');
    expect(prefs.userId).toBeNull();
    expect(prefs.appearance.theme).toBe(Theme.System);
    expect(prefs.finance.currencyCode.value).toBe('INR');
    expect(prefs.finance.weekStart).toBe(WeekStart.Monday);
    expect(prefs.finance.decimalPrecision).toBe(DecimalPrecision.Two);
    expect(prefs.notifications.budgetAlertsEnabled).toBe(true);
    expect(prefs.notifications.dailyReminderEnabled).toBe(false);
    expect(prefs.notifications.reminderTime).toBeNull();
    expect(prefs.defaults.defaultExpenseCategoryId).toBeNull();
    expect(prefs.defaults.defaultIncomeCategoryId).toBeNull();
  });

  it('should immutably update appearance settings', () => {
    const original = Preferences.createDefault();
    const newAppearance = new AppearanceSettings({ theme: Theme.Dark });

    const updated = original.updateAppearance(newAppearance);

    expect(updated).not.toBe(original);
    expect(updated.appearance.theme).toBe(Theme.Dark);
    expect(original.appearance.theme).toBe(Theme.System);
  });

  it('should immutably update finance settings', () => {
    const original = Preferences.createDefault();
    const newFinance = new FinanceSettings({
      currencyCode: new CurrencyCode('USD'),
      weekStart: WeekStart.Sunday,
      decimalPrecision: DecimalPrecision.Zero,
    });

    const updated = original.updateFinance(newFinance);

    expect(updated.finance.currencyCode.value).toBe('USD');
    expect(updated.finance.weekStart).toBe(WeekStart.Sunday);
    expect(updated.finance.decimalPrecision).toBe(DecimalPrecision.Zero);
  });

  it('should immutably update default category settings', () => {
    const original = Preferences.createDefault();
    const expenseCatId = new CategoryId('cat-expense-1');
    const incomeCatId = new CategoryId('cat-income-1');

    const newDefaults = new DefaultSettings({
      defaultExpenseCategoryId: expenseCatId,
      defaultIncomeCategoryId: incomeCatId,
    });

    const updated = original.updateDefaults(newDefaults);

    expect(updated.defaults.defaultExpenseCategoryId?.value).toBe('cat-expense-1');
    expect(updated.defaults.defaultIncomeCategoryId?.value).toBe('cat-income-1');
  });

  it('should immutably update notification settings', () => {
    const original = Preferences.createDefault();
    const newNotifications = new NotificationSettings({
      budgetAlertsEnabled: false,
      dailyReminderEnabled: true,
      reminderTime: new ReminderTime('20:30'),
    });

    const updated = original.updateNotifications(newNotifications);

    expect(updated.notifications.budgetAlertsEnabled).toBe(false);
    expect(updated.notifications.dailyReminderEnabled).toBe(true);
    expect(updated.notifications.reminderTime?.value).toBe('20:30');
  });
});
