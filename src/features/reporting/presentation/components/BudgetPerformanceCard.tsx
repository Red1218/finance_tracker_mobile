import React from 'react';
import { View, Text } from 'react-native';
import { BudgetPerformanceResponse } from '../../application';

const STATUS_COLORS: Record<string, string> = {
  'Safe': 'text-green-600',
  'Near Limit': 'text-yellow-600',
  'Over Budget': 'text-red-600',
};

interface Props {
  readonly data: BudgetPerformanceResponse;
}

export const BudgetPerformanceCard: React.FC<Props> = ({ data }) => (
  <View className="bg-white rounded-2xl p-4 m-4 shadow-sm">
    <Text className="text-lg font-semibold text-gray-800 mb-3">Budget Performance</Text>
    {data.items.length === 0 ? (
      <Text className="text-gray-400 text-sm">No budgets for this period.</Text>
    ) : (
      data.items.map((item) => (
        <View key={item.budgetId} className="mb-4">
          <View className="flex-row justify-between mb-1">
            <Text className="text-sm font-medium text-gray-700">{item.categoryName ?? 'Overall'}</Text>
            <Text className={`text-xs font-semibold ${STATUS_COLORS[item.status] ?? 'text-gray-500'}`}>
              {item.status}
            </Text>
          </View>
          <View className="bg-gray-100 h-2 rounded-full overflow-hidden">
            <View
              className="h-2 rounded-full bg-blue-500"
              style={{ width: `${Math.min(item.utilization, 100)}%` }}
            />
          </View>
          <View className="flex-row justify-between mt-1">
            <Text className="text-xs text-gray-400">Spent ₹{item.actualSpent.toLocaleString()}</Text>
            <Text className="text-xs text-gray-400">Budget ₹{item.budgetAmount.toLocaleString()}</Text>
          </View>
        </View>
      ))
    )}
  </View>
);
