import { useQuery } from '@tanstack/react-query';
import { ListBudgetsUseCase } from '../../application';
import { BudgetViewModelMapper } from '../mappers/BudgetViewModelMapper';
import { budgetKeys } from './queryKeys';

export function useBudgets(listBudgetsUseCase: ListBudgetsUseCase) {
  return useQuery({
    queryKey: budgetKeys.lists(),
    queryFn: async () => {
      const result = await listBudgetsUseCase.execute({});
      if (!result.success) throw result.error;
      
      return result.data.map(budget => BudgetViewModelMapper.toViewModel(budget));
    },
  });
}
