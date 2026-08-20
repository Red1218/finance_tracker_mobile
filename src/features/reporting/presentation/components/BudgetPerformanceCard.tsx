import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../../../shared/components/Card';
import { useTheme } from '../../../../shared/theme';
import { BudgetPerformanceResponse } from '../../application';
import { BudgetChartMapper } from '../mappers/BudgetChartMapper';
import { BudgetBarChart } from './charts/BudgetBarChart';

interface Props {
  readonly data: BudgetPerformanceResponse;
}

export const BudgetPerformanceCard: React.FC<Props> = ({ data }) => {
  const theme = useTheme();
  const chartViewModel = BudgetChartMapper.mapToChartViewModel(data);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Safe':
        return theme.colors.success;
      case 'Near Limit':
        return theme.colors.warning;
      case 'Over Budget':
        return theme.colors.error;
      default:
        return theme.colors.textMuted;
    }
  };

  return (
    <Card variant="elevated" style={styles.card}>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Budget Performance</Text>

      <BudgetBarChart viewModel={chartViewModel} />

      {data.items.length === 0 ? (
        <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>No budgets for this period.</Text>
      ) : (
        data.items.map((item) => {
          const statusColor = getStatusColor(item.status);
          const barColor =
            item.status === 'Over Budget'
              ? theme.colors.error
              : item.status === 'Near Limit'
              ? theme.colors.warning
              : theme.colors.brandPrimary;

          return (
            <View key={item.budgetId} style={styles.budgetItem}>
              <View style={styles.headerRow}>
                <Text style={[styles.categoryName, { color: theme.colors.textPrimary }]}>
                  {item.categoryName ?? 'Overall'}
                </Text>
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {item.status}
                </Text>
              </View>
              <View style={[styles.track, { backgroundColor: theme.colors.surfacePrimary }]}>
                <View
                  style={[
                    styles.fill,
                    {
                      backgroundColor: barColor,
                      width: `${Math.min(item.utilization, 100)}%`,
                    },
                  ]}
                />
              </View>
              <View style={styles.footerRow}>
                <Text style={[styles.metaText, { color: theme.colors.textMuted }]}>
                  Spent ₹{item.actualSpent.toLocaleString('en-IN')}
                </Text>
                <Text style={[styles.metaText, { color: theme.colors.textMuted }]}>
                  Budget ₹{item.budgetAmount.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
          );
        })
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    marginTop: 8,
  },
  budgetItem: {
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: 8,
    borderRadius: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  metaText: {
    fontSize: 11,
  },
});
