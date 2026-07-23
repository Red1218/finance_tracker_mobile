import { useQuery } from '@tanstack/react-query';
import { ListBudgetsUseCase } from '../../application';
import { BudgetViewModelMapper } from '../mappers/BudgetViewModelMapper';
import { budgetKeys } from './queryKeys';
import { budgetsModule } from './module';

export function useBudgets(listBudgetsUseCase: ListBudgetsUseCase = budgetsModule.listBudgetsUseCase) {
  const query = useQuery({
    queryKey: budgetKeys.lists(),
    queryFn: async () => {
      const result = await listBudgetsUseCase.execute({});
      if (!result.success) throw result.error;
      
      return result.data.map(budget => BudgetViewModelMapper.toViewModel(budget));
    },
  });

  return {
    budgets: query.data || [],
    isLoading: query.isLoading,
    error: query.error?.message || null,
    refresh: query.refetch,
  };
}
