import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { BudgetViewModel, BudgetSummaryViewModel } from '../types/BudgetViewModel';
import { BudgetCardLoader } from './BudgetCardLoader';

interface CategoryBudgetListProps {
  budgets: BudgetViewModel[];
  categoryMap?: Map<string, string>;
  onBudgetPress: (summary: BudgetSummaryViewModel) => void;
  onEditBudget?: (summary: BudgetSummaryViewModel) => void;
  onDeleteBudget?: (summary: BudgetSummaryViewModel) => void;
}

export const CategoryBudgetList: React.FC<CategoryBudgetListProps> = ({
  budgets,
  categoryMap,
  onBudgetPress,
  onEditBudget,
  onDeleteBudget,
}) => {
  return (
    <View className="flex-1">
      <Text className="text-lg font-bold text-gray-900 mb-3 px-4">Category Budgets</Text>
      <FlatList
        data={budgets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => {
          const categoryName = item.categoryId ? (categoryMap?.get(item.categoryId) || 'Category ' + item.categoryId) : 'Overall';
          return (
            <BudgetCardLoader 
              budgetId={item.id} 
              categoryName={categoryName} 
              onPress={onBudgetPress}
              onEdit={onEditBudget}
              onDelete={onDeleteBudget}
            />
          );
        }}
      />
    </View>
  );
};

