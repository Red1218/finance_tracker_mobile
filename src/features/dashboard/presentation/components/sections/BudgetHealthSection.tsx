import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SectionStateContainer } from '../common/SectionStateContainer';
import { SectionViewModel } from '../../../application/view-models/DashboardViewModel';

interface BudgetHealthSectionProps {
  viewModel: SectionViewModel<any>;
  onRetry: () => void;
}

export function BudgetHealthSection({ viewModel, onRetry }: BudgetHealthSectionProps) {
  return (
    <SectionStateContainer
      status={viewModel.status}
      errorMessage={viewModel.error || undefined}
      onRetry={onRetry}
      skeletonHeight={80}
    >
      <View>
        <Text style={styles.title} accessibilityRole="header">Budget Health</Text>
        {viewModel.content?.map((budget: any, index: number) => {
          const percentage = Math.min(Math.max(budget.percentageUsed, 0), 100);
          const isWarning = percentage >= 80;
          
          return (
            <View key={index} style={styles.item}>
              <View style={styles.header}>
                <Text style={styles.label}>{budget.categoryName}</Text>
                <Text style={styles.value}>{budget.formattedSpent} / {budget.formattedLimit}</Text>
              </View>
              <View style={styles.barBackground}>
                <View 
                  style={[
                    styles.barFill, 
                    { width: `${percentage}%`, backgroundColor: isWarning ? '#EF4444' : '#10B981' }
                  ]} 
                />
              </View>
            </View>
          );
        })}
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
  item: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#6B7280',
  },
  barBackground: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  }
});
