import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { MonthlyTrendResponse } from '../../application';
import { MonthlyTrendChartMapper } from '../mappers/MonthlyTrendChartMapper';
import { MonthlyTrendBarChart } from './charts/MonthlyTrendBarChart';

interface Props {
  readonly data: MonthlyTrendResponse;
}

export const MonthlyTrendCard: React.FC<Props> = ({ data }) => {
  const theme = useTheme();
  const chartViewModel = MonthlyTrendChartMapper.mapToBarChartViewModel(data);
  const monthCount = data.items.length;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
        {monthCount > 0 ? `${monthCount}-Month Trend` : 'Trend'}
      </Text>

      {data.items.length === 0 ? (
        <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>No trend data for this period.</Text>
      ) : (
        <MonthlyTrendBarChart viewModel={chartViewModel} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    marginTop: 8,
  },
});
