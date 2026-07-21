import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DeleteBudgetUseCase, DeleteBudgetRequest } from '../../application';

export function useDeleteBudget(deleteBudgetUseCase: DeleteBudgetUseCase) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: DeleteBudgetRequest) => {
      const result = await deleteBudgetUseCase.execute(request);
      if (!result.success) throw result.error;
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.removeQueries({ queryKey: ['budgetSummary', variables.id] });
    },
  });
}
