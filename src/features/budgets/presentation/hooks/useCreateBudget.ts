import { useState } from 'react';
import { CreateBudgetUseCase, CreateBudgetCommand } from '../../application';
import { BudgetViewModelMapper } from '../mappers/BudgetViewModelMapper';
import { BudgetViewModel } from '../models/BudgetViewModel';

export function useCreateBudget(createBudgetUseCase: CreateBudgetUseCase) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createBudget = async (command: CreateBudgetCommand): Promise<BudgetViewModel | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const budget = await createBudgetUseCase.execute(command);
      return BudgetViewModelMapper.toViewModel(budget);
    } catch (e: any) {
      setError(e.message || 'Failed to create budget.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createBudget,
    isLoading,
    error,
  };
}
