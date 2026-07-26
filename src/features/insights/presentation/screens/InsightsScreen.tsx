import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useInsights } from '../hooks/useInsights';
import { insightsModule } from '../../composition/InsightsModule';
import { InsightCard } from '../components/InsightCard';

export const InsightsScreen: React.FC = () => {
  const { viewModel, isLoading, error, refresh, dismiss } = useInsights(
    insightsModule.insightsController
  );

  return (
    <View className="flex-1 bg-gray-950">
      {/* Top Header */}
      <View className="p-4 bg-gray-900 border-b border-gray-800 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-white tracking-tight">AI Insights</Text>
          <Text className="text-xs text-gray-400">Smart Financial Analysis & Forecasting</Text>
        </View>
        <TouchableOpacity onPress={refresh} className="bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700">
          <Text className="text-xs font-semibold text-gray-300">Refresh</Text>
        </TouchableOpacity>
      </View>

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
            {/* Forecast Section */}
            {viewModel.forecast && (
              <View className="mb-6">
                <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  30-Day Cash Flow Forecast
                </Text>
                <View className="bg-gray-900 border border-gray-800 p-4 rounded-2xl">
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-gray-400 text-xs">{viewModel.forecast.forecastPeriodLabel}</Text>
                    <View className="bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                      <Text className="text-emerald-400 text-[10px] font-bold">
                        {viewModel.forecast.confidencePercentage}% Confidence
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="text-xs text-gray-400">Projected Net Savings</Text>
                      <Text className={`text-2xl font-extrabold ${viewModel.forecast.isPositiveSavings ? 'text-emerald-400' : 'text-red-400'}`}>
                        {viewModel.forecast.formattedProjectedSavings}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-xs text-emerald-400 font-semibold">
                        Inc: {viewModel.forecast.formattedPredictedIncome}
                      </Text>
                      <Text className="text-xs text-red-400 font-semibold">
                        Exp: {viewModel.forecast.formattedPredictedExpense}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Analytical Observations Section */}
            <View className="mb-6">
              <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Active Recommendations & Observations
              </Text>
              {viewModel.insights.length === 0 ? (
                <View className="bg-gray-900 p-6 rounded-2xl border border-gray-800 items-center">
                  <Text className="text-gray-400 text-sm font-semibold mb-1">All Clear!</Text>
                  <Text className="text-gray-500 text-xs text-center">
                    No active anomalies or spending warnings detected.
                  </Text>
                </View>
              ) : (
                viewModel.insights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} onDismiss={dismiss} />
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};
