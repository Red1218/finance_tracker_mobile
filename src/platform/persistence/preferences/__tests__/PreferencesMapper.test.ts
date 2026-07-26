import { describe, it, expect } from 'vitest';
import { PreferencesMapper } from '../PreferencesMapper';
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
} from '../../../../features/preferences/domain';
import { PreferencesRow } from '../../../../features/preferences/contracts';
import { CategoryId } from '../../../../features/categories/domain';

describe('PreferencesMapper', () => {
  it('should map from Row to Domain entity correctly', () => {
    const row: PreferencesRow = {
      id: 'pref-123',
      user_id: 'user-456',
      theme: 'DARK',
      currency_code: 'USD',
      week_start: 'SUNDAY',
      decimal_precision: 0,
      default_expense_category_id: 'cat-exp-1',
      default_income_category_id: 'cat-inc-1',
      budget_alerts_enabled: true,
      daily_reminder_enabled: true,
      reminder_time: '21:30',
    };

    const entity = PreferencesMapper.toDomain(row);

    expect(entity.id.value).toBe('pref-123');
    expect(entity.userId).toBe('user-456');
    expect(entity.appearance.theme).toBe(Theme.Dark);
    expect(entity.finance.currencyCode.value).toBe('USD');
    expect(entity.finance.weekStart).toBe(WeekStart.Sunday);
    expect(entity.finance.decimalPrecision).toBe(DecimalPrecision.Zero);
    expect(entity.defaults.defaultExpenseCategoryId?.value).toBe('cat-exp-1');
    expect(entity.defaults.defaultIncomeCategoryId?.value).toBe('cat-inc-1');
    expect(entity.notifications.budgetAlertsEnabled).toBe(true);
    expect(entity.notifications.dailyReminderEnabled).toBe(true);
    expect(entity.notifications.reminderTime?.value).toBe('21:30');
  });

  it('should map from Domain entity to Row correctly', () => {
    const entity = new Preferences({
      id: new PreferencesId('pref-789'),
      userId: 'user-789',
      appearance: new AppearanceSettings({ theme: Theme.Light }),
      finance: new FinanceSettings({
        currencyCode: new CurrencyCode('EUR'),
        weekStart: WeekStart.Monday,
        decimalPrecision: DecimalPrecision.Two,
      }),
      defaults: new DefaultSettings({
        defaultExpenseCategoryId: new CategoryId('cat-exp-2'),
        defaultIncomeCategoryId: null,
      }),
      notifications: new NotificationSettings({
        budgetAlertsEnabled: false,
        dailyReminderEnabled: false,
        reminderTime: null,
      }),
    });

    const row = PreferencesMapper.toPersistence(entity);

    expect(row).toEqual({
      id: 'pref-789',
      user_id: 'user-789',
      theme: 'LIGHT',
      currency_code: 'EUR',
      week_start: 'MONDAY',
      decimal_precision: 2,
      default_expense_category_id: 'cat-exp-2',
      default_income_category_id: null,
      budget_alerts_enabled: false,
      daily_reminder_enabled: false,
      reminder_time: null,
    });
  });

  describe('Round-trip Symmetry', () => {
    it('should maintain round-trip symmetry: Row -> Domain -> Row', () => {
      const originalRow: PreferencesRow = {
        id: 'pref-rt-1',
        user_id: 'user-rt-1',
        theme: 'SYSTEM',
        currency_code: 'INR',
        week_start: 'MONDAY',
        decimal_precision: 2,
        default_expense_category_id: 'cat-1',
        default_income_category_id: 'cat-2',
        budget_alerts_enabled: true,
        daily_reminder_enabled: true,
        reminder_time: '20:00',
      };

      const entity = PreferencesMapper.toDomain(originalRow);
      const mappedRow = PreferencesMapper.toPersistence(entity);

      expect(mappedRow).toEqual(originalRow);
    });

    it('should maintain round-trip symmetry: Domain -> Row -> Domain', () => {
      const originalEntity = new Preferences({
        id: new PreferencesId('pref-rt-2'),
        userId: 'user-rt-2',
        appearance: new AppearanceSettings({ theme: Theme.Dark }),
        finance: new FinanceSettings({
          currencyCode: new CurrencyCode('GBP'),
          weekStart: WeekStart.Sunday,
          decimalPrecision: DecimalPrecision.Zero,
        }),
        defaults: new DefaultSettings({
          defaultExpenseCategoryId: null,
          defaultIncomeCategoryId: new CategoryId('cat-inc-9'),
        }),
        notifications: new NotificationSettings({
          budgetAlertsEnabled: true,
          dailyReminderEnabled: true,
          reminderTime: new ReminderTime('08:30'),
        }),
      });

      const row = PreferencesMapper.toPersistence(originalEntity);
      const restoredEntity = PreferencesMapper.toDomain(row);

      expect(restoredEntity.id.value).toBe(originalEntity.id.value);
      expect(restoredEntity.userId).toBe(originalEntity.userId);
      expect(restoredEntity.appearance.theme).toBe(originalEntity.appearance.theme);
      expect(restoredEntity.finance.currencyCode.value).toBe(originalEntity.finance.currencyCode.value);
      expect(restoredEntity.finance.weekStart).toBe(originalEntity.finance.weekStart);
      expect(restoredEntity.finance.decimalPrecision).toBe(originalEntity.finance.decimalPrecision);
      expect(restoredEntity.defaults.defaultIncomeCategoryId?.value).toBe(originalEntity.defaults.defaultIncomeCategoryId?.value);
      expect(restoredEntity.notifications.reminderTime?.value).toBe(originalEntity.notifications.reminderTime?.value);
    });
  });
});
