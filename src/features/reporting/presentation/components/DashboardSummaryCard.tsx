import React from 'react';
import { View, Text } from 'react-native';
import { DashboardSummaryResponse } from '../../application';

interface Props {
  readonly data: DashboardSummaryResponse;
}

export const DashboardSummaryCard: React.FC<Props> = ({ data }) => (
  <View className="bg-white rounded-2xl p-4 m-4 shadow-sm">
    <Text className="text-lg font-semibold text-gray-800 mb-3">Overview</Text>
    <View className="flex-row flex-wrap gap-3">
      <MetricTile label="Income" value={`₹${data.totalIncome.toLocaleString()}`} color="text-green-600" />
      <MetricTile label="Expenses" value={`₹${data.totalExpenses.toLocaleString()}`} color="text-red-500" />
      <MetricTile label="Net Cash Flow" value={`₹${data.netCashFlow.toLocaleString()}`} color="text-blue-600" />
      <MetricTile label="Savings Rate" value={`${data.savingsRate.toFixed(1)}%`} color="text-purple-600" />
      <MetricTile label="Transactions" value={String(data.transactionCount)} color="text-gray-700" />
    </View>
  </View>
);

const MetricTile: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <View className="flex-1 min-w-[40%] bg-gray-50 rounded-xl p-3">
    <Text className="text-xs text-gray-500 mb-1">{label}</Text>
    <Text className={`text-base font-bold ${color}`}>{value}</Text>
  </View>
);
