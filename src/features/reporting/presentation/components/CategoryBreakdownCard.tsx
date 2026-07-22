import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { CategoryBreakdownResponse } from '../../application';

interface Props {
  readonly data: CategoryBreakdownResponse;
}

export const CategoryBreakdownCard: React.FC<Props> = ({ data }) => (
  <View className="bg-white rounded-2xl p-4 m-4 shadow-sm">
    <Text className="text-lg font-semibold text-gray-800 mb-3">Spending by Category</Text>
    {data.items.length === 0 ? (
      <Text className="text-gray-400 text-sm">No category data for this period.</Text>
    ) : (
      data.items.map((item) => (
        <View key={item.categoryId} className="flex-row justify-between items-center mb-2">
          <Text className="text-sm text-gray-700 flex-1" numberOfLines={1}>{item.categoryName}</Text>
          <Text className="text-sm font-semibold text-gray-900 mr-2">₹{item.amount.toLocaleString()}</Text>
          <Text className="text-xs text-gray-400">{item.percentage.toFixed(1)}%</Text>
        </View>
      ))
    )}
  </View>
);
