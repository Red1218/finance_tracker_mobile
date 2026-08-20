import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../../../shared/theme';
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
  const theme = useTheme();
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
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {PERIOD_OPTIONS.map(({ period, label }) => {
          const isActive = period === selected;
          return (
            <TouchableOpacity
              key={period}
              onPress={() => onSelect(period)}
              disabled={disabled}
              accessibilityLabel={`Select period ${label}`}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive ? theme.colors.brandPrimary : theme.colors.surfaceElevated,
                  borderColor: isActive ? theme.colors.brandPrimary : theme.colors.borderSubtle,
                  opacity: disabled ? 0.5 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: isActive ? theme.colors.textPrimary : theme.colors.textSecondary, fontWeight: isActive ? '700' : '500' },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {selected === ReportingPeriod.CUSTOM && (
        <View style={[styles.customBox, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.borderSubtle }]}>
          <View style={styles.pickerRow}>
            <View style={styles.pickerCol}>
              <Text style={[styles.pickerLabel, { color: theme.colors.textMuted }]}>Start Date</Text>
              <TouchableOpacity
                disabled={disabled}
                onPress={() => setShowStartDatePicker(true)}
                style={[styles.pickerButton, { backgroundColor: theme.colors.surfacePrimary, borderColor: theme.colors.borderSubtle, opacity: disabled ? 0.5 : 1 }]}
                accessibilityLabel="Select start date"
              >
                <Text style={[styles.pickerText, { color: theme.colors.textPrimary }]}>
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

            <View style={styles.pickerCol}>
              <Text style={[styles.pickerLabel, { color: theme.colors.textMuted }]}>End Date</Text>
              <TouchableOpacity
                disabled={disabled}
                onPress={() => setShowEndDatePicker(true)}
                style={[styles.pickerButton, { backgroundColor: theme.colors.surfacePrimary, borderColor: theme.colors.borderSubtle, opacity: disabled ? 0.5 : 1 }]}
                accessibilityLabel="Select end date"
              >
                <Text style={[styles.pickerText, { color: theme.colors.textPrimary }]}>
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
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              Start date must be before or equal to End date.
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
  },
  customBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  pickerCol: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  pickerButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
  },
  pickerText: {
    fontSize: 12,
  },
  errorText: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
});
