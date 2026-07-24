import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BudgetSummaryViewModel } from '../types/BudgetViewModel';
import { BudgetProgressBar } from './BudgetProgressBar';
import { BudgetStatusBadge } from './BudgetStatusBadge';

interface BudgetSummaryCardProps {
  summary: BudgetSummaryViewModel;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const BudgetSummaryCard: React.FC<BudgetSummaryCardProps> = ({ summary, onEdit, onDelete }) => {
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

      {(onEdit || onDelete) && (
        <View className="flex-row justify-end space-x-2 mt-4 pt-3 border-t border-gray-100">
          {onEdit && (
            <TouchableOpacity onPress={onEdit} className="px-3 py-1 bg-blue-50 rounded mr-2">
              <Text className="text-xs font-semibold text-blue-600">Edit</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity onPress={onDelete} className="px-3 py-1 bg-red-50 rounded">
              <Text className="text-xs font-semibold text-red-600">Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

