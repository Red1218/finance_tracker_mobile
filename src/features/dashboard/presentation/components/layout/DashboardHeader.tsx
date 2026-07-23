import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface DashboardHeaderProps {
  title: string;
  selector: React.ReactNode;
}

export function DashboardHeader({ title, selector }: DashboardHeaderProps) {
  return (
    <View style={styles.container} accessible={true} accessibilityRole="header">
      <Text style={styles.title} accessibilityRole="header">{title}</Text>
      <View style={styles.selectorContainer}>
        {selector}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111111',
  },
  selectorContainer: {
    minWidth: 120,
  }
});
