import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ReportingPeriod } from '../../domain';

const PERIOD_OPTIONS: { period: ReportingPeriod; label: string }[] = [
  { period: ReportingPeriod.TODAY, label: 'Today' },
  { period: ReportingPeriod.WEEK, label: 'Week' },
  { period: ReportingPeriod.MONTH, label: 'Month' },
  { period: ReportingPeriod.QUARTER, label: 'Quarter' },
  { period: ReportingPeriod.YEAR, label: 'Year' },
  { period: ReportingPeriod.CUSTOM, label: 'Custom' },
];

interface Props {
  readonly selected: ReportingPeriod;
  readonly onSelect: (period: ReportingPeriod) => void;
  readonly customStartDate?: Date;
  readonly customEndDate?: Date;
  readonly onCustomRangeChange?: (start: Date, end: Date) => void;
  readonly disabled?: boolean;
}

export const ReportingPeriodSelector: React.FC<Props> = ({
  selected,
  onSelect,
  customStartDate,
  customEndDate,
  onCustomRangeChange,
  disabled = false,
}) => {
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const startDate = customStartDate ?? new Date();
  const endDate = customEndDate ?? new Date();

  const isInvalidRange =
    selected === ReportingPeriod.CUSTOM &&
    customStartDate &&
    customEndDate &&
    customStartDate > customEndDate;

  return (
    <View className="py-2 px-4">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
        {PERIOD_OPTIONS.map(({ period, label }) => {
          const isActive = period === selected;
          return (
            <TouchableOpacity
              key={period}
              onPress={() => onSelect(period)}
              disabled={disabled}
              accessibilityLabel={`Select period ${label}`}
              className={`mr-2 px-4 py-2 rounded-full ${
                isActive ? 'bg-blue-600' : 'bg-gray-100'
              } ${disabled ? 'opacity-50' : 'opacity-100'}`}
            >
              <Text className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-600'}`}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {selected === ReportingPeriod.CUSTOM && (
        <View className="mt-3 p-3 bg-white rounded-xl border border-gray-200">
          <View className="flex-row justify-between gap-3">
            <View className="flex-1">
              <Text className="text-xs font-semibold text-gray-500 mb-1">Start Date</Text>
              <TouchableOpacity
                disabled={disabled}
                onPress={() => setShowStartDatePicker(true)}
                className={`border border-gray-300 rounded-lg p-2 bg-gray-50 ${
                  disabled ? 'opacity-50' : 'opacity-100'
                }`}
                accessibilityLabel="Select start date"
              >
                <Text className="text-xs text-gray-900">
                  {customStartDate ? customStartDate.toLocaleDateString() : 'Pick Start Date'}
                </Text>
              </TouchableOpacity>
              {showStartDatePicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, date) => {
                    if (Platform.OS === 'android') setShowStartDatePicker(false);
                    if (date && onCustomRangeChange) {
                      onCustomRangeChange(date, endDate);
                    }
                  }}
                />
              )}
            </View>

            <View className="flex-1">
              <Text className="text-xs font-semibold text-gray-500 mb-1">End Date</Text>
              <TouchableOpacity
                disabled={disabled}
                onPress={() => setShowEndDatePicker(true)}
                className={`border border-gray-300 rounded-lg p-2 bg-gray-50 ${
                  disabled ? 'opacity-50' : 'opacity-100'
                }`}
                accessibilityLabel="Select end date"
              >
                <Text className="text-xs text-gray-900">
                  {customEndDate ? customEndDate.toLocaleDateString() : 'Pick End Date'}
                </Text>
              </TouchableOpacity>
              {showEndDatePicker && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, date) => {
                    if (Platform.OS === 'android') setShowEndDatePicker(false);
                    if (date && onCustomRangeChange) {
                      onCustomRangeChange(startDate, date);
                    }
                  }}
                />
              )}
            </View>
          </View>

          {isInvalidRange && (
            <Text className="text-xs text-red-500 mt-2 font-medium">
              Start date must be before or equal to End date.
            </Text>
          )}
        </View>
      )}
    </View>
  );
};
