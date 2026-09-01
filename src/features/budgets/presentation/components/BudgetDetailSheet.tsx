import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { BudgetViewModel } from '../models/BudgetViewModel';
import { BudgetProgressBar } from './BudgetProgressBar';

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

  const statusColor =
    healthStatus === 'OVER_BUDGET' ? colors.error : healthStatus === 'NEAR_LIMIT' ? colors.warning : colors.success;
  const statusLabel = healthStatus === 'OVER_BUDGET' ? 'Over budget' : healthStatus === 'NEAR_LIMIT' ? 'At risk' : 'On track';

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
              <Text style={[styles.statusText, { color: statusColor, fontSize: typography.body.fontSize }]}>
                {statusLabel}
              </Text>
            </View>

            {/* Progress Section - "left" is the hero, matching Home's ring
                (§6.1: "Left is the question a budget answers; utilized
                makes the reader do the subtraction") */}
            <View style={styles.progressSection}>
              <View style={styles.progressRow}>
                <Text
                  style={[
                    styles.heroValue,
                    { color: colors.textPrimary, fontSize: typography.numericLarge.fontSize, fontVariant: ['tabular-nums'] },
                  ]}
                >
                  ₹{Math.abs(remainingAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  <Text style={[styles.heroSuffix, { color: colors.textSecondary, fontSize: typography.body.fontSize }]}>
                    {' '}
                    {remainingAmount >= 0 ? 'left' : 'over'}
                  </Text>
                </Text>
                <Text
                  style={[
                    styles.percentageValue,
                    { color: statusColor, fontSize: typography.title.fontSize, fontVariant: ['tabular-nums'] },
                  ]}
                >
                  {percentageUsed.toFixed(0)}%
                </Text>
              </View>

              <BudgetProgressBar percentage={percentageUsed} status={healthStatus} />

              <View style={styles.progressFooter}>
                <Text style={[styles.footerText, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
                  ₹{spentAmount.toLocaleString('en-IN', { minimumFractionDigits: 0 })} of ₹
                  {budget.amount.toLocaleString('en-IN', { minimumFractionDigits: 0 })} spent
                </Text>
                <Text style={[styles.footerText, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
                  {daysRemaining} days left
                </Text>
              </View>
            </View>

            {/* Actions - both outlined, neither filled: Edit is the primary
                action (accent outline), Archive is not destructive (fixes
                #10) so it carries no red/warning treatment at all. */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                onPress={() => onEdit(budget)}
                style={[styles.outlineBtn, { borderColor: colors.brandPrimary }]}
                accessibilityRole="button"
                accessibilityLabel="Edit budget limit"
              >
                <Text style={[styles.outlineBtnText, { color: colors.brandPrimary, fontSize: typography.body.fontSize }]}>
                  Edit amount
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onArchive(budget)}
                style={[styles.outlineBtn, { borderColor: colors.borderSubtle }]}
                accessibilityRole="button"
                accessibilityLabel="Archive budget"
              >
                <Text style={[styles.outlineBtnText, { color: colors.textPrimary, fontSize: typography.body.fontSize }]}>
                  Archive
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.consequenceCaption, { color: colors.textMuted, fontSize: typography.caption.fontSize }]}>
              Archiving hides this budget but keeps it in reporting history.
            </Text>
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
  statusText: {
    fontWeight: '700',
  },
  progressSection: {
    marginBottom: 20,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  heroValue: {
    fontWeight: '400',
  },
  heroSuffix: {
    fontWeight: '400',
  },
  percentageValue: {
    fontWeight: '700',
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {},
  actionsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  outlineBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  outlineBtnText: {
    fontWeight: '600',
  },
  consequenceCaption: {
    textAlign: 'center',
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
