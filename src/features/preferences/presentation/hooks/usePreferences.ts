import { useState, useEffect, useCallback } from 'react';
import { PreferencesController } from '../controllers/PreferencesController';
import { Category } from '../../../categories/domain';
import { PreferencesViewModel } from '../models/PreferencesViewModel';

export function usePreferences(
  controller: PreferencesController,
  userId?: string
) {
  const [viewModel, setViewModel] = useState<PreferencesViewModel | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { viewModel: vm, categories: cats } = await controller.loadViewModel(userId);
      setCategories(cats);
      setViewModel(vm);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load preferences.');
    } finally {
      setIsLoading(false);
    }
  }, [controller, userId]);

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
