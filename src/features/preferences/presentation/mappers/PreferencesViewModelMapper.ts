import { Preferences } from '../../domain';
import { PreferencesDTO } from '../../application/dto/PreferencesDTO';
import { Category } from '../../../categories/domain';
import { AppInfo } from '../../../../platform/system/AppInfoProvider';
import { PreferencesViewModel } from '../models/PreferencesViewModel';

export class PreferencesViewModelMapper {
  public static mapToViewModel(
    preferences: Preferences | PreferencesDTO,
    categories: Category[] = [],
    appInfo?: AppInfo
  ): PreferencesViewModel {
    const isDto = 'theme' in preferences && !('appearance' in preferences);

    const themeVal = isDto ? (preferences as PreferencesDTO).theme : (preferences as Preferences).appearance.theme;
    const currencyCodeVal = isDto ? (preferences as PreferencesDTO).currencyCode : (preferences as Preferences).finance.currencyCode.value;
    const weekStartVal = isDto ? (preferences as PreferencesDTO).weekStart : (preferences as Preferences).finance.weekStart;
    const decimalPrecisionVal = isDto ? (preferences as PreferencesDTO).decimalPrecision : (preferences as Preferences).finance.decimalPrecision;
    const defExpCatId = isDto ? (preferences as PreferencesDTO).defaultExpenseCategoryId : (preferences as Preferences).defaults.defaultExpenseCategoryId?.value ?? null;
    const defIncCatId = isDto ? (preferences as PreferencesDTO).defaultIncomeCategoryId : (preferences as Preferences).defaults.defaultIncomeCategoryId?.value ?? null;
    const budgetAlerts = isDto ? (preferences as PreferencesDTO).budgetAlertsEnabled : (preferences as Preferences).notifications.budgetAlertsEnabled;
    const dailyReminder = isDto ? (preferences as PreferencesDTO).dailyReminderEnabled : (preferences as Preferences).notifications.dailyReminderEnabled;
    const reminderTimeVal = isDto ? (preferences as PreferencesDTO).reminderTime : ((preferences as Preferences).notifications.reminderTime?.value ?? null);

    const expenseCat = categories.find((c) => (c.id ? c.id.value : (c as any).id) === defExpCatId);
    const incomeCat = categories.find((c) => (c.id ? c.id.value : (c as any).id) === defIncCatId);

    return {
      appearance: {
        theme: themeVal as any,
      },
      finance: {
        currencyCode: currencyCodeVal,
        weekStart: weekStartVal as any,
        decimalPrecision: decimalPrecisionVal as any,
      },
      defaults: {
        defaultExpenseCategoryId: defExpCatId,
        defaultIncomeCategoryId: defIncCatId,
        defaultExpenseCategoryName: expenseCat ? (expenseCat.name ? expenseCat.name.value : (expenseCat as any).name) : undefined,
        defaultIncomeCategoryName: incomeCat ? (incomeCat.name ? incomeCat.name.value : (incomeCat as any).name) : undefined,
      },
      notifications: {
        budgetAlertsEnabled: budgetAlerts,
        dailyReminderEnabled: dailyReminder,
        reminderTime: reminderTimeVal,
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
