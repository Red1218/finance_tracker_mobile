import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../../../shared/components/Card';
import { useTheme } from '../../../../shared/theme';
import { MonthlyTrendResponse } from '../../application';
import { MonthlyTrendChartMapper } from '../mappers/MonthlyTrendChartMapper';
import { TrendLineChart } from './charts/TrendLineChart';

interface Props {
  readonly data: MonthlyTrendResponse;
}

export const MonthlyTrendCard: React.FC<Props> = ({ data }) => {
  const theme = useTheme();
  const comparison = data.comparison;
  const chartViewModel = MonthlyTrendChartMapper.mapToChartViewModel(data);

  return (
    <Card variant="elevated" style={styles.card}>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Trend & Comparison</Text>

      {comparison && (
        <View style={[styles.comparisonBox, { backgroundColor: theme.colors.surfacePrimary, borderColor: theme.colors.borderSubtle }]}>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textMuted }]}>Period Comparison</Text>
          <View style={styles.comparisonRow}>
            <View>
              <Text style={[styles.label, { color: theme.colors.textMuted }]}>Current Spend</Text>
              <Text style={[styles.value, { color: theme.colors.textPrimary }]}>
                ₹{comparison.currentTotal.toLocaleString('en-IN')}
              </Text>
            </View>
            <View>
              <Text style={[styles.label, { color: theme.colors.textMuted, textAlign: 'right' }]}>Previous Spend</Text>
              <Text style={[styles.value, { color: theme.colors.textSecondary, textAlign: 'right' }]}>
                ₹{comparison.previousPeriodTotal.toLocaleString('en-IN')}
              </Text>
            </View>
            <View>
              <Text style={[styles.label, { color: theme.colors.textMuted, textAlign: 'right' }]}>Change</Text>
              <Text
                style={[
                  styles.value,
                  {
                    textAlign: 'right',
                    color:
                      comparison.absoluteChange > 0
                        ? theme.colors.error
                        : comparison.absoluteChange < 0
                        ? theme.colors.success
                        : theme.colors.textSecondary,
                  },
                ]}
              >
                {comparison.absoluteChange > 0 ? '+' : ''}₹
                {comparison.absoluteChange.toLocaleString('en-IN')} (
                {comparison.percentageChange >= 0 ? '+' : ''}
                {comparison.percentageChange.toFixed(1)}%)
              </Text>
            </View>
          </View>
        </View>
      )}

      <TrendLineChart viewModel={chartViewModel} />

      {data.items.length === 0 ? (
        <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>No trend data for this period.</Text>
      ) : (
        data.items.map((point) => (
          <View key={point.period} style={[styles.itemRow, { borderBottomColor: theme.colors.borderSubtle }]}>
            <Text style={[styles.periodText, { color: theme.colors.textMuted }]}>{point.period}</Text>
            <View style={styles.metricsRow}>
              <Text style={[styles.metricText, { color: theme.colors.success }]}>↑ ₹{point.income.toLocaleString('en-IN')}</Text>
              <Text style={[styles.metricText, { color: theme.colors.error }]}>↓ ₹{point.expenses.toLocaleString('en-IN')}</Text>
              <Text
                style={[
                  styles.metricText,
                  {
                    fontWeight: '600',
                    color: point.netCashFlow >= 0 ? theme.colors.brandPrimary : theme.colors.error,
                  },
                ]}
              >
                Net ₹{point.netCashFlow.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        ))
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
    marginBottom: 12,
  },
  comparisonBox: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    marginBottom: 2,
  },
  value: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 13,
    marginTop: 8,
  },
  itemRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  periodText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricText: {
    fontSize: 12,
  },
});
