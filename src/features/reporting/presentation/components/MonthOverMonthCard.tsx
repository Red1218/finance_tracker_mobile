import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { MonthOverMonthComparison } from '../../domain';

interface Props {
  readonly comparison: MonthOverMonthComparison;
}

export const MonthOverMonthCard: React.FC<Props> = ({ comparison }) => {
  const theme = useTheme();

  const pct = comparison.netSavingsPercentageChange;
  const isPositive = comparison.netSavingsDelta > 0;
  const arrow = isPositive ? '▲' : comparison.netSavingsDelta < 0 ? '▼' : '';
  const color = isPositive ? theme.colors.success : comparison.netSavingsDelta < 0 ? theme.colors.error : theme.colors.textSecondary;
  const pctText = pct !== null ? `${arrow} ${Math.abs(pct)}%` : '—';

  return (
    <View
      style={styles.container}
      accessibilityLabel={`Net savings versus the previous period: ${
        pct !== null ? `${isPositive ? 'up' : 'down'} ${Math.abs(pct)} percent` : 'not available'
      }`}
    >
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>vs previous period</Text>
      <Text style={[styles.value, { color }]}>{pctText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
