import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../../../shared/theme';

interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {/* Illustration placeholder */}
      <View style={[styles.circle, { backgroundColor: colors.surfaceElevated }]} />
      <Text style={[styles.message, { color: colors.textSecondary }]} accessible={true} accessibilityRole="text">{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 16,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
  }
});
