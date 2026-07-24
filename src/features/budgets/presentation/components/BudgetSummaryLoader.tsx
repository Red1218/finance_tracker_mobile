import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useBudgetSummary } from '../hooks/useBudgetSummary';
import { budgetsModule } from '../hooks/module';
import { BudgetSummaryCard } from '../components/BudgetSummaryCard';
import { BudgetSummaryViewModel } from '../types/BudgetViewModel';

interface BudgetSummaryLoaderProps {
  budgetId: string;
  onEdit?: (summary: BudgetSummaryViewModel) => void;
  onDelete?: (summary: BudgetSummaryViewModel) => void;
}


export const BudgetSummaryLoader: React.FC<BudgetSummaryLoaderProps> = ({ budgetId, onEdit, onDelete }) => {
  const { data: summary, isLoading, isError } = useBudgetSummary(budgetsModule.getBudgetSummaryUseCase, budgetId);

  if (isLoading) return <ActivityIndicator size="small" color="#2563EB" />;
  if (isError || !summary) return <Text className="text-red-500">Failed to load summary</Text>;

  return (
    <BudgetSummaryCard
      summary={summary}
      onEdit={onEdit ? () => onEdit(summary) : undefined}
      onDelete={onDelete ? () => onDelete(summary) : undefined}
    />
  );
};

