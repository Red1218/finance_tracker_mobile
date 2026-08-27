import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SectionStateContainer } from '../common/SectionStateContainer';
import { BudgetHealthViewModel, BudgetHealthRow } from '../../../application/view-models/BudgetHealthViewModel';
import { useTheme } from '../../../../../shared/theme';
import { Card } from '../../../../../shared/components/Card';
import { EmptyState } from '../common/EmptyState';
import { StatusIndicator } from '../../../../../shared/components/StatusIndicator';

interface BudgetHealthSectionProps {
  viewModel: BudgetHealthViewModel;
  onRetry: () => void;
}

export function BudgetHealthSection({ viewModel, onRetry }: BudgetHealthSectionProps) {
  const { colors, typography } = useTheme();

  return (
    <SectionStateContainer
      status={viewModel.status}
      errorMessage={viewModel.error || undefined}
      onRetry={onRetry}
      skeletonHeight={120}
    >
      <Card variant="elevated" style={styles.cardContainer}>
        <Text style={[styles.title, { color: colors.textPrimary, fontSize: typography.heading.fontSize }]} accessibilityRole="header">
          Budget Health
        </Text>
        {(!viewModel.content || viewModel.content.length === 0) ? (
          <EmptyState message="No active budgets configured for this period." />
        ) : (
          viewModel.content.map((budget: BudgetHealthRow, index: number) => {
            const spent = budget.amountConsumed || (budget as unknown as { formattedSpent?: string }).formattedSpent || '₹0';
            const limit = budget.budgetLimit || (budget as unknown as { formattedLimit?: string }).formattedLimit || '₹0';
            const rawRatio = budget.consumptionRatio !== undefined
              ? budget.consumptionRatio * 100
              : ((budget as unknown as { percentageUsed?: number }).percentageUsed ?? 0);

            const percentage = Math.min(Math.max(Math.round(rawRatio * 10) / 10, 0), 100);
            const isWarning = percentage >= 80 || budget.statusLabel === 'AtRisk' || budget.statusLabel === 'OverBudget';
            const statusType = budget.statusLabel === 'OverBudget' ? 'error' : isWarning ? 'warning' : 'success';

            return (
              <View key={index} style={styles.item}>
                {/* Header Row: Title & Percentage Status Badge */}
                <View style={styles.headerRow}>
                  <Text style={[styles.title, { color: colors.textPrimary, fontSize: typography.heading.fontSize }]} accessibilityRole="header">
                    Budget Health
                  </Text>
                  <StatusIndicator
                    status={statusType}
                    label={`${Math.round(percentage)}%`}
                  />
                </View>

                {/* Subtitle Row: spent of limit */}
                <Text style={[styles.spentText, { color: colors.textSecondary, fontSize: typography.body.fontSize }]}>
                  {spent} spent of {limit}
                </Text>

                {/* Progress Bar Track */}
                <View
                  style={[styles.barBackground, { backgroundColor: colors.borderSubtle }]}
                  accessible={true}
                  accessibilityRole="progressbar"
                  accessibilityLabel={`Budget consumption ${percentage}%`}
                  accessibilityValue={{ min: 0, max: 100, now: percentage }}
                >
                  <View
                    style={[
                      styles.barFill,
                      { width: `${percentage}%`, backgroundColor: isWarning ? colors.error : colors.success },
                    ]}
                  />
                </View>

                {/* Footer Row: Status */}
                <Text style={[styles.footerText, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
                  {budget.statusLabel === 'OverBudget' ? 'Over budget limit' : 'Budget on track'}
                </Text>
              </View>
            );
          })
        )}
      </Card>
    </SectionStateContainer>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontWeight: '700',
  },
  spentText: {
    fontWeight: '500',
    marginBottom: 12,
  },
  barBackground: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  footerText: {
    fontWeight: '500',
  },
  item: {
    marginBottom: 0,
  },
});
