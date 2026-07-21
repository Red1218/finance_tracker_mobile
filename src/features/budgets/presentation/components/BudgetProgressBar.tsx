import React from 'react';
import { View } from 'react-native';

interface BudgetProgressBarProps {
  percentage: number;
  status: 'OnTrack' | 'AtRisk' | 'Overbudget';
}

export const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({ percentage, status }) => {
  const cappedPercentage = Math.min(percentage, 100);
  
  let color = 'bg-green-500';
  if (status === 'AtRisk') color = 'bg-yellow-500';
  if (status === 'Overbudget') color = 'bg-red-500';

  return (
    <View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <View 
        className={`h-full ${color}`} 
        style={{ width: `${cappedPercentage}%` }} 
      />
    </View>
  );
};
