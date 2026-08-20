import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../../../shared/components/Card';
import { useTheme } from '../../../../shared/theme';
import { LargestTransactionsResponse } from '../../application';

interface Props {
  readonly data: LargestTransactionsResponse;
}

export const LargestTransactionsCard: React.FC<Props> = ({ data }) => {
  const theme = useTheme();

  return (
    <Card variant="elevated" style={styles.card}>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Largest Transactions</Text>
      {data.items.length === 0 ? (
        <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>No transactions for this period.</Text>
      ) : (
        data.items.map((item) => (
          <View key={item.expenseId} style={styles.itemRow}>
            <View style={styles.itemMeta}>
              <Text style={[styles.merchantText, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                {item.merchant}
              </Text>
              <Text style={[styles.dateCategoryText, { color: theme.colors.textMuted }]}>
                {item.categoryName} · {item.transactionDate}
              </Text>
            </View>
            <Text style={[styles.amountText, { color: theme.colors.textPrimary }]}>
              ₹{item.amount.toLocaleString('en-IN')}
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
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 13,
    marginTop: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemMeta: {
    flex: 1,
    marginRight: 8,
  },
  merchantText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dateCategoryText: {
    fontSize: 11,
    marginTop: 2,
  },
  amountText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
