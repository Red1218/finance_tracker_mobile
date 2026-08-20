import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SectionStateContainer } from '../common/SectionStateContainer';
import { BudgetHealthViewModel, BudgetHealthRow } from '../../../application/view-models/BudgetHealthViewModel';
import { useTheme } from '../../../../../shared/theme';
import { Card } from '../../../../../shared/components/Card';
import { EmptyState } from '../common/EmptyState';

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
            const categoryName = (budget as unknown as { categoryName?: string }).categoryName || 'Overall Budget';
            const spent = budget.amountConsumed || (budget as unknown as { formattedSpent?: string }).formattedSpent || '₹0';
            const limit = budget.budgetLimit || (budget as unknown as { formattedLimit?: string }).formattedLimit || '₹0';
            const rawRatio = budget.consumptionRatio !== undefined
              ? budget.consumptionRatio * 100
              : ((budget as unknown as { percentageUsed?: number }).percentageUsed ?? 0);

            const percentage = Math.min(Math.max(Math.round(rawRatio * 10) / 10, 0), 100);
            const isWarning = percentage >= 80 || budget.statusLabel === 'AtRisk' || budget.statusLabel === 'OverBudget';

            return (
              <View key={index} style={styles.item}>
                <View style={styles.header}>
                  <Text style={[styles.label, { color: colors.textPrimary, fontSize: typography.body.fontSize }]}>
                    {categoryName}
                  </Text>
                  <Text style={[styles.value, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
                    {spent} / {limit}
                  </Text>
                </View>
                <View style={[styles.barBackground, { backgroundColor: colors.borderSubtle }]}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${percentage}%`, backgroundColor: isWarning ? colors.error : colors.success },
                    ]}
                  />
                </View>
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
  title: {
    fontWeight: '700',
    marginBottom: 16,
  },
  item: {
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontWeight: '600',
  },
  value: {
    fontWeight: '500',
  },
  barBackground: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
});
