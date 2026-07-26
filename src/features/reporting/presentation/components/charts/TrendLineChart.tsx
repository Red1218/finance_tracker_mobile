import React from 'react';
import { View, Text } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { MonthlyTrendChartViewModel } from '../../mappers/MonthlyTrendChartMapper';
import { chartTheme } from '../../theme/reportingChartTheme';

interface Props {
  readonly viewModel: MonthlyTrendChartViewModel;
}

export const TrendLineChart: React.FC<Props> = ({ viewModel }) => {
  const { expenseData, incomeData, accessibilitySummary } = viewModel;

  if (expenseData.length === 0) {
    return null;
  }

  return (
    <View
      accessible={true}
      accessibilityRole="image"
      accessibilityLabel={accessibilitySummary}
      className="my-2"
    >
      <View className="flex-row justify-end gap-4 mb-2 pr-2">
        <View className="flex-row items-center gap-1">
          <View className="w-2.5 h-2.5 rounded-full bg-red-600" />
          <Text className="text-xs text-gray-600">Expenses</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-2.5 h-2.5 rounded-full bg-green-600" />
          <Text className="text-xs text-gray-600">Income</Text>
        </View>
      </View>

      <LineChart
        data={expenseData}
        data2={incomeData}
        height={180}
        color1={chartTheme.colors.expense}
        color2={chartTheme.colors.income}
        thickness={2.5}
        dataPointsColor1={chartTheme.colors.expense}
        dataPointsColor2={chartTheme.colors.income}
        dataPointsRadius={3}
        spacing={expenseData.length <= 6 ? 50 : Math.max(25, 280 / expenseData.length)}
        initialSpacing={15}
        endSpacing={15}
        yAxisTextStyle={{ color: chartTheme.colors.textSecondary, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: chartTheme.colors.textSecondary, fontSize: 10 }}
        rulesColor={chartTheme.colors.gridLines}
        rulesType="solid"
        noOfSections={4}
        hideDataPoints={expenseData.length > 20}
        curved={false}
      />
    </View>
  );
};
