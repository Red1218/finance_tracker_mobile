import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../../../shared/components';
import { useTheme } from '../../../../shared/theme';
import { BudgetProgressBar } from './BudgetProgressBar';
import { BudgetStatusBadge } from './BudgetStatusBadge';

export interface BudgetSummaryCardProps {
  totalBudgeted: number;
  totalSpent: number;
  totalRemaining: number;
  currencyCode?: string;
  overallHealthStatus?: string;
}

export function BudgetSummaryCard({
  totalBudgeted,
  totalSpent,
  totalRemaining,
  currencyCode = 'INR',
  overallHealthStatus = 'ON_TRACK',
}: BudgetSummaryCardProps) {
  const { colors, typography } = useTheme();

  const percentageUsed = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  return (
    <Card style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.textPrimary, fontSize: typography.title.fontSize }]}>
          Overall Budget Progress
        </Text>
        <BudgetStatusBadge status={overallHealthStatus} />
      </View>

      <View style={styles.amountContainer}>
        <Text style={[styles.spentAmount, { color: colors.textPrimary, fontSize: typography.heading.fontSize, fontVariant: ['tabular-nums'] }]}>
          ₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Text>
        <Text style={[styles.budgetTotal, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
          of ₹{totalBudgeted.toLocaleString('en-IN', { minimumFractionDigits: 2 })} budgeted
        </Text>
      </View>

      <BudgetProgressBar percentage={percentageUsed} status={overallHealthStatus} />

      <View style={styles.footerRow}>
        <Text style={[styles.remainingLabel, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
          Remaining Allowance
        </Text>
        <Text
          style={[
            styles.remainingValue,
            {
              color: totalRemaining >= 0 ? colors.success : colors.error,
              fontSize: typography.caption.fontSize,
              fontVariant: ['tabular-nums'],
            },
          ]}
        >
          {totalRemaining >= 0
            ? `₹${totalRemaining.toLocaleString('en-IN', { minimumFractionDigits: 2 })} left`
            : `₹${Math.abs(totalRemaining).toLocaleString('en-IN', { minimumFractionDigits: 2 })} over`}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontWeight: '700',
  },
  amountContainer: {
    marginBottom: 12,
  },
  spentAmount: {
    fontWeight: '700',
  },
  budgetTotal: {
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  remainingLabel: {},
  remainingValue: {
    fontWeight: '700',
  },
});
