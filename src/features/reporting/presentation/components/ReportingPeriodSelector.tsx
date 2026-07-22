import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ReportingPeriod } from '../../domain';

const PERIOD_LABELS: Record<ReportingPeriod, string> = {
  [ReportingPeriod.CURRENT_MONTH]: 'This Month',
  [ReportingPeriod.PREVIOUS_MONTH]: 'Last Month',
  [ReportingPeriod.LAST_3_MONTHS]: '3 Months',
  [ReportingPeriod.LAST_6_MONTHS]: '6 Months',
  [ReportingPeriod.LAST_12_MONTHS]: '12 Months',
  [ReportingPeriod.CUSTOM]: 'Custom',
};

interface Props {
  readonly selected: ReportingPeriod;
  readonly onSelect: (period: ReportingPeriod) => void;
}

export const ReportingPeriodSelector: React.FC<Props> = ({ selected, onSelect }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2 px-4">
      {Object.values(ReportingPeriod).map((period) => {
        const isActive = period === selected;
        return (
          <TouchableOpacity
            key={period}
            onPress={() => onSelect(period)}
            className={`mr-2 px-4 py-2 rounded-full ${isActive ? 'bg-blue-600' : 'bg-gray-100'}`}
          >
            <Text className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-600'}`}>
              {PERIOD_LABELS[period]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};
