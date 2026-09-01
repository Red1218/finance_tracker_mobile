import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../../../../shared/theme';

interface RetryButtonProps {
  message?: string;
  onRetry: () => void;
}

export function RetryButton({ message = 'Something went wrong', onRetry }: RetryButtonProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.message, { color: colors.error }]} accessible={true} accessibilityRole="alert">{message}</Text>
      <Pressable
        onPress={onRetry}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle },
          pressed && styles.pressed,
        ]}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Retry loading section"
      >
        <Text style={[styles.buttonText, { color: colors.textPrimary }]}>Retry</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  message: {
    marginBottom: 12,
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minHeight: 44,
    minWidth: 44, // Touch target sizing PC-006
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  buttonText: {
    fontWeight: '600',
  }
});
