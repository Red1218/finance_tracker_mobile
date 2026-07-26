import { Preferences } from '../../domain';
import { Category } from '../../../categories/domain';
import { AppInfo } from '../../../../platform/system/AppInfoProvider';
import { PreferencesViewModel } from '../models/PreferencesViewModel';

export class PreferencesViewModelMapper {
  public static mapToViewModel(
    preferences: Preferences,
    categories: Category[] = [],
    appInfo?: AppInfo
  ): PreferencesViewModel {
    const expenseCat = categories.find(
      (c) => c.id.value === preferences.defaults.defaultExpenseCategoryId?.value
    );
    const incomeCat = categories.find(
      (c) => c.id.value === preferences.defaults.defaultIncomeCategoryId?.value
    );

    return {
      appearance: {
        theme: preferences.appearance.theme,
      },
      finance: {
        currencyCode: preferences.finance.currencyCode.value,
        weekStart: preferences.finance.weekStart,
        decimalPrecision: preferences.finance.decimalPrecision,
      },
      defaults: {
        defaultExpenseCategoryId: preferences.defaults.defaultExpenseCategoryId?.value ?? null,
        defaultIncomeCategoryId: preferences.defaults.defaultIncomeCategoryId?.value ?? null,
        defaultExpenseCategoryName: expenseCat?.name.value,
        defaultIncomeCategoryName: incomeCat?.name.value,
      },
      notifications: {
        budgetAlertsEnabled: preferences.notifications.budgetAlertsEnabled,
        dailyReminderEnabled: preferences.notifications.dailyReminderEnabled,
        reminderTime: preferences.notifications.reminderTime?.value ?? null,
      },
      about: {
        version: appInfo?.version ?? '1.0.0',
        buildNumber: appInfo?.buildNumber ?? '100',
        repositoryUrl: appInfo?.repositoryUrl ?? 'https://github.com/Red1218/finance_tracker_mobile',
        license: appInfo?.license ?? 'MIT',
      },
    };
  }
}
