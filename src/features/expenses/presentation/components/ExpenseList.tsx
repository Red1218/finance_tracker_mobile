import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { EmptyState, Loading } from '../../../../shared/components';
import { useTheme } from '../../../../shared/theme';
import { ExpenseItemModel, GroupedExpenses } from '../models';
import { ExpenseItem } from './ExpenseItem';

interface ExpenseListProps {
  groupedExpenses: GroupedExpenses[];
  onSelect: (expense: ExpenseItemModel) => void;
  onDeleteRequest: (expense: ExpenseItemModel) => void;
  isLoading?: boolean;
}

export function ExpenseList({ groupedExpenses, onSelect, onDeleteRequest, isLoading }: ExpenseListProps) {
  const { colors, spacing, typography } = useTheme();

  if (isLoading && groupedExpenses.length === 0) {
    return (
      <View style={styles.center}>
        <Loading />
      </View>
    );
  }

  if (groupedExpenses.length === 0) {
    return (
      <EmptyState
        title="No expenses"
        description="Create an expense to get started"
      />
    );
  }

  const renderGroup = ({ item: group }: { item: GroupedExpenses }) => (
    <View style={{ marginBottom: spacing.space16 }}>
      <Text style={[typography.label, { color: colors.textSecondary, marginBottom: spacing.space8, paddingHorizontal: spacing.space16 }]}>
        {group.dateHeader}
      </Text>
      {group.data.map((expense) => (
        <ExpenseItem
          key={expense.id}
          expense={expense}
          onPress={onSelect}
          onDeletePress={onDeleteRequest}
        />
      ))}
    </View>
  );

  return (
    <FlatList
      data={groupedExpenses}
      keyExtractor={(item) => item.dateHeader}
      renderItem={renderGroup}
      contentContainerStyle={{ padding: spacing.space16 }}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
