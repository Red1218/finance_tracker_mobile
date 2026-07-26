import React from 'react';
import { View, Text } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { CategoryChartViewModel } from '../../mappers/CategoryChartMapper';
import { chartTheme } from '../../theme/reportingChartTheme';

interface Props {
  readonly viewModel: CategoryChartViewModel;
}

export const CategoryDonutChart: React.FC<Props> = ({ viewModel }) => {
  const { pieData, totalSpend, accessibilitySummary } = viewModel;

  if (pieData.length === 0) {
    return null;
  }

  return (
    <View
      accessible={true}
      accessibilityRole="image"
      accessibilityLabel={accessibilitySummary}
      className="items-center my-3"
    >
      <PieChart
        data={pieData}
        donut
        radius={75}
        innerRadius={50}
        innerCircleColor={chartTheme.colors.background}
        centerLabelComponent={() => (
          <View className="items-center justify-center">
            <Text className="text-xs text-gray-400 font-medium">Total</Text>
            <Text className="text-sm font-bold text-gray-800">
              ₹{totalSpend >= 100000 ? `${(totalSpend / 1000).toFixed(0)}k` : totalSpend.toLocaleString()}
            </Text>
          </View>
        )}
      />
    </View>
  );
};
