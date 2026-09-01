import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/shared/theme';

export interface TransactionDateGroupProps {
  dateLabel: string;
  totalLabel?: string;
}

export function TransactionDateGroup({ dateLabel, totalLabel }: TransactionDateGroupProps) {
  const { colors, typography } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary, fontSize: typography.label.fontSize }]}>
        {dateLabel}
      </Text>
      {totalLabel ? (
        <Text
          style={[styles.total, { color: colors.textSecondary, fontSize: typography.label.fontSize }]}
          accessibilityLabel={`Total ${totalLabel}`}
        >
          {totalLabel}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  label: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  total: {
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
