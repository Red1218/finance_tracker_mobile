import { useState, useEffect, useCallback } from 'react';
import { ReportingController, ReportingState } from '../controllers/ReportingController';
import { ReportingPeriod } from '../../domain';

export function useReporting(controller: ReportingController) {
  const [state, setState] = useState<ReportingState>(controller.getState());

  useEffect(() => {
    const unsubscribe = controller.subscribe(setState);
    controller.loadReports();
    return () => unsubscribe();
  }, [controller]);

  const changePeriod = useCallback(
    async (period: ReportingPeriod) => {
      return controller.changePeriod(period);
    },
    [controller]
  );

  const refresh = useCallback(async () => {
    return controller.loadReports();
  }, [controller]);

  return {
    selectedPeriod: state.selectedPeriod,
    viewModel: state.viewModel,
    isLoading: state.isLoading,
    error: state.error,
    changePeriod,
    refresh,
  };
}
