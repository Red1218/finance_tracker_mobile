import { useState, useEffect, useCallback } from 'react';
import { AccountController } from '../controllers/AccountController';
import { AccountViewModel } from '../models/AccountViewModel';

export function useAccounts(controller: AccountController, includeArchived = false) {
  const [viewModels, setViewModels] = useState<AccountViewModel[]>([]);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const vms = await controller.loadAccountsViewModel(includeArchived);
      setViewModels(vms);

      const total = vms
        .filter((vm) => !vm.isArchived)
        .reduce((sum, vm) => sum + vm.derivedBalance, 0);
      setTotalBalance(total);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load accounts.');
    } finally {
      setIsLoading(false);
    }
  }, [controller, includeArchived]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    viewModels,
    totalBalance,
    isLoading,
    error,
    refresh: loadData,
  };
}
