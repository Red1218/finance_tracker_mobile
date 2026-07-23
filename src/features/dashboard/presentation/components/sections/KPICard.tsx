import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendIndicatorViewModel } from '../../../application/view-models/TrendIndicatorViewModel';

interface KPICardProps {
  title: string;
  amount: string;
  trend?: TrendIndicatorViewModel;
}

export function KPICard({ title, amount, trend }: KPICardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{title}</Text>
      <Text style={styles.value} accessible={true} accessibilityLabel={`${title} is ${amount}`}>
        {amount}
      </Text>
      {trend && (
        <View style={styles.trendContainer}>
          <Text style={[styles.trend, trend.direction === 'Positive' ? styles.trendUp : styles.trendDown]}>
            {trend.direction === 'Positive' ? '▲' : '▼'} {trend.label}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trend: {
    fontSize: 12,
    fontWeight: '500',
  },
  trendUp: {
    color: '#10B981',
  },
  trendDown: {
    color: '#EF4444',
  }
});
