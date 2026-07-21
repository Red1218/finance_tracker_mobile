import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateBudgetUseCase, UpdateBudgetRequest } from '../../application';

export function useUpdateBudget(updateBudgetUseCase: UpdateBudgetUseCase) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: UpdateBudgetRequest) => {
      const result = await updateBudgetUseCase.execute(request);
      if (!result.success) throw result.error;
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budgetSummary', variables.id] });
    },
  });
}
