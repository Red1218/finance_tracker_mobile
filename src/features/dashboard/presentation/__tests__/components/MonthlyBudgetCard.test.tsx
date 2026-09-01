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
  withAlpha: (hex: string, alpha: number) => `rgba(from ${hex} / ${alpha})`,
}));

import { MonthlyBudgetCard } from '../../components/sections/MonthlyBudgetCard';
import { BudgetHealthRow } from '../../../application/view-models/BudgetHealthViewModel';

function collectNodes(node: any, predicate: (n: any) => boolean, out: any[] = []): any[] {
  if (node === null || node === undefined) return out;
  if (predicate(node)) out.push(node);
  if (typeof node !== 'object') return out;
  const children = node.props?.children;
  if (Array.isArray(children)) {
    children.forEach((c) => collectNodes(c, predicate, out));
  } else if (children !== undefined && children !== null) {
    collectNodes(children, predicate, out);
  }
  return out;
}

function collectTexts(node: any): string[] {
  return collectNodes(node, (n) => typeof n === 'string');
}

function findRing(node: any): any {
  return collectNodes(node, (n) => n?.props?.progressColor !== undefined)[0];
}

describe('MonthlyBudgetCard Component Presentation', () => {
  it('renders as a full-bleed accent field, not a boxed Card', () => {
    const mockBudget: BudgetHealthRow = {
      statusLabel: 'OnTrack',
      amountConsumed: '₹1,400.00',
      budgetLimit: '₹2,000.00',
      remainingAmount: '₹600.00',
      consumptionRatio: 70,
    };

    const card = MonthlyBudgetCard({ budget: mockBudget });
    expect(card.type.name).not.toBe('Card');
    expect(collectNodes(card, (n) => n?.type?.name === 'Card')).toHaveLength(0);
  });

  it('relabels the ring as "left to spend" with the remaining amount as the hero figure', () => {
    const mockBudget: BudgetHealthRow = {
      statusLabel: 'OnTrack',
      amountConsumed: '₹1,400.00',
      budgetLimit: '₹2,000.00',
      remainingAmount: '₹600.00',
      consumptionRatio: 70,
    };

    const card = MonthlyBudgetCard({ budget: mockBudget });
    const texts = collectTexts(card);

    expect(texts).toContain('LEFT TO SPEND');
    expect(texts).toContain('₹600.00');
    expect(texts).toContain('of ');
    expect(texts).toContain('₹2,000.00');
    expect(texts).not.toContain('UTILIZED');
    expect(texts.join('')).not.toMatch(/70%/);
  });

  it('colors the ring by status: success/warning/error map to OnTrack/AtRisk/OverBudget', () => {
    const base = { amountConsumed: '₹0', budgetLimit: '₹0', consumptionRatio: 0 };

    const onTrack = MonthlyBudgetCard({ budget: { ...base, statusLabel: 'OnTrack' } as BudgetHealthRow });
    expect(findRing(onTrack).props.progressColor).toBe(theme.colors.brandPrimary);

    const atRisk = MonthlyBudgetCard({ budget: { ...base, statusLabel: 'AtRisk' } as BudgetHealthRow });
    expect(findRing(atRisk).props.progressColor).toBe(theme.colors.warning);

    const overBudget = MonthlyBudgetCard({ budget: { ...base, statusLabel: 'OverBudget' } as BudgetHealthRow });
    expect(findRing(overBudget).props.progressColor).toBe(theme.colors.error);
  });

  it('does not render the Estimated caption for an explicit overall budget', () => {
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
    const texts = collectTexts(card);
    expect(texts).not.toContain('Estimated from your category budgets');

    expect(findRing(card).props.accessibilityLabel).toBe('₹600.00 left to spend of ₹2,000.00');
  });

  it('renders the Estimated caption and an explanatory accessible label for a derived overall budget', () => {
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
    const texts = collectTexts(card);
    expect(texts).toContain('Estimated from your category budgets');

    expect(findRing(card).props.accessibilityLabel).toBe(
      '₹4,150.00 left to spend of ₹5,150.00. Estimated from your category budgets.'
    );
  });

  it('falls back to ₹0.00 when remainingAmount is absent, rather than rendering blank', () => {
    const mockBudget: BudgetHealthRow = {
      statusLabel: 'OverBudget',
      amountConsumed: '₹2,500.00',
      budgetLimit: '₹2,000.00',
      consumptionRatio: 125,
    };

    const card = MonthlyBudgetCard({ budget: mockBudget });
    const texts = collectTexts(card);
    expect(texts).toContain('₹0.00');
  });
});
