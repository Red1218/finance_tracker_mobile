import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useReporting } from '../hooks/useReporting';
import { reportingModule } from '../../composition/ReportingModule';
import { ReportingPeriod } from '../../domain';

const PERIOD_OPTIONS: { id: ReportingPeriod; label: string }[] = [
  { id: ReportingPeriod.MONTH, label: 'Month' },
  { id: ReportingPeriod.QUARTER, label: 'Quarter' },
  { id: ReportingPeriod.YEAR, label: 'Year' },
  { id: ReportingPeriod.CUSTOM, label: 'Custom' },
];

export const ReportingScreen: React.FC = () => {
  const { selectedPeriod, viewModel, isLoading, error, changePeriod, refresh } = useReporting(
    reportingModule.reportingController
  );

  return (
    <View className="flex-1 bg-gray-950">
      {/* Header & Period Selector */}
      <View className="p-4 bg-gray-900 border-b border-gray-800">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-2xl font-bold text-white tracking-tight">Reports & Analytics</Text>
          <TouchableOpacity onPress={refresh} className="bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700">
            <Text className="text-xs font-semibold text-gray-300">Refresh</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-2">
          {PERIOD_OPTIONS.map((p) => {
            const isSelected = selectedPeriod === p.id;
            return (
              <TouchableOpacity
                key={p.id}
                onPress={() => changePeriod(p.id)}
                className={`px-3 py-1.5 rounded-lg border ${
                  isSelected ? 'bg-red-600 border-red-500' : 'bg-gray-800 border-gray-700'
                }`}
                accessibilityLabel={`Select ${p.label} period`}
              >
                <Text className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Main Content ScrollView */}
      <ScrollView className="flex-1 p-4">
        {error ? (
          <View className="bg-red-950/80 border border-red-800 p-4 rounded-xl mb-4">
            <Text className="text-red-300 text-sm font-semibold">{error}</Text>
          </View>
        ) : null}

        {isLoading ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color="#EF4444" />
          </View>
        ) : (
          <>
            {/* Financial Summary Cards */}
            {viewModel.financialSummary && (
              <View className="mb-6">
                <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Financial Performance Summary
                </Text>
                <View className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-sm mb-3">
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-gray-400 text-sm">Net Savings</Text>
                    <View className="bg-red-950/60 border border-red-800/60 px-2.5 py-0.5 rounded-full">
                      <Text className="text-red-400 text-xs font-bold">
                        {viewModel.financialSummary.savingsRatePercentage}% Savings Rate
                      </Text>
                    </View>
                  </View>
                  <Text className={`text-3xl font-extrabold ${viewModel.financialSummary.isPositiveSavings ? 'text-emerald-400' : 'text-red-400'}`}>
                    {viewModel.financialSummary.formattedNetSavings}
                  </Text>
                </View>

                <View className="flex-row gap-3">
                  <View className="flex-1 bg-gray-900 border border-gray-800 p-4 rounded-xl">
                    <Text className="text-xs text-gray-400 mb-1">Total Income</Text>
                    <Text className="text-lg font-bold text-emerald-400">
                      {viewModel.financialSummary.formattedIncome}
                    </Text>
                  </View>

                  <View className="flex-row-1 flex-1 bg-gray-900 border border-gray-800 p-4 rounded-xl">
                    <Text className="text-xs text-gray-400 mb-1">Total Expenses</Text>
                    <Text className="text-lg font-bold text-red-400">
                      {viewModel.financialSummary.formattedExpense}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Category Breakdown */}
            <View className="mb-6">
              <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Category Spend Breakdown
              </Text>
              {viewModel.categoryBreakdown.length === 0 ? (
                <View className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                  <Text className="text-gray-500 text-xs">No category expenses found for this period.</Text>
                </View>
              ) : (
                viewModel.categoryBreakdown.map((cat) => (
                  <View key={cat.categoryId} className="bg-gray-900 border border-gray-800 p-3.5 rounded-xl mb-2">
                    <View className="flex-row justify-between items-center mb-1.5">
                      <Text className="text-white text-sm font-semibold">{cat.categoryName}</Text>
                      <Text className="text-gray-300 text-sm font-bold">{cat.formattedAmount}</Text>
                    </View>
                    <View className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                      <View className="bg-red-500 h-full rounded-full" style={{ width: `${Math.min(cat.percentage, 100)}%` }} />
                    </View>
                    <Text className="text-right text-[10px] text-gray-400 mt-1">{cat.percentage}% of total spend</Text>
                  </View>
                ))
              )}
            </View>

            {/* Monthly Trend */}
            <View className="mb-6">
              <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Monthly Trend Analysis
              </Text>
              {viewModel.monthlyTrend.length === 0 ? (
                <View className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                  <Text className="text-gray-500 text-xs">No monthly trend data available.</Text>
                </View>
              ) : (
                viewModel.monthlyTrend.map((p) => (
                  <View key={p.periodLabel} className="bg-gray-900 border border-gray-800 p-3.5 rounded-xl mb-2 flex-row justify-between items-center">
                    <Text className="text-gray-300 font-bold text-sm">{p.periodLabel}</Text>
                    <View className="items-end">
                      <Text className="text-emerald-400 text-xs font-semibold">Income: {p.formattedIncome}</Text>
                      <Text className="text-red-400 text-xs font-semibold">Expenses: {p.formattedExpense}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};
