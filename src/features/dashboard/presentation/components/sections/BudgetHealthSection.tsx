import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SectionStateContainer } from '../common/SectionStateContainer';
import { BudgetHealthViewModel, BudgetHealthRow } from '../../../application/view-models/BudgetHealthViewModel';
import { useTheme } from '../../../../../shared/theme';
import { Card } from '../../../../../shared/components/Card';
import { EmptyState } from '../common/EmptyState';
import { StatusIndicator } from '../../../../../shared/components/StatusIndicator';
import { MonthlyBudgetCard } from './MonthlyBudgetCard';

export interface BudgetHealthSectionProps {
  viewModel: BudgetHealthViewModel;
  onRetry: () => void;
  onNavigateToBudgets?: () => void;
}

export function BudgetHealthSection({ viewModel, onRetry, onNavigateToBudgets }: BudgetHealthSectionProps) {
  const { colors, typography } = useTheme();

  const contentRows = viewModel.content || [];

  // Identify if an overall/global budget row exists (where categoryId is undefined or isOverall is true)
  // Or if there is a single aggregate budget row provided by ViewModel
  const globalBudgetRow = contentRows.find(
    (row: any) => row.isOverall === true || row.categoryId === undefined
  );

  return (
    <SectionStateContainer
      status={viewModel.status}
      errorMessage={viewModel.error || undefined}
      onRetry={onRetry}
      skeletonHeight={140}
    >
      {contentRows.length === 0 ? (
        // State C: No budgets exist -> Empty State Card with setup action
        <Card variant="elevated" style={styles.cardContainer}>
          <Text
            style={[styles.title, { color: colors.textPrimary, fontSize: typography.heading.fontSize }]}
            accessibilityRole="header"
          >
            Monthly Budget
          </Text>
          <View style={styles.emptyContainer}>
            <EmptyState message="No active budgets configured for this period." />
            {onNavigateToBudgets ? (
              <Pressable
                onPress={onNavigateToBudgets}
                style={({ pressed }) => [
                  styles.setupButton,
                  { backgroundColor: colors.brandPrimary },
                  pressed && styles.pressed,
                ]}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Set up a budget"
              >
                <Text style={[styles.setupButtonText, { color: colors.textPrimary }]}>
                  Set Up Budget
                </Text>
              </Pressable>
            ) : null}
          </View>
        </Card>
      ) : globalBudgetRow ? (
        // State A: Overall/Global budget exists -> Render MonthlyBudgetCard
        <MonthlyBudgetCard budget={globalBudgetRow} />
      ) : (
        // State B: Category budgets only -> Render linear progress list per category
        <Card variant="elevated" style={styles.cardContainer}>
          <Text
            style={[styles.title, { color: colors.textPrimary, fontSize: typography.heading.fontSize, marginBottom: 12 }]}
            accessibilityRole="header"
          >
            Budget Health
          </Text>
          {contentRows.map((budget: BudgetHealthRow, index: number) => {
            const spent = budget.amountConsumed;
            const limit = budget.budgetLimit;
            const percentage = Math.min(Math.max(Math.round(budget.consumptionRatio), 0), 100);
            const statusType =
              budget.statusLabel === 'OverBudget' ? 'error' : budget.statusLabel === 'AtRisk' ? 'warning' : 'success';

            return (
              <View
                key={index}
                style={[
                  styles.item,
                  index < contentRows.length - 1 && [
                    styles.itemBorder,
                    { borderBottomColor: colors.surfaceElevatedHairline },
                  ],
                ]}
              >
                <View style={styles.headerRow}>
                  <Text style={[styles.categoryTitle, { color: colors.textPrimary, fontSize: typography.body.fontSize }]}>
                    {(budget as any).categoryName || `Budget #${index + 1}`}
                  </Text>
                  <StatusIndicator status={statusType} label={`${percentage}%`} />
                </View>

                <Text style={[styles.spentText, { color: colors.textSecondary, fontSize: typography.body.fontSize }]}>
                  {spent} spent of {limit}
                </Text>

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
                      {
                        width: `${percentage}%`,
                        backgroundColor:
                          statusType === 'error' ? colors.error : statusType === 'warning' ? colors.warning : colors.success,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </Card>
      )}
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
  categoryTitle: {
    fontWeight: '600',
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
  },
  setupButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  setupButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  item: {
    marginBottom: 12,
  },
  itemBorder: {
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
  pressed: {
    opacity: 0.7,
  },
});
