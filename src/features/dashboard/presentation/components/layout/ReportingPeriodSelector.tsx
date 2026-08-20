import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../../../../shared/theme';

interface ReportingPeriodSelectorProps {
  currentPeriodId: string;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (periodType: string) => void;
}

export function ReportingPeriodSelector({
  currentPeriodId,
  isOpen,
  onToggle,
  onSelect,
}: ReportingPeriodSelectorProps) {
  const { colors, typography } = useTheme();

  const label =
    currentPeriodId === 'CurrentMonth'
      ? 'This Month'
      : currentPeriodId === 'PreviousMonth'
      ? 'Last Month'
      : currentPeriodId === 'YearToDate'
      ? 'Year to Date'
      : currentPeriodId;

  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.button,
          {
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.borderSubtle,
          },
        ]}
        onPress={onToggle}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Reporting Period, currently ${label}`}
        accessibilityState={{ expanded: isOpen }}
      >
        <Text style={[styles.buttonText, { color: colors.textPrimary, fontSize: typography.caption.fontSize }]}>
          {label} ▼
        </Text>
      </Pressable>

      {isOpen && (
        <View
          style={[
            styles.dropdown,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.borderSubtle,
            },
          ]}
        >
          <Pressable
            style={({ pressed }) => [styles.option, pressed && { backgroundColor: colors.borderSubtle }]}
            onPress={() => onSelect('CurrentMonth')}
            accessibilityRole="button"
            accessibilityLabel="Select This Month"
          >
            <Text style={[styles.optionText, { color: colors.textPrimary }]}>This Month</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.option, pressed && { backgroundColor: colors.borderSubtle }]}
            onPress={() => onSelect('PreviousMonth')}
            accessibilityRole="button"
            accessibilityLabel="Select Last Month"
          >
            <Text style={[styles.optionText, { color: colors.textPrimary }]}>Last Month</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.option, pressed && { backgroundColor: colors.borderSubtle }]}
            onPress={() => onSelect('YearToDate')}
            accessibilityRole="button"
            accessibilityLabel="Select Year to Date"
          >
            <Text style={[styles.optionText, { color: colors.textPrimary }]}>Year to Date</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 10,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: '600',
  },
  dropdown: {
    position: 'absolute',
    top: 50,
    right: 0,
    width: 150,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
    paddingVertical: 4,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
