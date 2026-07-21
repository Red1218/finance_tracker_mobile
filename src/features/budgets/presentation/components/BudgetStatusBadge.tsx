import React from 'react';
import { View, Text } from 'react-native';

interface BudgetStatusBadgeProps {
  status: 'OnTrack' | 'AtRisk' | 'Overbudget';
}

export const BudgetStatusBadge: React.FC<BudgetStatusBadgeProps> = ({ status }) => {
  let bgColor = 'bg-green-100';
  let textColor = 'text-green-800';
  let label = 'On Track';

  if (status === 'AtRisk') {
    bgColor = 'bg-yellow-100';
    textColor = 'text-yellow-800';
    label = 'At Risk';
  } else if (status === 'Overbudget') {
    bgColor = 'bg-red-100';
    textColor = 'text-red-800';
    label = 'Overbudget';
  }

  return (
    <View className={`px-2 py-1 rounded-md ${bgColor}`}>
      <Text className={`text-xs font-semibold ${textColor}`}>{label}</Text>
    </View>
  );
};
