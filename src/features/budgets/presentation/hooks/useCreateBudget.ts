import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateBudgetUseCase, CreateBudgetRequest } from '../../application';

export function useCreateBudget(createBudgetUseCase: CreateBudgetUseCase) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateBudgetRequest) => {
      const result = await createBudgetUseCase.execute(request);
      if (!result.success) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}
