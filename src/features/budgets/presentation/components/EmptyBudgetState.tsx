import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from '../../../../shared/components';
import { useTheme } from '../../../../shared/theme';

export function EmptyBudgetState() {
  const { colors, typography } = useTheme();

  return (
    <View style={styles.container}>
      <Icon name="Target" size={48} color={colors.textMuted} />
      <Text style={[styles.title, { color: colors.textPrimary, fontSize: typography.title.fontSize }]}>
        No active budgets
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: typography.body.fontSize }]}>
        Tap '+' to create your first spending limit and keep expenses on track.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  title: {
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 20,
  },
});
