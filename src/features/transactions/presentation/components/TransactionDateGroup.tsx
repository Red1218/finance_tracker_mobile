import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/shared/theme';

export interface TransactionDateGroupProps {
  dateLabel: string;
}

export function TransactionDateGroup({ dateLabel }: TransactionDateGroupProps) {
  const { colors, typography } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary, fontSize: typography.label.fontSize }]}>
        {dateLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  label: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
