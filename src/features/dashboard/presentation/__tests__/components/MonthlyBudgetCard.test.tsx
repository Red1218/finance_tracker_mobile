import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { theme } from '../../../../../shared/theme/theme';

vi.mock('react-native-svg', () => {
  const React = require('react');
  return {
    default: (props: any) => React.createElement('Svg', props, props.children),
    Circle: (props: any) => React.createElement('Circle', props),
  };
});

vi.mock('../../../../../shared/theme', () => ({
  useTheme: () => theme,
}));

import { MonthlyBudgetCard } from '../../components/sections/MonthlyBudgetCard';
import { BudgetHealthRow } from '../../../application/view-models/BudgetHealthViewModel';

describe('MonthlyBudgetCard Component Presentation', () => {
  it('renders monthly budget card with utilization percentage and amounts', () => {
    const mockBudget: BudgetHealthRow = {
      statusLabel: 'OnTrack',
      amountConsumed: '₹1,400.00',
      budgetLimit: '₹2,000.00',
      remainingAmount: '₹600.00',
      consumptionRatio: 70,
    };

    const card = MonthlyBudgetCard({ budget: mockBudget });
    expect(card.type.name).toBe('Card');
    expect(card.props.variant).toBe('elevated');

    const header = card.props.children[0];
    const headerTitle = header.props.children[0];
    expect(headerTitle.props.children).toBe('Monthly Budget');

    const statusBadge = header.props.children[1];
    expect(statusBadge.props.status).toBe('success');
    expect(statusBadge.props.label).toBe('Healthy');

    const footer = card.props.children[2];
    const remainingText = footer.props.children[0];
    expect(remainingText.props.children[1].props.children).toBe('₹600.00');
  });

  it('renders warning status for AtRisk budget health', () => {
    const mockBudget: BudgetHealthRow = {
      statusLabel: 'AtRisk',
      amountConsumed: '₹1,700.00',
      budgetLimit: '₹2,000.00',
      remainingAmount: '₹300.00',
      consumptionRatio: 85,
    };

    const card = MonthlyBudgetCard({ budget: mockBudget });
    const statusBadge = card.props.children[0].props.children[1];
    expect(statusBadge.props.status).toBe('warning');
    expect(statusBadge.props.label).toBe('At Risk');
  });

  it('renders error status for OverBudget health', () => {
    const mockBudget: BudgetHealthRow = {
      statusLabel: 'OverBudget',
      amountConsumed: '₹2,500.00',
      budgetLimit: '₹2,000.00',
      remainingAmount: '₹0.00',
      consumptionRatio: 125,
    };

    const card = MonthlyBudgetCard({ budget: mockBudget });
    const statusBadge = card.props.children[0].props.children[1];
    expect(statusBadge.props.status).toBe('error');
    expect(statusBadge.props.label).toBe('Over Budget');
  });
});
