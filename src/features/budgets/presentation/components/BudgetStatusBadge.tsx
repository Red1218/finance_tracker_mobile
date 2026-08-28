import React from 'react';
import { StatusIndicator } from '../../../../shared/components';



export interface BudgetStatusBadgeProps {
  status: 'OnTrack' | 'AtRisk' | 'Overbudget' | 'ON_TRACK' | 'NEAR_LIMIT' | 'OVER_BUDGET' | string;
}

export function BudgetStatusBadge({ status }: BudgetStatusBadgeProps) {
  let mappedStatus: 'success' | 'warning' | 'error' = 'success';
  let label = 'Healthy';

  if (status === 'AtRisk' || status === 'NEAR_LIMIT' || status === 'Near Limit') {
    mappedStatus = 'warning';
    label = 'Near Limit';
  } else if (status === 'Overbudget' || status === 'OVER_BUDGET' || status === 'Limit Reached' || status === 'Over Budget') {
    mappedStatus = 'error';
    label = 'Limit Reached';
  } else if (status === 'OnTrack' || status === 'ON_TRACK' || status === 'Healthy') {
    mappedStatus = 'success';
    label = 'Healthy';
  }

  return <StatusIndicator status={mappedStatus} label={label} variant="badge" />;
}
