import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SectionStateContainer } from '../common/SectionStateContainer';
import { KPICardViewModel } from '../../../application/view-models/KPICardViewModel';
import { useTheme } from '../../../../../shared/theme';

export interface IncomeExpenseSectionProps {
  viewModel: KPICardViewModel;
  onRetry: () => void;
}

export function IncomeExpenseSection({ viewModel, onRetry }: IncomeExpenseSectionProps) {
  const { colors, radius, typography } = useTheme();
  const content = viewModel.content;
  const periodIncome = content?.periodIncome || '₹0.00';
  const periodExpenses = content?.periodExpenses || '₹0.00';

  return (
    <SectionStateContainer
      status={viewModel.status}
      errorMessage={viewModel.error || undefined}
      onRetry={onRetry}
      skeletonHeight={72}
    >
      <View style={styles.row}>
        <View
          style={[styles.tile, { borderColor: colors.borderSubtle, borderRadius: radius.medium }]}
          accessible={true}
          accessibilityLabel={`Income is ${periodIncome}`}
        >
          <Text style={[styles.tileLabel, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
            Income
          </Text>
          <Text style={[styles.tileValue, { color: colors.textPrimary, fontSize: typography.title.fontSize }]}>
            {periodIncome}
          </Text>
        </View>

        <View
          style={[styles.tile, { borderColor: colors.borderSubtle, borderRadius: radius.medium }]}
          accessible={true}
          accessibilityLabel={`Expenses is ${periodExpenses}`}
        >
          <Text style={[styles.tileLabel, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
            Expenses
          </Text>
          <Text style={[styles.tileValue, { color: colors.textPrimary, fontSize: typography.title.fontSize }]}>
            {periodExpenses}
          </Text>
        </View>
      </View>
    </SectionStateContainer>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  tile: {
    flex: 1,
    borderWidth: 1,
    padding: 16,
    gap: 4,
  },
  tileLabel: {
    fontWeight: '600',
  },
  tileValue: {
    fontWeight: '700',
  },
});
