import React from 'react';
import { View, Text } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { BudgetChartViewModel } from '../../mappers/BudgetChartMapper';
import { chartTheme } from '../../theme/reportingChartTheme';

interface Props {
  readonly viewModel: BudgetChartViewModel;
}

export const BudgetBarChart: React.FC<Props> = ({ viewModel }) => {
  const { barData, accessibilitySummary } = viewModel;

  if (barData.length === 0) {
    return null;
  }

  return (
    <View
      accessible={true}
      accessibilityRole="image"
      accessibilityLabel={accessibilitySummary}
      className="my-3"
    >
      <View className="flex-row justify-end gap-4 mb-2 pr-2">
        <View className="flex-row items-center gap-1">
          <View className="w-2.5 h-2.5 rounded-sm bg-slate-400" />
          <Text className="text-xs text-gray-600">Budget</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-2.5 h-2.5 rounded-sm bg-blue-600" />
          <Text className="text-xs text-gray-600">Spent</Text>
        </View>
      </View>

      <BarChart
        data={barData}
        height={160}
        barWidth={14}
        initialSpacing={15}
        spacing={12}
        roundedTop
        roundedBottom
        rulesColor={chartTheme.colors.gridLines}
        rulesType="solid"
        noOfSections={4}
        yAxisTextStyle={{ color: chartTheme.colors.textSecondary, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: chartTheme.colors.textSecondary, fontSize: 10 }}
      />
    </View>
  );
};
