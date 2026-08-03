import { Preferences } from '../../domain';
import { PreferencesDTO } from '../dto/PreferencesDTO';

export class PreferencesDTOMapper {
  public static toDTO(prefs: Preferences): PreferencesDTO {
    return Object.freeze({
      id: prefs.id.value,
      userId: prefs.userId,
      theme: prefs.appearance.theme,
      currencyCode: prefs.finance.currencyCode.value,
      weekStart: prefs.finance.weekStart,
      decimalPrecision: prefs.finance.decimalPrecision,
      defaultExpenseCategoryId: prefs.defaults.defaultExpenseCategoryId
        ? prefs.defaults.defaultExpenseCategoryId.value
        : null,
      defaultIncomeCategoryId: prefs.defaults.defaultIncomeCategoryId
        ? prefs.defaults.defaultIncomeCategoryId.value
        : null,
      budgetAlertsEnabled: prefs.notifications.budgetAlertsEnabled,
      dailyReminderEnabled: prefs.notifications.dailyReminderEnabled,
      reminderTime: prefs.notifications.reminderTime ? prefs.notifications.reminderTime.value : null,
    });
  }
}
