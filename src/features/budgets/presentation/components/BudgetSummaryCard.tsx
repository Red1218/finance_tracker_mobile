import React from 'react';
import { View, Text } from 'react-native';
import { BudgetSummaryViewModel } from '../types/BudgetViewModel';
import { BudgetProgressBar } from './BudgetProgressBar';
import { BudgetStatusBadge } from './BudgetStatusBadge';

interface BudgetSummaryCardProps {
  summary: BudgetSummaryViewModel;
}

export const BudgetSummaryCard: React.FC<BudgetSummaryCardProps> = ({ summary }) => {
  return (
    <View className="p-4 bg-white rounded-xl shadow-sm mb-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-gray-900">Total Budget</Text>
        <BudgetStatusBadge status={summary.status} />
      </View>
      
      <View className="mb-4">
        <Text className="text-3xl font-bold text-gray-900">
          {summary.budget.currency} {summary.spentAmount.toFixed(2)}
        </Text>
        <Text className="text-sm text-gray-500">
          of {summary.budget.currency} {summary.budget.amount.toFixed(2)}
        </Text>
      </View>

      <BudgetProgressBar percentage={summary.percentageUsed} status={summary.status} />
      
      <View className="flex-row justify-between mt-2">
        <Text className="text-sm text-gray-600">Remaining</Text>
        <Text className="text-sm font-semibold text-gray-900">
          {summary.budget.currency} {summary.remainingAmount.toFixed(2)}
        </Text>
      </View>
    </View>
  );
};
