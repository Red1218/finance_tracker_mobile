import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../../../shared/theme';
import { Card } from '../../../../../shared/components/Card';
import { TrendIndicatorViewModel } from '../../../application/view-models/TrendIndicatorViewModel';

interface KPICardProps {
  title: string;
  amount: string;
  trend?: TrendIndicatorViewModel;
}

export function KPICard({ title, amount, trend }: KPICardProps) {
  const { colors, typography } = useTheme();

  return (
    <View style={styles.gridItem}>
      <Card variant="elevated" style={styles.cardContainer}>
        <Text style={[styles.label, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
          {title}
        </Text>
        <Text
          style={[styles.value, { color: colors.textPrimary, fontSize: typography.heading.fontSize }]}
          accessible={true}
          accessibilityLabel={`${title} is ${amount}`}
        >
          {amount}
        </Text>
        {trend && trend.label !== '-' && (
          <View style={styles.trendContainer}>
            <Text
              style={[
                styles.trend,
                {
                  color: trend.direction === 'Positive' ? colors.success : colors.error,
                  fontSize: typography.caption.fontSize,
                },
              ]}
            >
              {trend.direction === 'Positive' ? '▲' : '▼'} {trend.label}
            </Text>
          </View>
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  gridItem: {
    width: '48%',
  },
  cardContainer: {
    padding: 14,
  },
  label: {
    fontWeight: '500',
    marginBottom: 6,
  },
  value: {
    fontWeight: '700',
    marginBottom: 4,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  trend: {
    fontWeight: '600',
  },
});
