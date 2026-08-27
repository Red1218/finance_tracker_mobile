import { useState, useEffect, useCallback } from 'react';
import { PreferencesController } from '../controllers/PreferencesController';
import { Category } from '../../../categories/domain';
import { PreferencesViewModel } from '../models/PreferencesViewModel';
import { authModule as defaultAuthModule, AuthModule } from '../../../auth/composition/AuthModule';
import { useTheme, ThemeMode } from '../../../../shared/theme';

export function usePreferences(
  controller: PreferencesController,
  userIdProp?: string,
  authModule: AuthModule = defaultAuthModule
) {
  const [viewModel, setViewModel] = useState<PreferencesViewModel | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { setThemeMode } = useTheme();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let resolvedUserId = userIdProp;

      if (!resolvedUserId) {
        const session = await authModule.getSessionUseCase.execute();
        if (session && session.isAuthenticated && session.userId) {
          resolvedUserId = session.userId;
        }
      }

      if (!resolvedUserId) {
        setError('Authentication required to access preferences.');
        setIsLoading(false);
        return;
      }

      const { viewModel: vm, categories: cats } = await controller.loadViewModel(resolvedUserId);
      setCategories(cats);
      setViewModel(vm);

      if (vm && vm.appearance && vm.appearance.theme) {
        const themeModeStr = String(vm.appearance.theme).toUpperCase() as ThemeMode;
        if (['LIGHT', 'DARK', 'SYSTEM'].includes(themeModeStr)) {
          setThemeMode(themeModeStr);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load preferences.');
    } finally {
      setIsLoading(false);
    }
  }, [controller, userIdProp, authModule, setThemeMode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    viewModel,
    categories,
    isLoading,
    error,
    refresh: loadData,
  };
}
