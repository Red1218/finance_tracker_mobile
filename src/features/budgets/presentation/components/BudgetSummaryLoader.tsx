import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useBudgetSummary } from '../hooks/useBudgetSummary';
import { BudgetsModule } from '../../composition/BudgetsModule';
import { BudgetSummary } from '../../application';

const budgetsModule = new BudgetsModule();

interface BudgetSummaryLoaderProps {
  budgetId: string;
  onEdit?: (summary: BudgetSummary) => void;
  onDelete?: (summary: BudgetSummary) => void;
}

export const BudgetSummaryLoader: React.FC<BudgetSummaryLoaderProps> = ({ budgetId }) => {
  const { summary, isLoading, error } = useBudgetSummary(budgetsModule.getBudgetSummaryUseCase, budgetId);

  if (isLoading) return <ActivityIndicator size="small" color="#2563EB" />;
  if (error || !summary) return <Text className="text-red-500">{error || 'Failed to load summary'}</Text>;

  return (
    <View className="p-4 bg-blue-50 rounded-xl border border-blue-200">
      <Text className="font-bold text-blue-900 text-lg">Overall Budget Summary</Text>
      <Text className="text-sm text-blue-700 mt-1">Spent: {summary.spentAmount} / {summary.budgetAmount} {summary.currency}</Text>
      <Text className="text-xs font-semibold text-blue-600 mt-1">Status: {summary.healthStatus}</Text>
    </View>
  );
};
