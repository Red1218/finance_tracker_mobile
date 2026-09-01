import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Card } from '../../../../shared/components';
import { useTheme } from '../../../../shared/theme';

import { BudgetSummaryViewModel } from '../types/BudgetViewModel';
import { BudgetProgressBar } from './BudgetProgressBar';
import { BudgetStatusBadge } from './BudgetStatusBadge';

export interface BudgetCardProps {
  summary: BudgetSummaryViewModel;
  categoryName: string;
  onPress?: () => void;
}

export function BudgetCard({ summary, categoryName, onPress }: BudgetCardProps) {
  const { colors, typography } = useTheme();

  const currencySymbol = summary.budget.currency === 'INR' || summary.budget.currency === '₹' ? '₹' : `${summary.budget.currency} `;

  return (
    <Card style={styles.cardContainer}>
      <TouchableOpacity onPress={onPress} disabled={!onPress} activeOpacity={0.7}>
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <Text style={[styles.categoryTitle, { color: colors.textPrimary, fontSize: typography.title.fontSize }]} numberOfLines={1}>
              {categoryName}
            </Text>
            <BudgetStatusBadge status={summary.status} />
          </View>
          <Text style={[styles.amountText, { color: colors.textPrimary, fontSize: typography.numeric.fontSize, fontVariant: ['tabular-nums'] }]}>
            {currencySymbol}{summary.budget.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </Text>
        </View>

        <Text style={[styles.spentSubtext, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
          {currencySymbol}{summary.spentAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })} of {currencySymbol}{summary.budget.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })} spent
        </Text>

        <View style={styles.progressContainer}>
          <BudgetProgressBar percentage={summary.percentageUsed} status={summary.status} />
        </View>

        <View style={styles.metricsRow}>
          <Text style={[styles.percentageText, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
            {summary.percentageUsed.toFixed(0)}% used
          </Text>
          <Text
            style={[
              styles.remainingText,
              {
                color: summary.remainingAmount >= 0 ? colors.success : colors.error,
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
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  categoryTitle: {
    fontWeight: '600',
  },
  amountText: {
    fontWeight: '700',
  },
  spentSubtext: {
    marginBottom: 10,
  },
  progressContainer: {
    marginVertical: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  percentageText: {},
  remainingText: {
    fontWeight: '600',
  },
});
