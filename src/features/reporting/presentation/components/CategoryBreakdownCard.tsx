import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { CategoryBreakdownResponse } from '../../application';
import { CategoryChartMapper } from '../mappers/CategoryChartMapper';
import { CategoryDonutChart } from './charts/CategoryDonutChart';
import { chartTheme } from '../theme/reportingChartTheme';

interface Props {
  readonly data: CategoryBreakdownResponse;
}

export const CategoryBreakdownCard: React.FC<Props> = ({ data }) => {
  const chartViewModel = useMemo(() => CategoryChartMapper.mapToChartViewModel(data), [data]);

  return (
    <View className="bg-white rounded-2xl p-4 m-4 shadow-sm">
      <Text className="text-lg font-semibold text-gray-800 mb-1">Spending by Category</Text>

      <CategoryDonutChart viewModel={chartViewModel} />

      {data.items.length === 0 ? (
        <Text className="text-gray-400 text-sm">No category data for this period.</Text>
      ) : (
        data.items.map((item, index) => (
          <View key={item.categoryId} className="flex-row justify-between items-center mb-2">
            <View className="flex-row items-center flex-1 mr-2">
              <View
                className="w-3 h-3 rounded-full mr-2"
                style={{
                  backgroundColor:
                    chartTheme.categoryPalette[index % chartTheme.categoryPalette.length],
                }}
              />
              <Text className="text-sm text-gray-700 flex-1" numberOfLines={1}>
                {item.categoryName}
              </Text>
            </View>
            <Text className="text-sm font-semibold text-gray-900 mr-2">
              ₹{item.amount.toLocaleString()}
            </Text>
            <Text className="text-xs text-gray-400 w-12 text-right">
              {item.percentage.toFixed(1)}%
            </Text>
          </View>
        ))
      )}
    </View>
  );
};
