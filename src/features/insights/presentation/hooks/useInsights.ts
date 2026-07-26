import { useState, useEffect, useCallback } from 'react';
import { InsightsController, InsightsState } from '../controllers/InsightsController';

export function useInsights(controller: InsightsController) {
  const [state, setState] = useState<InsightsState>(controller.getState());

  useEffect(() => {
    const unsubscribe = controller.subscribe(setState);
    controller.loadAll();
    return () => unsubscribe();
  }, [controller]);

  const refresh = useCallback(async () => {
    return controller.loadAll();
  }, [controller]);

  const dismiss = useCallback(
    async (insightId: string) => {
      return controller.dismissInsight(insightId);
    },
    [controller]
  );

  return {
    viewModel: state.viewModel,
    isLoading: state.isLoading,
    error: state.error,
    refresh,
    dismiss,
  };
}
