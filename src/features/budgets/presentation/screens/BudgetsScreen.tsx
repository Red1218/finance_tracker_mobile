import React, { useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useBudgets } from '../hooks/useBudgets';
import { EmptyBudgetState } from '../components/EmptyBudgetState';
import { CategoryBudgetList } from '../components/CategoryBudgetList';
import { BudgetSummaryLoader } from '../components/BudgetSummaryLoader';
import { DeleteBudgetDialog } from '../components/DeleteBudgetDialog';
import { BudgetSummaryViewModel } from '../types/BudgetViewModel';

import { budgetsModule } from '../hooks/module';

export const BudgetsScreen: React.FC = () => {
  const { budgets, isLoading, error } = useBudgets(budgetsModule.listBudgetsUseCase);
  const [selectedBudget, setSelectedBudget] = useState<BudgetSummaryViewModel | null>(null);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-red-500 font-semibold">Failed to load budgets. Please try again.</Text>
      </View>
    );
  }

  const overallBudget = budgets?.find(b => !b.categoryId);
  const categoryBudgets = budgets?.filter(b => b.categoryId) || [];

  if (!budgets || budgets.length === 0) {
    return <EmptyBudgetState />;
  }

  return (
    <View className="flex-1 bg-gray-50">
      {overallBudget && (
        <View className="p-4">
          <BudgetSummaryLoader budgetId={overallBudget.id} />
        </View>
      )}

      <CategoryBudgetList 
        budgets={categoryBudgets} 
        onBudgetPress={(b) => {
          setSelectedBudget(b);
          setDeleteDialogOpen(true);
        }} 
      />

      <DeleteBudgetDialog 
        visible={isDeleteDialogOpen}
        onCancel={() => setDeleteDialogOpen(false)}
        onConfirm={() => {
          // Trigger delete hook here
          setDeleteDialogOpen(false);
        }}
      />
    </View>
  );
};
