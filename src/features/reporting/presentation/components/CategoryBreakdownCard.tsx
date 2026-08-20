import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../../../shared/components/Card';
import { useTheme } from '../../../../shared/theme';
import { CategoryBreakdownResponse } from '../../application';
import { CategoryChartMapper } from '../mappers/CategoryChartMapper';
import { CategoryDonutChart } from './charts/CategoryDonutChart';
import { chartTheme } from '../theme/reportingChartTheme';

interface Props {
  readonly data: CategoryBreakdownResponse;
}

export const CategoryBreakdownCard: React.FC<Props> = ({ data }) => {
  const theme = useTheme();
  const chartViewModel = CategoryChartMapper.mapToChartViewModel(data);

  return (
    <Card variant="elevated" style={styles.card}>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Spending by Category</Text>

      <CategoryDonutChart viewModel={chartViewModel} />

      {data.items.length === 0 ? (
        <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>No category data for this period.</Text>
      ) : (
        data.items.map((item, index) => (
          <View key={item.categoryId} style={styles.row}>
            <View style={styles.leftCol}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      chartTheme.categoryPalette[index % chartTheme.categoryPalette.length],
                  },
                ]}
              />
              <Text style={[styles.categoryName, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                {item.categoryName}
              </Text>
            </View>
            <Text style={[styles.amountText, { color: theme.colors.textPrimary }]}>
              ₹{item.amount.toLocaleString('en-IN')}
            </Text>
            <Text style={[styles.percentText, { color: theme.colors.textMuted }]}>
              {item.percentage.toFixed(1)}%
            </Text>
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
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 13,
    flex: 1,
  },
  amountText: {
    fontSize: 13,
    fontWeight: '600',
    marginRight: 8,
  },
  percentText: {
    fontSize: 12,
    width: 48,
    textAlign: 'right',
  },
});
