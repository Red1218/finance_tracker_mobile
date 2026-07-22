import React from 'react';
import { View, Text } from 'react-native';
import { LargestTransactionsResponse } from '../../application';

interface Props {
  readonly data: LargestTransactionsResponse;
}

export const LargestTransactionsCard: React.FC<Props> = ({ data }) => (
  <View className="bg-white rounded-2xl p-4 m-4 shadow-sm">
    <Text className="text-lg font-semibold text-gray-800 mb-3">Largest Transactions</Text>
    {data.items.length === 0 ? (
      <Text className="text-gray-400 text-sm">No transactions for this period.</Text>
    ) : (
      data.items.map((item) => (
        <View key={item.expenseId} className="flex-row justify-between items-center mb-3">
          <View className="flex-1 mr-2">
            <Text className="text-sm font-medium text-gray-800" numberOfLines={1}>{item.merchant}</Text>
            <Text className="text-xs text-gray-400">{item.categoryName} · {item.transactionDate}</Text>
          </View>
          <Text className="text-sm font-bold text-gray-900">₹{item.amount.toLocaleString()}</Text>
        </View>
      ))
    )}
  </View>
);
