import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { BudgetItemModel } from '../models';
import { BudgetItem } from './BudgetItem';

interface BudgetListProps {
  budgets: BudgetItemModel[];
  isLoading: boolean;
  onBudgetPress: (budget: BudgetItemModel) => void;
  onDeleteBudget: (budget: BudgetItemModel) => void;
}

export function BudgetList({ budgets, isLoading, onBudgetPress, onDeleteBudget }: BudgetListProps) {
  const { colors, spacing, typography } = useTheme();

  if (isLoading && budgets.length === 0) {
    return (
      <View style={[styles.emptyContainer, { padding: spacing.space24 }]}>
        <Text style={[typography.body, { color: colors.textSecondary }]}>Loading budgets...</Text>
      </View>
    );
  }

  if (budgets.length === 0) {
    return (
      <View style={[styles.emptyContainer, { padding: spacing.space24 }]}>
        <Text style={[typography.body, { color: colors.textSecondary }]}>No budgets found.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={budgets}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <BudgetItem 
          budget={item}
          onPress={onBudgetPress}
          onDeletePress={onDeleteBudget}
        />
      )}
      contentContainerStyle={{ paddingBottom: spacing.space24 }}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
