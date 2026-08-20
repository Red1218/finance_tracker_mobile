import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Card } from '@/src/shared/components';
import { useTheme } from '@/src/shared/theme';
import { BudgetSummaryViewModel } from '../types/BudgetViewModel';
import { BudgetProgressBar } from './BudgetProgressBar';

export interface BudgetCardProps {
  summary: BudgetSummaryViewModel;
  categoryName: string;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function BudgetCard({ summary, categoryName, onPress, onEdit, onDelete }: BudgetCardProps) {
  const { colors, typography } = useTheme();

  return (
    <Card style={styles.cardContainer}>
      <TouchableOpacity onPress={onPress} disabled={!onPress} activeOpacity={0.7}>
        <View style={styles.headerRow}>
          <Text style={[styles.categoryTitle, { color: colors.textPrimary, fontSize: typography.title.fontSize }]} numberOfLines={1}>
            {categoryName}
          </Text>
          <Text style={[styles.amountText, { color: colors.textSecondary, fontSize: typography.numeric.fontSize, fontVariant: ['tabular-nums'] }]}>
            {summary.budget.currency} {summary.spentAmount.toFixed(0)} / {summary.budget.amount.toFixed(0)}
          </Text>
        </View>

        <BudgetProgressBar percentage={summary.percentageUsed} status={summary.status} />

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
              ? `${summary.remainingAmount.toFixed(0)} left`
              : `${Math.abs(summary.remainingAmount).toFixed(0)} over`}
          </Text>
        </View>
      </TouchableOpacity>

      {(onEdit || onDelete) && (
        <View style={[styles.actionsRow, { borderTopColor: colors.borderSubtle }]}>
          {onEdit && (
            <TouchableOpacity
              onPress={onEdit}
              style={[styles.actionBtn, { backgroundColor: colors.surfaceElevated }]}
              accessibilityRole="button"
              accessibilityLabel="Edit budget"
            >
              <Text style={[styles.actionBtnText, { color: colors.brandPrimary, fontSize: typography.caption.fontSize }]}>Edit</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              onPress={onDelete}
              style={[styles.actionBtn, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}
              accessibilityRole="button"
              accessibilityLabel="Delete budget"
            >
              <Text style={[styles.actionBtnText, { color: colors.error, fontSize: typography.caption.fontSize }]}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  amountText: {
    fontWeight: '600',
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
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minHeight: 32,
    justifyContent: 'center',
  },
  actionBtnText: {
    fontWeight: '600',
  },
});
