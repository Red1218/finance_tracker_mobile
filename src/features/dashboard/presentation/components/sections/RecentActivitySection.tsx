import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SectionStateContainer } from '../common/SectionStateContainer';
import { SectionViewModel } from '../../../application/view-models/DashboardViewModel';

interface RecentActivitySectionProps {
  viewModel: SectionViewModel<any>;
  onRetry: () => void;
}

export function RecentActivitySection({ viewModel, onRetry }: RecentActivitySectionProps) {
  return (
    <SectionStateContainer
      status={viewModel.status}
      errorMessage={viewModel.error || undefined}
      onRetry={onRetry}
      skeletonHeight={150}
    >
      <View>
        <Text style={styles.title} accessibilityRole="header">Recent Activity</Text>
        {viewModel.content?.map((activity: any, index: number) => (
          <View key={index} style={styles.row}>
            <View>
              <Text style={styles.description}>{activity.description}</Text>
              <Text style={styles.category}>{activity.categoryName} • {activity.formattedDate}</Text>
            </View>
            <Text style={[styles.amount, activity.type === 'INCOME' ? styles.income : styles.expense]}>
              {activity.type === 'INCOME' ? '+' : '-'}{activity.formattedAmount}
            </Text>
          </View>
        ))}
      </View>
    </SectionStateContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  description: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: '#6B7280',
  },
  amount: {
    fontSize: 14,
    fontWeight: '600',
  },
  income: {
    color: '#10B981',
  },
  expense: {
    color: '#111827',
  }
});
