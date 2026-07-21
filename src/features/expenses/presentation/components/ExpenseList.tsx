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
  onRestoreRequest?: (expense: ExpenseItemModel) => void;
  isLoading?: boolean;
  filterState?: {
    visibility?: string;
    searchQuery?: string;
    categoryId?: string;
  };
}

export function ExpenseList({ groupedExpenses, onSelect, onDeleteRequest, onRestoreRequest, isLoading, filterState }: ExpenseListProps) {
  const { colors, spacing, typography } = useTheme();

  if (isLoading && groupedExpenses.length === 0) {
    return (
      <View style={styles.center}>
        <Loading />
      </View>
    );
  }

  if (groupedExpenses.length === 0) {
    let title = "No expenses";
    let description = "Create an expense to get started";
    
    if (filterState?.searchQuery) {
      title = "No results found";
      description = `No expenses match "${filterState.searchQuery}"`;
    } else if (filterState?.visibility === 'deleted') {
      title = "No deleted expenses";
      description = "Deleted expenses will appear here";
    } else if (filterState?.categoryId) {
      title = "No expenses in category";
      description = "No expenses found for this category";
    }

    return (
      <EmptyState
        title={title}
        description={description}
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
          onRestorePress={onRestoreRequest}
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
