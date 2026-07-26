import { useState, useEffect, useCallback } from 'react';
import { AccountController } from '../controllers/AccountController';
import { AccountViewModel } from '../models/AccountViewModel';

export function useAccount(controller: AccountController, accountId: string) {
  const [viewModel, setViewModel] = useState<AccountViewModel | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!accountId) return;
    setIsLoading(true);
    setError(null);
    try {
      const vm = await controller.loadAccountViewModel(accountId);
      setViewModel(vm);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load account details.');
    } finally {
      setIsLoading(false);
    }
  }, [controller, accountId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    viewModel,
    isLoading,
    error,
    refresh: loadData,
  };
}
