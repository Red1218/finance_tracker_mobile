import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../../../shared/components/Card';
import { useTheme } from '../../../../shared/theme';
import { DashboardSummaryResponse } from '../../application';

interface Props {
  readonly data: DashboardSummaryResponse;
}

export const DashboardSummaryCard: React.FC<Props> = ({ data }) => {
  const theme = useTheme();

  return (
    <Card variant="elevated" style={styles.card}>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Overview</Text>
      <View style={styles.grid}>
        <MetricTile label="Income" value={`₹${data.totalIncome.toLocaleString('en-IN')}`} color={theme.colors.success} />
        <MetricTile label="Expenses" value={`₹${data.totalExpenses.toLocaleString('en-IN')}`} color={theme.colors.error} />
        <MetricTile label="Net Cash Flow" value={`₹${data.netCashFlow.toLocaleString('en-IN')}`} color={data.netCashFlow >= 0 ? theme.colors.brandPrimary : theme.colors.error} />
        <MetricTile label="Savings Rate" value={`${data.savingsRate.toFixed(1)}%`} color={theme.colors.brandSecondary} />
        <MetricTile label="Transactions" value={String(data.transactionCount)} color={theme.colors.textSecondary} />
      </View>
    </Card>
  );
};

const MetricTile: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => {
  const theme = useTheme();

  return (
    <View style={[styles.tile, { backgroundColor: theme.colors.surfacePrimary }]}>
      <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
    </View>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tile: {
    flex: 1,
    minWidth: '40%',
    padding: 12,
    borderRadius: 12,
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
  },
});
