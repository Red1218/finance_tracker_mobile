import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme, withAlpha } from '../../../../shared/theme';
import { Icon } from '../../../../shared/components';
import { BudgetViewModel } from '../models/BudgetViewModel';
import { BudgetProgressBar } from './BudgetProgressBar';
import { BudgetStatusBadge } from './BudgetStatusBadge';

export interface BudgetDetailSheetProps {
  visible: boolean;
  budget: BudgetViewModel | null;
  categoryName?: string;
  onClose: () => void;
  onEdit: (budget: BudgetViewModel) => void;
  onArchive: (budget: BudgetViewModel) => void;
}

export function BudgetDetailSheet({
  visible,
  budget,
  categoryName = 'Overall Budget',
  onClose,
  onEdit,
  onArchive,
}: BudgetDetailSheetProps) {
  const { colors, typography } = useTheme();

  if (!budget) return null;

  const spentAmount = budget.spentAmount ?? 0;
  const remainingAmount = budget.remainingAmount ?? (budget.amount - spentAmount);
  const percentageUsed = budget.percentageUsed ?? (budget.amount > 0 ? (spentAmount / budget.amount) * 100 : 0);
  const healthStatus = budget.healthStatus ?? 'ON_TRACK';

  const startDateFormatted = new Date(budget.startDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const endDateFormatted = new Date(budget.endDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const now = new Date();
  const endDate = new Date(budget.endDate);
  const daysRemaining = Math.max(1, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const dailyRecommended = remainingAmount > 0 ? remainingAmount / daysRemaining : 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={[styles.sheetContainer, { backgroundColor: colors.surfacePrimary, borderColor: colors.borderSubtle }]}>
          <View style={styles.handleBar} />

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Header */}
            <View style={styles.headerRow}>
              <View style={styles.headerTitleContainer}>
                <Text style={[styles.title, { color: colors.textPrimary, fontSize: typography.heading.fontSize }]}>
                  {budget.isOverall ? 'Overall Budget' : categoryName}
                </Text>
                <Text style={[styles.periodText, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
                  {budget.periodKind} ({startDateFormatted} – {endDateFormatted})
                </Text>
              </View>
              <BudgetStatusBadge status={healthStatus} />
            </View>

            {/* Progress Section */}
            <View style={[styles.progressCard, { backgroundColor: colors.surfaceSecondary }]}>
              <View style={styles.progressRow}>
                <Text style={[styles.spentValue, { color: colors.textPrimary, fontSize: typography.heading.fontSize, fontVariant: ['tabular-nums'] }]}>
                  ₹{spentAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
                <Text style={[styles.limitValue, { color: colors.textSecondary, fontSize: typography.body.fontSize }]}>
                  of ₹{budget.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
              </View>

              <BudgetProgressBar percentage={percentageUsed} status={healthStatus} />

              <View style={styles.progressFooter}>
                <Text style={[styles.percentageText, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
                  {percentageUsed.toFixed(1)}% Used
                </Text>
                <Text
                  style={[
                    styles.remainingText,
                    {
                      color: remainingAmount >= 0 ? colors.success : colors.error,
                      fontSize: typography.caption.fontSize,
                      fontVariant: ['tabular-nums'],
                    },
                  ]}
                >
                  {remainingAmount >= 0
                    ? `₹${remainingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} Left`
                    : `₹${Math.abs(remainingAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })} Over Limit`}
                </Text>
              </View>
            </View>

            {/* Metrics Breakdown */}
            <View style={styles.metricsGrid}>
              <View style={[styles.metricTile, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={[styles.metricLabel, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
                  Daily Allowance
                </Text>
                <Text style={[styles.metricValue, { color: colors.textPrimary, fontSize: typography.title.fontSize, fontVariant: ['tabular-nums'] }]}>
                  ₹{dailyRecommended.toFixed(0)}/day
                </Text>
              </View>
              <View style={[styles.metricTile, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={[styles.metricLabel, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
                  Days Remaining
                </Text>
                <Text style={[styles.metricValue, { color: colors.textPrimary, fontSize: typography.title.fontSize }]}>
                  {daysRemaining} days
                </Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                onPress={() => onEdit(budget)}
                style={[styles.primaryActionBtn, { backgroundColor: colors.brandPrimary }]}
                accessibilityRole="button"
                accessibilityLabel="Edit budget limit"
              >
                <Icon name="Pencil" size={18} color="#FFFFFF" />
                <Text style={[styles.primaryActionText, { fontSize: typography.body.fontSize }]}>Edit Budget Limit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onArchive(budget)}
                style={[styles.secondaryActionBtn, { backgroundColor: withAlpha(colors.error, 0.15) }]}
                accessibilityRole="button"
                accessibilityLabel="Archive budget"
              >
                <Icon name="Trash" size={18} color={colors.error} />
                <Text style={[styles.secondaryActionText, { color: colors.error, fontSize: typography.body.fontSize }]}>
                  Archive Budget
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Close button */}
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeButton, { borderTopColor: colors.borderSubtle }]}
            accessibilityRole="button"
            accessibilityLabel="Close detail sheet"
          >
            <Text style={[styles.closeButtonText, { color: colors.textSecondary, fontSize: typography.body.fontSize }]}>
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#64748B',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  scrollContent: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontWeight: '700',
    marginBottom: 4,
  },
  periodText: {},
  progressCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 12,
  },
  spentValue: {
    fontWeight: '700',
  },
  limitValue: {},
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  percentageText: {},
  remainingText: {
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  metricTile: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
  },
  metricLabel: {
    marginBottom: 4,
  },
  metricValue: {
    fontWeight: '700',
  },
  actionsContainer: {
    gap: 10,
    marginBottom: 10,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  secondaryActionText: {
    fontWeight: '600',
  },
  closeButton: {
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
  },
  closeButtonText: {
    fontWeight: '600',
  },
});
