import { useState } from 'react';
import { PreferencesController } from '../controllers/PreferencesController';
import { Theme, WeekStart, DecimalPrecision } from '../../domain';

export function useUpdatePreference(
  controller: PreferencesController,
  onSuccess?: () => void
) {
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const executeUpdate = async (updateFn: () => Promise<void>) => {
    setIsUpdating(true);
    setUpdateError(null);
    try {
      await updateFn();
      onSuccess?.();
    } catch (e) {
      setUpdateError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setIsUpdating(false);
    }
  };

  const updateTheme = (theme: Theme, userId?: string) =>
    executeUpdate(() => controller.updateTheme(theme, userId));

  const updateCurrency = (currencyCode: string, userId?: string) =>
    executeUpdate(() => controller.updateCurrency(currencyCode, userId));

  const updateWeekStart = (weekStart: WeekStart, userId?: string) =>
    executeUpdate(() => controller.updateWeekStart(weekStart, userId));

  const updateDecimalPrecision = (decimalPrecision: DecimalPrecision, userId?: string) =>
    executeUpdate(() => controller.updateDecimalPrecision(decimalPrecision, userId));

  const updateDefaultExpenseCategory = (categoryId: string | null, userId?: string) =>
    executeUpdate(() => controller.updateDefaultExpenseCategory(categoryId, userId));

  const updateDefaultIncomeCategory = (categoryId: string | null, userId?: string) =>
    executeUpdate(() => controller.updateDefaultIncomeCategory(categoryId, userId));

  const updateNotificationSettings = (
    data: { budgetAlertsEnabled: boolean; dailyReminderEnabled: boolean; reminderTime?: string | null },
    userId?: string
  ) => executeUpdate(() => controller.updateNotificationSettings(data, userId));

  return {
    isUpdating,
    updateError,
    updateTheme,
    updateCurrency,
    updateWeekStart,
    updateDecimalPrecision,
    updateDefaultExpenseCategory,
    updateDefaultIncomeCategory,
    updateNotificationSettings,
  };
}
