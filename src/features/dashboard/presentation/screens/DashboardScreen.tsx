import React from 'react';
import { DashboardView } from './DashboardView';
import { useDashboardState } from '../hooks/useDashboardState';
import { DashboardFacade } from '../../application/facade/DashboardFacade';

interface DashboardScreenProps {
  userId: string;
  facade: DashboardFacade;
  userAvatarUrl?: string;
  userEmail?: string;
  onAvatarPress?: () => void;
  onNotificationsPress?: () => void;
  onNavigateToSpends?: () => void;
  onNavigateToBudgets?: () => void;
  onNavigateToCreateTransaction?: () => void;
}

/**
 * Container component that wires the Use Cases / Facade to the pure DashboardView.
 */
export function DashboardScreen({
  userId,
  facade,
  userAvatarUrl,
  userEmail,
  onAvatarPress,
  onNotificationsPress,
  onNavigateToSpends,
  onNavigateToBudgets,
  onNavigateToCreateTransaction,
}: DashboardScreenProps) {
  const { state, actions } = useDashboardState(userId, facade);

  return (
    <DashboardView
      state={state}
      onRefresh={actions.handleRefresh}
      onRefreshSection={actions.handleRefreshSection}
      onChangePeriod={actions.handleChangePeriod}
      onExecuteQuickAction={actions.handleExecuteQuickAction}
      onTogglePeriodSelector={actions.togglePeriodSelector}
      userAvatarUrl={userAvatarUrl}
      userEmail={userEmail}
      onAvatarPress={onAvatarPress}
      onNotificationsPress={onNotificationsPress}
      onNavigateToSpends={onNavigateToSpends}
      onNavigateToBudgets={onNavigateToBudgets}
      onNavigateToCreateTransaction={onNavigateToCreateTransaction}
    />
  );
}
