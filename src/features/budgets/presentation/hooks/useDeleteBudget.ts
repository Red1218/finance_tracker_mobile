import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DeleteBudgetUseCase, DeleteBudgetRequest } from '../../application';
import { budgetsModule } from './module';

export function useDeleteBudget(deleteBudgetUseCase: DeleteBudgetUseCase = budgetsModule.deleteBudgetUseCase) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
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

  return {
    deleteBudget: async (request: DeleteBudgetRequest) => {
      try {
        await mutation.mutateAsync(request);
        return true;
      } catch (e) {
        return false;
      }
    },
    isLoading: mutation.isPending,
    error: mutation.error?.message || null,
  };
}

