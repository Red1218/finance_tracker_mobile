import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BudgetSummaryViewModel } from '../types/BudgetViewModel';
import { BudgetProgressBar } from './BudgetProgressBar';

interface BudgetCardProps {
  summary: BudgetSummaryViewModel;
  categoryName: string;
  onPress?: () => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({ summary, categoryName, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress} className="p-4 bg-white rounded-xl shadow-sm mb-3">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-md font-semibold text-gray-800">{categoryName}</Text>
        <Text className="text-sm text-gray-600">
          {summary.budget.currency} {summary.spentAmount.toFixed(0)} / {summary.budget.amount.toFixed(0)}
        </Text>
      </View>

      <BudgetProgressBar percentage={summary.percentageUsed} status={summary.status} />

      <View className="flex-row justify-between mt-2">
        <Text className="text-xs text-gray-500">{summary.percentageUsed.toFixed(0)}% used</Text>
        <Text className="text-xs font-medium text-gray-700">
          {summary.remainingAmount > 0 
            ? `${summary.remainingAmount.toFixed(0)} left`
            : `${Math.abs(summary.remainingAmount).toFixed(0)} over`}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
