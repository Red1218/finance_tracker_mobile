import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useBudgetSummary } from '../hooks/useBudgetSummary';
import { BudgetsModule } from '../../composition/BudgetsModule';
import { BudgetSummary } from '../../application';

const budgetsModule = new BudgetsModule();

interface BudgetCardLoaderProps {
  budgetId: string;
  categoryName: string;
  onPress?: (summary: BudgetSummary) => void;
  onEdit?: (summary: BudgetSummary) => void;
  onDelete?: (summary: BudgetSummary) => void;
}

export const BudgetCardLoader: React.FC<BudgetCardLoaderProps> = ({ budgetId, categoryName }) => {
  const { summary, isLoading, error } = useBudgetSummary(budgetsModule.getBudgetSummaryUseCase, budgetId);

  if (isLoading) return <View className="p-4 mb-3"><ActivityIndicator size="small" color="#2563EB" /></View>;
  if (error || !summary) return <View className="p-4 mb-3"><Text className="text-red-500">{error || 'Error'}</Text></View>;

  return (
    <View className="p-4 mb-3 bg-white rounded-xl border border-gray-200">
      <Text className="font-bold text-gray-900">{categoryName}</Text>
      <Text className="text-sm text-gray-600">Spent: {summary.spentAmount} / {summary.budgetAmount} {summary.currency}</Text>
      <Text className="text-xs text-gray-500 mt-1">Status: {summary.healthStatus}</Text>
    </View>
  );
};
