import { useState, useMemo, useEffect, useCallback } from 'react';
import { DashboardScreenState, initialDashboardScreenState } from '../models/DashboardScreenState';
import { DashboardPresenter } from '../presenters/DashboardPresenter';
import { DashboardFacade } from '../../application/facade/DashboardFacade';

/**
 * Hook providing React state and bound presenter methods.
 * Contains NO business logic.
 */
export function useDashboardState(userId: string, facade: DashboardFacade) {
  const [state, setState] = useState<DashboardScreenState>(initialDashboardScreenState);

  // Memoize the presenter to avoid recreating it on every render,
  // bounding it to the setState callback.
  const presenter = useMemo(() => {
    return new DashboardPresenter(facade, (newState) => {
      setState(newState);
    });
  }, [facade]);

  // Initial load
  useEffect(() => {
    if (!userId) return;
    presenter.loadDashboard(userId).catch(error => {
      console.error('[useDashboardState] Unhandled error during loadDashboard:', error);
    });
  }, [presenter, userId]);

  // Stable callbacks for UI components
  const handleRefresh = useCallback(() => {
    if (state.viewModel) {
      presenter.refreshDashboard(userId, state.viewModel.activeReportingPeriodId);
    }
  }, [presenter, userId, state.viewModel]);

  const handleRefreshSection = useCallback((section: string) => {
    if (state.viewModel) {
      presenter.refreshSection(userId, section, state.viewModel.activeReportingPeriodId);
    }
  }, [presenter, userId, state.viewModel]);



  const handleChangePeriod = useCallback((periodType: string, start?: Date, end?: Date) => {
    presenter.changePeriod(userId, periodType, start, end);
  }, [presenter, userId]);

  const handleExecuteQuickAction = useCallback((actionType: string, payload: unknown) => {
    presenter.executeQuickAction(userId, actionType, payload);
  }, [presenter, userId]);

  const togglePeriodSelector = useCallback(() => presenter.togglePeriodSelector(), [presenter]);
  const openModal = useCallback((id: string) => presenter.openModal(id), [presenter]);
  const closeModal = useCallback(() => presenter.closeModal(), [presenter]);
  const selectSection = useCallback((id: string) => presenter.selectSection(id), [presenter]);

  return {
    state,
    actions: {
      handleRefresh,
      handleRefreshSection,
      handleChangePeriod,
      handleExecuteQuickAction,
      togglePeriodSelector,
      openModal,
      closeModal,
      selectSection,
    }
  };
}
