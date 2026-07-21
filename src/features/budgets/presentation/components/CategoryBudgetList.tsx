import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { BudgetViewModel, BudgetSummaryViewModel } from '../types/BudgetViewModel';
import { BudgetCardLoader } from './BudgetCardLoader';

interface CategoryBudgetListProps {
  budgets: BudgetViewModel[];
  onBudgetPress: (summary: BudgetSummaryViewModel) => void;
}

export const CategoryBudgetList: React.FC<CategoryBudgetListProps> = ({ budgets, onBudgetPress }) => {
  return (
    <View className="flex-1">
      <Text className="text-lg font-bold text-gray-900 mb-3 px-4">Category Budgets</Text>
      <FlatList
        data={budgets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <BudgetCardLoader 
            budgetId={item.id} 
            categoryName={item.categoryId ? 'Category ' + item.categoryId : 'Unknown'} 
            onPress={onBudgetPress} 
          />
        )}
      />
    </View>
  );
};
