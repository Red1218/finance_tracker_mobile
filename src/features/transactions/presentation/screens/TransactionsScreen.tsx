import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTheme } from '@/src/shared/theme';
import { AppBar, FAB, Icon, StatusIndicator } from '@/src/shared/components';
import { TransactionRow, TransactionSearch, TransactionDateGroup } from '../components';
import { TransactionViewModel } from '../models/TransactionViewModel';

export interface TransactionsScreenProps {
  transactions?: TransactionViewModel[];
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onSelectTransaction?: (transaction: TransactionViewModel) => void;
  onAddTransaction?: () => void;
}

export function TransactionsScreen({
  transactions = [],
  isLoading = false,
  error = null,
  onRefresh,
  onSelectTransaction,
  onAddTransaction,
}: TransactionsScreenProps) {
  const { colors, typography, spacing } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.typeLabel.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =

        filterType === 'ALL' ||
        (filterType === 'INCOME' && (tx.type === 'INCOME' || tx.type === 'TRANSFER_IN')) ||
        (filterType === 'EXPENSE' && (tx.type === 'EXPENSE' || tx.type === 'TRANSFER_OUT'));

      return matchesSearch && matchesFilter;
    });
  }, [transactions, searchQuery, filterType]);

  const groupedTransactions = useMemo(() => {
    const groups: { [dateKey: string]: TransactionViewModel[] } = {};
    filteredTransactions.forEach((tx) => {
      const dateKey = tx.formattedDate || 'Recent';
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(tx);
    });

    return Object.keys(groups).map((dateKey) => ({
      dateLabel: dateKey,
      data: groups[dateKey],
    }));
  }, [filteredTransactions]);

  if (isLoading && transactions.length === 0) {
    return (
      <View style={[styles.centeredContainer, { backgroundColor: colors.backgroundPrimary }]}>
        <ActivityIndicator size="large" color={colors.brandPrimary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <AppBar title="Transactions" />

      <View style={styles.searchFilterContainer}>
        <TransactionSearch value={searchQuery} onChangeText={setSearchQuery} />

        <View style={styles.filterPillsRow}>
          {(['ALL', 'INCOME', 'EXPENSE'] as const).map((type) => {
            const isActive = filterType === type;
            return (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isActive ? colors.surfaceElevated : colors.surfaceSecondary,
                    borderColor: isActive ? colors.brandPrimary : colors.borderSubtle,
                  },
                ]}
                onPress={() => setFilterType(type)}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={`Filter by ${type}`}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    {
                      color: isActive ? colors.brandPrimary : colors.textSecondary,
                      fontSize: typography.caption.fontSize,
                    },
                  ]}
                >
                  {type === 'ALL' ? 'All' : type === 'INCOME' ? 'Income' : 'Expenses'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {error && (
        <View style={[styles.errorContainer, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
          <Text style={[styles.errorText, { color: colors.error, fontSize: typography.caption.fontSize }]}>{error}</Text>
          {onRefresh && (
            <TouchableOpacity onPress={onRefresh} style={styles.retryBtn}>
              <Text style={{ color: colors.brandPrimary, fontWeight: '600' }}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {groupedTransactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="Receipt" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary, fontSize: typography.title.fontSize }]}>
            No transactions found
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary, fontSize: typography.body.fontSize }]}>
            {searchQuery ? 'Try adjusting your search query or filter.' : 'Your transactions will appear here.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={groupedTransactions}
          keyExtractor={(item) => item.dateLabel}
          contentContainerStyle={styles.listContent}
          onRefresh={onRefresh}
          refreshing={isLoading}
          renderItem={({ item }) => (
            <View style={styles.groupSection}>
              <TransactionDateGroup dateLabel={item.dateLabel} />
              {item.data.map((tx) => (
                <View key={tx.id} style={styles.rowSpacing}>
                  <TransactionRow transaction={tx} onPress={onSelectTransaction} />
                </View>
              ))}
            </View>
          )}
        />
      )}

      {onAddTransaction && <FAB iconName="Plus" onPress={onAddTransaction} accessibilityLabel="Add transaction" />}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchFilterContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillText: {
    fontWeight: '600',
  },
  errorContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
  },
  retryBtn: {
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 6,
  },
  emptySubtitle: {
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  groupSection: {
    marginBottom: 16,
  },
  rowSpacing: {
    marginBottom: 8,
  },
});
