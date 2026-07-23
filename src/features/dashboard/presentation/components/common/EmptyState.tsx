import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {/* Illustration placeholder */}
      <View style={styles.circle} />
      <Text style={styles.message} accessible={true} accessibilityRole="text">{message}</Text>
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
    backgroundColor: '#F5F5F5',
    marginBottom: 16,
  },
  message: {
    color: '#757575',
    fontSize: 14,
    textAlign: 'center',
  }
});
