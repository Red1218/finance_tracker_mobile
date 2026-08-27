import { useState } from 'react';
import { PreferencesController } from '../controllers/PreferencesController';
import { Theme, WeekStart, DecimalPrecision } from '../../domain';
import { authModule as defaultAuthModule, AuthModule } from '../../../auth/composition/AuthModule';
import { useTheme, ThemeMode } from '../../../../shared/theme';

export function useUpdatePreference(
  controller: PreferencesController,
  onSuccess?: () => void,
  authModule: AuthModule = defaultAuthModule
) {
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const { setThemeMode } = useTheme();

  const resolveUserId = async (providedUserId?: string): Promise<string> => {
    if (providedUserId) return providedUserId;
    const session = await authModule.getSessionUseCase.execute();
    if (session && session.isAuthenticated && session.userId) {
      return session.userId;
    }
    throw new Error('Authentication required to update preferences.');
  };

  const executeUpdate = async (updateFn: (userId: string) => Promise<void>, userId?: string) => {
    setIsUpdating(true);
    setUpdateError(null);
    try {
      const targetUserId = await resolveUserId(userId);
      await updateFn(targetUserId);
      onSuccess?.();
    } catch (e) {
      setUpdateError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setIsUpdating(false);
    }
  };

  const updateTheme = (theme: Theme, userId?: string) =>
    executeUpdate(async (uid) => {
      await controller.updateTheme(theme, uid);
      const themeModeStr = String(theme).toUpperCase() as ThemeMode;
      if (['LIGHT', 'DARK', 'SYSTEM'].includes(themeModeStr)) {
        setThemeMode(themeModeStr);
      }
    }, userId);

  const updateCurrency = (currencyCode: string, userId?: string) =>
    executeUpdate((uid) => controller.updateCurrency(currencyCode, uid), userId);

  const updateWeekStart = (weekStart: WeekStart, userId?: string) =>
    executeUpdate((uid) => controller.updateWeekStart(weekStart, uid), userId);

  const updateDecimalPrecision = (decimalPrecision: DecimalPrecision, userId?: string) =>
    executeUpdate((uid) => controller.updateDecimalPrecision(decimalPrecision, uid), userId);

  const updateDefaultExpenseCategory = (categoryId: string | null, userId?: string) =>
    executeUpdate((uid) => controller.updateDefaultExpenseCategory(categoryId, uid), userId);

  const updateDefaultIncomeCategory = (categoryId: string | null, userId?: string) =>
    executeUpdate((uid) => controller.updateDefaultIncomeCategory(categoryId, uid), userId);

  const updateNotificationSettings = (
    data: { budgetAlertsEnabled: boolean; dailyReminderEnabled: boolean; reminderTime?: string | null },
    userId?: string
  ) => executeUpdate((uid) => controller.updateNotificationSettings(data, uid), userId);

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
