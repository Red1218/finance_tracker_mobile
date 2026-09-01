import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CircularProgress } from '../../../../shared/components';
import { useTheme, withAlpha } from '../../../../shared/theme';

export interface BudgetSummaryCardProps {
  totalBudgeted: number;
  totalSpent: number;
  totalRemaining: number;
  budgetCount: number;
  overBudgetCount: number;
  currencyCode?: string;
  overallHealthStatus?: string;
}

export function BudgetSummaryCard({
  totalBudgeted,
  totalSpent,
  totalRemaining,
  budgetCount,
  overBudgetCount,
  currencyCode = 'INR',
  overallHealthStatus = 'ON_TRACK',
}: BudgetSummaryCardProps) {
  const { colors, typography } = useTheme();

  const percentageUsed = totalBudgeted > 0 ? Math.min(Math.max((totalSpent / totalBudgeted) * 100, 0), 100) : 0;
  const currencySymbol = currencyCode === 'INR' || currencyCode === '₹' ? '₹' : `${currencyCode} `;

  let ringColor = colors.brandPrimary;
  if (overallHealthStatus === 'OVER_BUDGET') ringColor = colors.error;
  else if (overallHealthStatus === 'NEAR_LIMIT') ringColor = colors.warning;

  return (
    <View style={styles.container}>
      <View style={styles.ringRow}>
        <CircularProgress
          percentage={percentageUsed}
          size={118}
          strokeWidth={10}
          progressColor={ringColor}
          trackColor={colors.surfaceElevatedHairline || colors.surfaceElevated}
          accessibilityLabel={`${Math.round(percentageUsed)}% of budget used`}
        >
          <Text style={[styles.ringPercentage, { color: colors.textPrimary }]}>{Math.round(percentageUsed)}%</Text>
          <Text style={[styles.ringLabel, { color: colors.textSecondary }]}>USED</Text>
        </CircularProgress>

        <View style={styles.figureColumn}>
          <Text style={[styles.caption, { color: colors.textSecondary }]}>
            Left across {budgetCount} {budgetCount === 1 ? 'budget' : 'budgets'}
          </Text>
          <Text
            style={[
              styles.figureAmount,
              {
                color: totalRemaining >= 0 ? colors.textPrimary : colors.error,
                fontSize: typography.numericLarge.fontSize,
                fontWeight: typography.numericLarge.fontWeight,
              },
            ]}
          >
            {currencySymbol}
            {Math.abs(totalRemaining).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </Text>
          <Text style={[styles.caption, { color: colors.textSecondary }]}>
            {currencySymbol}
            {totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })} spent of {currencySymbol}
            {totalBudgeted.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </Text>
        </View>
      </View>

      {overBudgetCount > 0 ? (
        <View
          style={[styles.overBudgetPill, { backgroundColor: withAlpha(colors.error, 0.15), borderColor: colors.error }]}
          accessible={true}
          accessibilityLabel={`${overBudgetCount} ${overBudgetCount === 1 ? 'budget is' : 'budgets are'} over budget`}
        >
          <View style={[styles.dot, { backgroundColor: colors.error }]} />
          <Text style={[styles.overBudgetText, { color: colors.error }]}>
            {overBudgetCount} over budget
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  ringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  ringPercentage: {
    fontSize: 24,
    fontWeight: '700',
  },
  ringLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 2,
  },
  figureColumn: {
    flex: 1,
  },
  caption: {
    fontSize: 13,
    marginBottom: 2,
  },
  figureAmount: {
    marginBottom: 4,
  },
  overBudgetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  overBudgetText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
