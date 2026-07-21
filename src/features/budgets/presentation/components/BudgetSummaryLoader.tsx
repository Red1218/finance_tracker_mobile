import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useBudgetSummary } from '../hooks/useBudgetSummary';
import { budgetsModule } from '../hooks/module';
import { BudgetSummaryCard } from '../components/BudgetSummaryCard';

export const BudgetSummaryLoader: React.FC<{ budgetId: string }> = ({ budgetId }) => {
  const { data: summary, isLoading, isError } = useBudgetSummary(budgetsModule.getBudgetSummaryUseCase, budgetId);

  if (isLoading) return <ActivityIndicator size="small" color="#2563EB" />;
  if (isError || !summary) return <Text className="text-red-500">Failed to load summary</Text>;

  return <BudgetSummaryCard summary={summary} />;
};
