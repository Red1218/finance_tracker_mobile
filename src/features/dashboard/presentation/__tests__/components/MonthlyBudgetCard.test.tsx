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
    const titleGroup = header.props.children[0];
    const headerTitle = titleGroup.props.children[0];
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

  it('does not render the Estimated indicator or caption for an explicit overall budget', () => {
    const mockBudget: BudgetHealthRow = {
      statusLabel: 'OnTrack',
      amountConsumed: '₹1,400.00',
      budgetLimit: '₹2,000.00',
      remainingAmount: '₹600.00',
      consumptionRatio: 70,
      isOverall: true,
      isDerived: false,
    };

    const card = MonthlyBudgetCard({ budget: mockBudget });
    const header = card.props.children[0];
    const titleGroup = header.props.children[0];
    expect(titleGroup.props.children[1]).toBeNull();

    const ring = card.props.children[1].props.children;
    expect(ring.props.accessibilityLabel).toBe('Monthly budget utilization: 70%');

    const footer = card.props.children[2];
    expect(footer.props.children[2]).toBeNull();
  });

  it('renders the "Estimated" indicator, explanatory caption, and accessible label for a derived overall budget', () => {
    const mockBudget: BudgetHealthRow = {
      statusLabel: 'OnTrack',
      amountConsumed: '₹1,000.00',
      budgetLimit: '₹5,150.00',
      remainingAmount: '₹4,150.00',
      consumptionRatio: 19,
      isOverall: true,
      isDerived: true,
    };

    const card = MonthlyBudgetCard({ budget: mockBudget });

    const header = card.props.children[0];
    const titleGroup = header.props.children[0];
    const estimatedBadge = titleGroup.props.children[1];
    expect(estimatedBadge).not.toBeNull();
    expect(estimatedBadge.props.accessibilityLabel).toBe('Estimated value, calculated from your category budgets');
    expect(estimatedBadge.props.children.props.children).toBe('Estimated');

    const ring = card.props.children[1].props.children;
    expect(ring.props.accessibilityLabel).toBe(
      'Estimated monthly budget utilization: 19%. Calculated from your category budgets.'
    );

    const footer = card.props.children[2];
    const derivedCaption = footer.props.children[2];
    expect(derivedCaption.props.children).toBe('Calculated from your category budgets.');
    expect(derivedCaption.props.accessibilityLabel).toBe('Calculated from your category budgets');
  });

  it('does not add any pressable/edit affordance to a derived overall card', () => {
    const mockBudget: BudgetHealthRow = {
      statusLabel: 'OnTrack',
      amountConsumed: '₹1,000.00',
      budgetLimit: '₹5,150.00',
      remainingAmount: '₹4,150.00',
      consumptionRatio: 19,
      isOverall: true,
      isDerived: true,
    };

    const card = MonthlyBudgetCard({ budget: mockBudget });
    // The root element remains a plain Card (not Pressable/TouchableOpacity), and no onPress prop exists anywhere on it.
    expect(card.type.name).toBe('Card');
    expect(card.props.onPress).toBeUndefined();
  });
});
