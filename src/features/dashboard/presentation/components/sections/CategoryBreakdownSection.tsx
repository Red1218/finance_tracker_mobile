import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SectionStateContainer } from '../common/SectionStateContainer';
import { SectionViewModel } from '../../../application/view-models/DashboardViewModel';

interface CategoryBreakdownSectionProps {
  viewModel: SectionViewModel<any>;
  onRetry: () => void;
}

export function CategoryBreakdownSection({ viewModel, onRetry }: CategoryBreakdownSectionProps) {
  return (
    <SectionStateContainer
      status={viewModel.status}
      errorMessage={viewModel.error || undefined}
      onRetry={onRetry}
      skeletonHeight={120}
    >
      <View>
        <Text style={styles.title} accessibilityRole="header">Top Spending Categories</Text>
        {viewModel.content?.map((category: any, index: number) => (
          <View key={index} style={styles.row}>
            <View style={styles.left}>
              <View style={[styles.dot, { backgroundColor: category.colorCode || '#D1D5DB' }]} />
              <Text style={styles.name}>{category.name}</Text>
            </View>
            <View style={styles.right}>
              <Text style={styles.amount}>{category.amountSpent}</Text>
              <Text style={styles.percentage}>{Math.round(category.proportion * 100)}%</Text>
            </View>
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
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  name: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  percentage: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  }
});
