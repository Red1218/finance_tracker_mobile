import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SectionStateContainer } from '../common/SectionStateContainer';
import { SectionViewModel } from '../../../application/view-models/DashboardViewModel';
import { KPICard } from './KPICard';

interface KPICardsSectionProps {
  viewModel: SectionViewModel<any>; // Typically mapped to KPICardViewModel
  onRetry: () => void;
}

export function KPICardsSection({ viewModel, onRetry }: KPICardsSectionProps) {
  return (
    <SectionStateContainer
      status={viewModel.status}
      errorMessage={viewModel.error || undefined}
      onRetry={onRetry}
      skeletonHeight={100}
    >
      <View style={styles.grid}>
        <KPICard title="Total Balance" amount={viewModel.content?.totalBalance || '$0'} trend={viewModel.content?.incomeTrend} />
        <KPICard title="Net Income" amount={viewModel.content?.netForPeriod || '$0'} trend={viewModel.content?.expenseTrend} />
      </View>
    </SectionStateContainer>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trend: {
    fontSize: 12,
    fontWeight: '500',
  },
  trendUp: {
    color: '#10B981',
  },
  trendDown: {
    color: '#EF4444',
  }
});
