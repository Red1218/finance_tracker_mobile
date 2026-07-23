import React from 'react';
import { DashboardView } from './DashboardView';
import { useDashboardState } from '../hooks/useDashboardState';
import { DashboardFacade } from '../../application/facade/DashboardFacade';

// Normally this facade would be injected via Context (e.g. useFacade() hook) 
// or DI container. We accept it as a prop here for demonstration/simplicity,
// but assume it's provided by a higher-order component.
interface DashboardScreenProps {
  userId: string;
  facade: DashboardFacade; 
}

/**
 * Container component that wires the Use Cases / Facade to the pure DashboardView.
 */
export function DashboardScreen({ userId, facade }: DashboardScreenProps) {
  const { state, actions } = useDashboardState(userId, facade);

  return (
    <DashboardView
      state={state}
      onRefresh={actions.handleRefresh}
      onRefreshSection={actions.handleRefreshSection}
      onChangePeriod={actions.handleChangePeriod}
      onExecuteQuickAction={actions.handleExecuteQuickAction}
      onTogglePeriodSelector={actions.togglePeriodSelector}
    />
  );
}
