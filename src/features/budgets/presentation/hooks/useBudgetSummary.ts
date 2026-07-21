import { useQuery } from '@tanstack/react-query';
import { GetBudgetSummaryUseCase } from '../../application';
import { BudgetViewModelMapper } from '../mappers/BudgetViewModelMapper';
import { budgetKeys } from './queryKeys';

export function useBudgetSummary(getBudgetSummaryUseCase: GetBudgetSummaryUseCase, budgetId: string) {
  return useQuery({
    queryKey: budgetKeys.summary(budgetId),
    queryFn: async () => {
      const result = await getBudgetSummaryUseCase.execute({ id: budgetId });
      if (!result.success) throw result.error;
      
      return BudgetViewModelMapper.toSummaryViewModel(result.data);
    },
    enabled: !!budgetId,
  });
}
