import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { InsightCardViewModel } from '../models/InsightsViewModel';

export interface InsightCardProps {
  insight: InsightCardViewModel;
  onDismiss: (id: string) => void;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight, onDismiss }) => {
  return (
    <View className="bg-gray-900 border border-gray-800 p-4 rounded-2xl mb-3 shadow-sm">
      {/* Top Header: Badge, Source, Dismiss */}
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center space-x-2">
          <View
            className={`px-2.5 py-0.5 rounded-full border ${
              insight.severityColor === 'red'
                ? 'bg-red-950/80 border-red-800/80'
                : insight.severityColor === 'amber'
                ? 'bg-amber-950/80 border-amber-800/80'
                : insight.severityColor === 'emerald'
                ? 'bg-emerald-950/80 border-emerald-800/80'
                : 'bg-blue-950/80 border-blue-800/80'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                insight.severityColor === 'red'
                  ? 'text-red-400'
                  : insight.severityColor === 'amber'
                  ? 'text-amber-400'
                  : insight.severityColor === 'emerald'
                  ? 'text-emerald-400'
                  : 'text-blue-400'
              }`}
            >
              {insight.severityLabel}
            </Text>
          </View>
          <Text className="text-[10px] text-gray-400 font-semibold">{insight.sourceLabel}</Text>
        </View>

        <TouchableOpacity
          onPress={() => onDismiss(insight.id)}
          accessibilityLabel={`Dismiss insight ${insight.title}`}
          className="p-1"
        >
          <Text className="text-gray-500 text-xs font-bold">✕</Text>
        </TouchableOpacity>
      </View>

      {/* Body: Title, Description */}
      <Text className="text-white text-base font-bold mb-1 tracking-tight">{insight.title}</Text>
      <Text className="text-gray-400 text-xs leading-relaxed mb-3">{insight.description}</Text>

      {/* Recommendation Action Pill */}
      {insight.recommendationText && (
        <View className="bg-gray-950/80 border border-gray-800 p-3 rounded-xl mb-2 flex-row items-center justify-between">
          <Text className="text-xs text-gray-300 flex-1 pr-2">💡 {insight.recommendationText}</Text>
        </View>
      )}

      {/* Footer: Confidence & Timestamp */}
      <View className="flex-row justify-between items-center pt-2 border-t border-gray-800/60">
        <Text className="text-[10px] text-gray-400">
          Confidence: <Text className="font-bold text-gray-300">{insight.confidencePercentage}%</Text>
        </Text>
        <Text className="text-[10px] text-gray-400">{insight.generatedAtFormatted}</Text>
      </View>
    </View>
  );
};
