import React from 'react';
import { StatusIndicator } from '@/src/shared/components';

export interface BudgetStatusBadgeProps {
  status: 'OnTrack' | 'AtRisk' | 'Overbudget' | 'ON_TRACK' | 'NEAR_LIMIT' | 'OVER_BUDGET' | string;
}

export function BudgetStatusBadge({ status }: BudgetStatusBadgeProps) {
  let mappedStatus: 'success' | 'warning' | 'error' = 'success';
  let label = 'On Track';

  if (status === 'AtRisk' || status === 'NEAR_LIMIT') {
    mappedStatus = 'warning';
    label = 'Near Limit';
  } else if (status === 'Overbudget' || status === 'OVER_BUDGET') {
    mappedStatus = 'error';
    label = 'Over Budget';
  }

  return <StatusIndicator status={mappedStatus} label={label} variant="badge" />;
}
