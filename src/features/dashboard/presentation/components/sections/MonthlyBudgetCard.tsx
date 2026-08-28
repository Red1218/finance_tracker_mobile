import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../../../../shared/components/Card';
import { StatusIndicator } from '../../../../../shared/components/StatusIndicator';
import { CircularProgress } from '../../../../../shared/components/CircularProgress';
import { useTheme } from '../../../../../shared/theme';
import { BudgetHealthRow } from '../../../application/view-models/BudgetHealthViewModel';

export interface MonthlyBudgetCardProps {
  budget: BudgetHealthRow;
}

export function MonthlyBudgetCard({ budget }: MonthlyBudgetCardProps) {
  const { colors, typography } = useTheme();

  // Map BudgetHealthRow statusLabel to StatusIndicator status type
  const statusType =
    budget.statusLabel === 'OverBudget'
      ? 'error'
      : budget.statusLabel === 'AtRisk'
        ? 'warning'
        : 'success';

  const badgeText =
    budget.statusLabel === 'OverBudget'
      ? 'Over Budget'
      : budget.statusLabel === 'AtRisk'
        ? 'At Risk'
        : 'Healthy';

  // consumptionRatio is a percentage (e.g. 70)
  const percentage = Math.min(Math.max(Math.round(budget.consumptionRatio), 0), 100);

  let progressColor = colors.brandPrimary;
  if (budget.statusLabel === 'OverBudget' || percentage >= 100) {
    progressColor = colors.error;
  } else if (budget.statusLabel === 'AtRisk' || percentage >= 80) {
    progressColor = colors.warning;
  }

  return (
    <Card variant="elevated" style={styles.cardContainer}>
      {/* Header Row: Section Title & Status Badge */}
      <View style={styles.headerRow}>
        <Text
          style={[styles.title, { color: colors.textPrimary, fontSize: typography.heading.fontSize }]}
          accessibilityRole="header"
        >
          Monthly Budget
        </Text>
        <StatusIndicator status={statusType} label={badgeText} />
      </View>

      {/* Ring Visual Container */}
      <View style={styles.ringContainer}>
        <CircularProgress
          percentage={percentage}
          size={160}
          strokeWidth={12}
          progressColor={progressColor}
          trackColor={colors.surfaceElevated || colors.borderSubtle}
          accessibilityLabel={`Monthly budget utilization: ${percentage}%`}
        >
          <Text style={[styles.percentageText, { color: colors.textPrimary }]}>
            {percentage}%
          </Text>
          <Text style={[styles.utilizedText, { color: colors.textSecondary }]}>
            UTILIZED
          </Text>
        </CircularProgress>
      </View>

      {/* Prompt / Amounts Footer */}
      <View style={styles.footerContainer}>
        {budget.remainingAmount ? (
          <Text style={[styles.remainingText, { color: colors.textPrimary, fontSize: typography.body.fontSize }]}>
            You have <Text style={styles.boldText}>{budget.remainingAmount}</Text> left
          </Text>
        ) : null}
        <Text style={[styles.footerText, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
          Spent <Text style={styles.boldText}>{budget.amountConsumed}</Text> of{' '}
          <Text style={styles.boldText}>{budget.budgetLimit}</Text>
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontWeight: '700',
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  percentageText: {
    fontSize: 36,
    fontWeight: '700',
  },
  utilizedText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  footerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 4,
  },
  remainingText: {
    textAlign: 'center',
  },
  footerText: {
    textAlign: 'center',
  },
  boldText: {
    fontWeight: '700',
  },
});
