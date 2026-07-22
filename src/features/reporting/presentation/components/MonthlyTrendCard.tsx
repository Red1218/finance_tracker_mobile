import React from 'react';
import { View, Text } from 'react-native';
import { MonthlyTrendResponse } from '../../application';

interface Props {
  readonly data: MonthlyTrendResponse;
}

export const MonthlyTrendCard: React.FC<Props> = ({ data }) => (
  <View className="bg-white rounded-2xl p-4 m-4 shadow-sm">
    <Text className="text-lg font-semibold text-gray-800 mb-3">Monthly Trend</Text>
    {data.items.length === 0 ? (
      <Text className="text-gray-400 text-sm">No trend data for this period.</Text>
    ) : (
      data.items.map((point) => (
        <View key={point.period} className="mb-3 border-b border-gray-100 pb-2">
          <Text className="text-xs font-semibold text-gray-500 mb-1">{point.period}</Text>
          <View className="flex-row justify-between">
            <Text className="text-sm text-green-600">↑ ₹{point.income.toLocaleString()}</Text>
            <Text className="text-sm text-red-500">↓ ₹{point.expenses.toLocaleString()}</Text>
            <Text className={`text-sm font-semibold ${point.netCashFlow >= 0 ? 'text-blue-600' : 'text-red-700'}`}>
              Net ₹{point.netCashFlow.toLocaleString()}
            </Text>
          </View>
        </View>
      ))
    )}
  </View>
);
