import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../../../shared/theme';

import { BudgetSummaryViewModel } from '../types/BudgetViewModel';
import { BudgetProgressBar } from './BudgetProgressBar';
import { BudgetStatusBadge } from './BudgetStatusBadge';

export interface BudgetCardProps {
  summary: BudgetSummaryViewModel;
  categoryName: string;
  onPress?: () => void;
  isLast?: boolean;
}

export function BudgetCard({ summary, categoryName, onPress, isLast = false }: BudgetCardProps) {
  const { colors, typography } = useTheme();

  const currencySymbol = summary.budget.currency === 'INR' || summary.budget.currency === '₹' ? '₹' : `${summary.budget.currency} `;
  const percentage = Math.min(Math.max(summary.percentageUsed, 0), 100);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
      style={[styles.row, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle }]}
      accessibilityRole="button"
      accessibilityLabel={`${categoryName}, ${summary.percentageUsed.toFixed(0)} percent used`}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.categoryTitle, { color: colors.textPrimary, fontSize: typography.title.fontSize }]} numberOfLines={1}>
          {categoryName}
        </Text>
        <BudgetStatusBadge status={summary.status} variant="text" />
      </View>

      <View style={styles.metricsRow}>
        <Text style={[styles.spentSubtext, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
          {currencySymbol}{summary.spentAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })} of {currencySymbol}{summary.budget.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })} spent
        </Text>
        <Text
          style={[
            styles.remainingText,
            {
              color: colors.textSecondary,
              fontSize: typography.caption.fontSize,
              fontVariant: ['tabular-nums'],
            },
          ]}
        >
          {summary.remainingAmount >= 0
            ? `${currencySymbol}${summary.remainingAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })} left`
            : `${currencySymbol}${Math.abs(summary.remainingAmount).toLocaleString('en-IN', { maximumFractionDigits: 0 })} over`}
        </Text>
      </View>

      <View
        accessible={true}
        accessibilityRole="progressbar"
        accessibilityLabel={`${categoryName} budget progress`}
        accessibilityValue={{ min: 0, max: 100, now: Math.round(percentage) }}
      >
        <BudgetProgressBar percentage={percentage} status={summary.status} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryTitle: {
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  spentSubtext: {},
  remainingText: {
    fontWeight: '600',
  },
});
