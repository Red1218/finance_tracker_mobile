import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateBudgetUseCase, CreateBudgetRequest } from '../../application';
import { budgetsModule } from './module';

export function useCreateBudget(createBudgetUseCase: CreateBudgetUseCase = budgetsModule.createBudgetUseCase) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: CreateBudgetRequest) => {
      const result = await createBudgetUseCase.execute(request);
      if (!result.success) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  return {
    createBudget: async (request: CreateBudgetRequest) => {
      try {
        await mutation.mutateAsync(request);
        return true;
      } catch (e) {
        return false;
      }
    },
    isLoading: mutation.isPending,
  };
}
