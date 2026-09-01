import React from 'react';
import { StatusIndicator } from '../../../../shared/components';

export interface BudgetStatusBadgeProps {
  status: 'OnTrack' | 'AtRisk' | 'Overbudget' | 'ON_TRACK' | 'NEAR_LIMIT' | 'OVER_BUDGET' | string;
  // 'text' drops the pill/dot chrome to a plain colored word - status is
  // redundant with the bar's color already, so the pill's box has no job
  // left on a budget row (§6.3).
  variant?: 'badge' | 'text';
}

export function BudgetStatusBadge({ status, variant = 'badge' }: BudgetStatusBadgeProps) {
  let mappedStatus: 'success' | 'warning' | 'error' = 'success';
  let label = variant === 'text' ? 'On track' : 'Healthy';

  if (status === 'AtRisk' || status === 'NEAR_LIMIT' || status === 'Near Limit') {
    mappedStatus = 'warning';
    label = variant === 'text' ? 'At risk' : 'Near Limit';
  } else if (status === 'Overbudget' || status === 'OVER_BUDGET' || status === 'Limit Reached' || status === 'Over Budget') {
    mappedStatus = 'error';
    label = variant === 'text' ? 'Over' : 'Limit Reached';
  } else if (status === 'OnTrack' || status === 'ON_TRACK' || status === 'Healthy') {
    mappedStatus = 'success';
    label = variant === 'text' ? 'On track' : 'Healthy';
  }

  return <StatusIndicator status={mappedStatus} label={label} variant={variant} />;
}
