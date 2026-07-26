import { describe, it, expect } from 'vitest';
import { PreferencesViewModelMapper } from '../mappers/PreferencesViewModelMapper';
import { Preferences, PreferencesId, Theme, CurrencyCode, WeekStart, DecimalPrecision, ReminderTime, AppearanceSettings, FinanceSettings, DefaultSettings, NotificationSettings } from '../../domain';
import { Category, CategoryId, CategoryName, CategoryKind } from '../../../categories/domain';

describe('PreferencesViewModelMapper', () => {
  it('should map Preferences entity to PreferencesViewModel correctly', () => {
    const pref = new Preferences({
      id: new PreferencesId('p-1'),
      userId: 'user-1',
      appearance: new AppearanceSettings({ theme: Theme.Dark }),
      finance: new FinanceSettings({
        currencyCode: new CurrencyCode('INR'),
        weekStart: WeekStart.Monday,
        decimalPrecision: DecimalPrecision.Two,
      }),
      defaults: new DefaultSettings({
        defaultExpenseCategoryId: new CategoryId('cat-exp-1'),
        defaultIncomeCategoryId: null,
      }),
      notifications: new NotificationSettings({
        budgetAlertsEnabled: true,
        dailyReminderEnabled: true,
        reminderTime: new ReminderTime('20:00'),
      }),
    });

    const expenseCategory = new Category({
      id: new CategoryId('cat-exp-1'),
      name: new CategoryName('Groceries'),
      kind: CategoryKind.Expense,
      isSystem: false,
      archivedAt: null,
    });

    const appInfo = {
      version: '1.2.0',
      buildNumber: '120',
      repositoryUrl: 'https://github.com/example/repo',
      license: 'MIT',
    };

    const vm = PreferencesViewModelMapper.mapToViewModel(pref, [expenseCategory], appInfo);

    expect(vm.appearance.theme).toBe(Theme.Dark);
    expect(vm.finance.currencyCode).toBe('INR');
    expect(vm.finance.weekStart).toBe(WeekStart.Monday);
    expect(vm.finance.decimalPrecision).toBe(DecimalPrecision.Two);
    expect(vm.defaults.defaultExpenseCategoryId).toBe('cat-exp-1');
    expect(vm.defaults.defaultExpenseCategoryName).toBe('Groceries');
    expect(vm.defaults.defaultIncomeCategoryId).toBeNull();
    expect(vm.notifications.budgetAlertsEnabled).toBe(true);
    expect(vm.notifications.dailyReminderEnabled).toBe(true);
    expect(vm.notifications.reminderTime).toBe('20:00');
    expect(vm.about.version).toBe('1.2.0');
    expect(vm.about.buildNumber).toBe('120');
  });
});
