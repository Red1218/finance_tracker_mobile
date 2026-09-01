import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CircularProgress } from '../../../../../shared/components/CircularProgress';
import { useTheme, withAlpha } from '../../../../../shared/theme';
import { BudgetHealthRow } from '../../../application/view-models/BudgetHealthViewModel';

export interface MonthlyBudgetCardProps {
  budget: BudgetHealthRow;
}

export function MonthlyBudgetCard({ budget }: MonthlyBudgetCardProps) {
  const { colors, spacing, typography } = useTheme();
  const isDerived = budget.isDerived === true;

  const percentage = Math.min(Math.max(Math.round(budget.consumptionRatio), 0), 100);

  let progressColor = colors.brandPrimary;
  if (budget.statusLabel === 'OverBudget') {
    progressColor = colors.error;
  } else if (budget.statusLabel === 'AtRisk') {
    progressColor = colors.warning;
  }

  const remainingLabel = budget.remainingAmount || '₹0.00';

  const ringAccessibilityLabel = isDerived
    ? `${remainingLabel} left to spend of ${budget.budgetLimit}. Estimated from your category budgets.`
    : `${remainingLabel} left to spend of ${budget.budgetLimit}`;

  return (
    <View
      style={[
        styles.accentField,
        {
          backgroundColor: withAlpha(colors.brandPrimary, 0.08),
          marginHorizontal: -spacing.space20,
          paddingHorizontal: spacing.space20,
        },
      ]}
    >
      <CircularProgress
        percentage={percentage}
        size={212}
        strokeWidth={14}
        progressColor={progressColor}
        trackColor={colors.surfaceElevatedHairline || colors.surfaceElevated}
        accessibilityLabel={ringAccessibilityLabel}
      >
        <Text style={[styles.label, { color: colors.textSecondary }]}>LEFT TO SPEND</Text>
        <Text
          style={[
            styles.value,
            {
              color: colors.textPrimary,
              fontSize: typography.numericLarge.fontSize,
              fontWeight: typography.numericLarge.fontWeight,
            },
          ]}
        >
          {remainingLabel}
        </Text>
        <Text style={[styles.caption, { color: colors.textSecondary }]}>of {budget.budgetLimit}</Text>
      </CircularProgress>

      {isDerived ? (
        <Text
          style={[styles.estimatedCaption, { color: colors.textMuted }]}
          accessibilityLabel="Estimated, calculated from your category budgets"
        >
          Estimated from your category budgets
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  accentField: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  value: {
    marginBottom: 2,
  },
  caption: {
    fontSize: 13,
    fontWeight: '500',
  },
  estimatedCaption: {
    fontSize: 12,
    marginTop: 14,
    textAlign: 'center',
  },
});
