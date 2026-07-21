import React from 'react';
import { View, Text } from 'react-native';
import { PlusCircle } from 'lucide-react-native';

export const EmptyBudgetState: React.FC = () => {
  return (
    <View className="flex-1 justify-center items-center p-6">
      <PlusCircle size={48} color="#9CA3AF" />
      <Text className="text-lg font-bold text-gray-800 mt-4">No Budgets Found</Text>
      <Text className="text-sm text-gray-500 text-center mt-2">
        Create a budget to start tracking your expenses and stay on top of your financial goals.
      </Text>
    </View>
  );
};
