import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SectionStateContainer } from '../common/SectionStateContainer';
import { KPICardViewModel } from '../../../application/view-models/KPICardViewModel';
import { KPICard } from './KPICard';

interface KPICardsSectionProps {
  viewModel: KPICardViewModel;
  onRetry: () => void;
}

export function KPICardsSection({ viewModel, onRetry }: KPICardsSectionProps) {
  const content = viewModel.content;

  return (
    <SectionStateContainer
      status={viewModel.status}
      errorMessage={viewModel.error || undefined}
      onRetry={onRetry}
      skeletonHeight={140}
    >
      <View style={styles.grid}>
        <KPICard
          title="Total Balance"
          amount={content?.totalBalance || '₹0'}
          trend={content?.incomeTrend}
        />
        <KPICard
          title="Period Income"
          amount={content?.periodIncome || '₹0'}
          trend={content?.incomeTrend}
        />
        <KPICard
          title="Period Expenses"
          amount={content?.periodExpenses || '₹0'}
          trend={content?.expenseTrend}
        />
        <KPICard
          title="Net Cash Flow"
          amount={content?.netForPeriod || '₹0'}
          trend={content?.expenseTrend}
        />
      </View>
    </SectionStateContainer>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
});
