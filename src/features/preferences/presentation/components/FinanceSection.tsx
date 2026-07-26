import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { WeekStart, DecimalPrecision } from '../../domain';
import { FinanceViewModel } from '../models/PreferencesViewModel';

interface FinanceSectionProps {
  viewModel: FinanceViewModel;
  onWeekStartChange: (weekStart: WeekStart) => void;
  onDecimalPrecisionChange: (precision: DecimalPrecision) => void;
  disabled?: boolean;
}

export function FinanceSection({
  viewModel,
  onWeekStartChange,
  onDecimalPrecisionChange,
  disabled,
}: FinanceSectionProps) {
  const { colors, spacing, typography, radius } = useTheme();

  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.surfacePrimary, borderRadius: radius.medium, padding: spacing.space16, marginBottom: spacing.space16 }]}>
      <Text style={[{ color: colors.textPrimary, marginBottom: spacing.space16 }, typography.title]}>
        Finance
      </Text>

      {/* Currency Code Display */}
      <View style={styles.row}>
        <Text style={[{ color: colors.textSecondary }, typography.body]}>Currency</Text>
        <Text style={[{ color: colors.textPrimary, fontWeight: 'bold' }, typography.body]}>
          {viewModel.currencyCode} (INR)
        </Text>
      </View>

      <View style={{ height: spacing.space16 }} />

      {/* First Day of Week Selector */}
      <Text style={[{ color: colors.textSecondary, marginBottom: spacing.space8 }, typography.label]}>
        First Day of Week
      </Text>

      <View style={[styles.segmentedContainer, { backgroundColor: colors.backgroundPrimary, borderRadius: radius.small, marginBottom: spacing.space16 }]}>
        <Pressable
          style={[
            styles.segmentButton,
            viewModel.weekStart === WeekStart.Monday && { backgroundColor: colors.surfacePrimary, borderRadius: radius.small },
          ]}
          onPress={() => onWeekStartChange(WeekStart.Monday)}
          disabled={disabled}
        >
          <Text style={[typography.label, { color: viewModel.weekStart === WeekStart.Monday ? colors.textPrimary : colors.textSecondary }]}>
            Monday
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.segmentButton,
            viewModel.weekStart === WeekStart.Sunday && { backgroundColor: colors.surfacePrimary, borderRadius: radius.small },
          ]}
          onPress={() => onWeekStartChange(WeekStart.Sunday)}
          disabled={disabled}
        >
          <Text style={[typography.label, { color: viewModel.weekStart === WeekStart.Sunday ? colors.textPrimary : colors.textSecondary }]}>
            Sunday
          </Text>
        </Pressable>
      </View>

      {/* Decimal Precision Selector */}
      <Text style={[{ color: colors.textSecondary, marginBottom: spacing.space8 }, typography.label]}>
        Decimal Precision
      </Text>

      <View style={[styles.segmentedContainer, { backgroundColor: colors.backgroundPrimary, borderRadius: radius.small }]}>
        <Pressable
          style={[
            styles.segmentButton,
            viewModel.decimalPrecision === DecimalPrecision.Zero && { backgroundColor: colors.surfacePrimary, borderRadius: radius.small },
          ]}
          onPress={() => onDecimalPrecisionChange(DecimalPrecision.Zero)}
          disabled={disabled}
        >
          <Text style={[typography.label, { color: viewModel.decimalPrecision === DecimalPrecision.Zero ? colors.textPrimary : colors.textSecondary }]}>
            0 (e.g. ₹5,000)
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.segmentButton,
            viewModel.decimalPrecision === DecimalPrecision.Two && { backgroundColor: colors.surfacePrimary, borderRadius: radius.small },
          ]}
          onPress={() => onDecimalPrecisionChange(DecimalPrecision.Two)}
          disabled={disabled}
        >
          <Text style={[typography.label, { color: viewModel.decimalPrecision === DecimalPrecision.Two ? colors.textPrimary : colors.textSecondary }]}>
            2 (e.g. ₹5,000.00)
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: {},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  segmentedContainer: {
    flexDirection: 'row',
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
