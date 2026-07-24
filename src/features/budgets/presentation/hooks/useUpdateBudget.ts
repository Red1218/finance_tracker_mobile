import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateBudgetUseCase, UpdateBudgetRequest } from '../../application';
import { budgetsModule } from './module';

export function useUpdateBudget(updateBudgetUseCase: UpdateBudgetUseCase = budgetsModule.updateBudgetUseCase) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
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

  return {
    updateBudget: async (request: UpdateBudgetRequest) => {
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

