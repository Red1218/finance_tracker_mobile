import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useBudgetSummary } from '../hooks/useBudgetSummary';
import { budgetsModule } from '../hooks/module';
import { BudgetCard } from '../components/BudgetCard';
import { BudgetSummaryViewModel } from '../types/BudgetViewModel';

interface BudgetCardLoaderProps {
  budgetId: string;
  categoryName: string;
  onPress: (summary: BudgetSummaryViewModel) => void;
  onEdit?: (summary: BudgetSummaryViewModel) => void;
  onDelete?: (summary: BudgetSummaryViewModel) => void;
}

export const BudgetCardLoader: React.FC<BudgetCardLoaderProps> = ({ budgetId, categoryName, onPress, onEdit, onDelete }) => {
  const { data: summary, isLoading, isError } = useBudgetSummary(budgetsModule.getBudgetSummaryUseCase, budgetId);

  if (isLoading) return <View className="p-4 mb-3"><ActivityIndicator size="small" color="#2563EB" /></View>;
  if (isError || !summary) return <View className="p-4 mb-3"><Text className="text-red-500">Error</Text></View>;

  return (
    <BudgetCard
      summary={summary}
      categoryName={categoryName}
      onPress={() => onPress(summary)}
      onEdit={onEdit ? () => onEdit(summary) : undefined}
      onDelete={onDelete ? () => onDelete(summary) : undefined}
    />
  );
};

