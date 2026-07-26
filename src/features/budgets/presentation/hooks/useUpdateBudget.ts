import { useState } from 'react';
import { UpdateBudgetUseCase, UpdateBudgetCommand } from '../../application';
import { BudgetViewModelMapper } from '../mappers/BudgetViewModelMapper';
import { BudgetViewModel } from '../models/BudgetViewModel';

export function useUpdateBudget(updateBudgetUseCase: UpdateBudgetUseCase) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateBudget = async (command: UpdateBudgetCommand): Promise<BudgetViewModel | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const budget = await updateBudgetUseCase.execute(command);
      return BudgetViewModelMapper.toViewModel(budget);
    } catch (e: any) {
      setError(e.message || 'Failed to update budget.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateBudget,
    isLoading,
    error,
  };
}
