import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { MonthlyTrendResponse } from '../../application';
import { MonthlyTrendChartMapper } from '../mappers/MonthlyTrendChartMapper';
import { TrendLineChart } from './charts/TrendLineChart';

interface Props {
  readonly data: MonthlyTrendResponse;
}

export const MonthlyTrendCard: React.FC<Props> = ({ data }) => {
  const comparison = data.comparison;
  const chartViewModel = useMemo(() => MonthlyTrendChartMapper.mapToChartViewModel(data), [data]);

  return (
    <View className="bg-white rounded-2xl p-4 m-4 shadow-sm">
      <Text className="text-lg font-semibold text-gray-800 mb-3">Trend & Comparison</Text>

      {comparison && (
        <View className="bg-gray-50 rounded-xl p-3 mb-4 border border-gray-100">
          <Text className="text-xs font-semibold text-gray-500 mb-2">Period Comparison</Text>
          <View className="flex-row justify-between items-center mb-1">
            <View>
              <Text className="text-xs text-gray-400">Current Spend</Text>
              <Text className="text-sm font-bold text-gray-900">
                ₹{comparison.currentTotal.toLocaleString()}
              </Text>
            </View>
            <View>
              <Text className="text-xs text-gray-400 text-right">Previous Spend</Text>
              <Text className="text-sm font-bold text-gray-700 text-right">
                ₹{comparison.previousPeriodTotal.toLocaleString()}
              </Text>
            </View>
            <View>
              <Text className="text-xs text-gray-400 text-right">Change</Text>
              <Text
                className={`text-sm font-bold text-right ${
                  comparison.absoluteChange > 0
                    ? 'text-red-600'
                    : comparison.absoluteChange < 0
                    ? 'text-green-600'
                    : 'text-gray-600'
                }`}
              >
                {comparison.absoluteChange > 0 ? '+' : ''}₹
                {comparison.absoluteChange.toLocaleString()} (
                {comparison.percentageChange >= 0 ? '+' : ''}
                {comparison.percentageChange.toFixed(1)}%)
              </Text>
            </View>
          </View>
        </View>
      )}

      <TrendLineChart viewModel={chartViewModel} />

      {data.items.length === 0 ? (
        <Text className="text-gray-400 text-sm">No trend data for this period.</Text>
      ) : (
        data.items.map((point) => (
          <View key={point.period} className="mb-3 border-b border-gray-100 pb-2">
            <Text className="text-xs font-semibold text-gray-500 mb-1">{point.period}</Text>
            <View className="flex-row justify-between">
              <Text className="text-sm text-green-600">↑ ₹{point.income.toLocaleString()}</Text>
              <Text className="text-sm text-red-500">↓ ₹{point.expenses.toLocaleString()}</Text>
              <Text
                className={`text-sm font-semibold ${
                  point.netCashFlow >= 0 ? 'text-blue-600' : 'text-red-700'
                }`}
              >
                Net ₹{point.netCashFlow.toLocaleString()}
              </Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
};
