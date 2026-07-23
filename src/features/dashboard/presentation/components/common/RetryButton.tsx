import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

interface RetryButtonProps {
  message?: string;
  onRetry: () => void;
}

export function RetryButton({ message = 'Something went wrong', onRetry }: RetryButtonProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.message} accessible={true} accessibilityRole="alert">{message}</Text>
      <Pressable 
        onPress={onRetry} 
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Retry loading section"
      >
        <Text style={styles.buttonText}>Retry</Text>
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
    color: '#D32F2F',
    marginBottom: 12,
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#E0E0E0',
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
    color: '#333333',
    fontWeight: '600',
  }
});
