import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { AppBar, FAB, Icon } from '../../../../shared/components';

import { TransactionRow, TransactionSearch, TransactionDateGroup, TransactionFormModal, TransactionDetailSheet, TransactionFormValues, TransactionFormMode } from '../components';
import { TransactionViewModel } from '../models/TransactionViewModel';

export type TransactionFilterType = 'ALL' | 'INCOME' | 'EXPENSE' | 'TRANSFER';

export interface TransactionDateGroupData {
  dateLabel: string;
  data: TransactionViewModel[];
  totalLabel: string;
}

// Exported pure functions, not inlined useMemo closures, so this screen's
// actual filtering/grouping/total logic can be unit-tested directly without
// a component renderer (this project has no working one - see
// TransactionsScreen.test.ts for why).

export function filterTransactions(
  transactions: TransactionViewModel[],
  searchQuery: string,
  filterType: TransactionFilterType
): TransactionViewModel[] {
  return transactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.typeLabel.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterType === 'ALL' ||
      (filterType === 'INCOME' && tx.type === 'INCOME') ||
      (filterType === 'EXPENSE' && tx.type === 'EXPENSE') ||
      (filterType === 'TRANSFER' && (tx.type === 'TRANSFER_OUT' || tx.type === 'TRANSFER_IN'));

    return matchesSearch && matchesFilter;
  });
}

// Sums a date group's non-voided transactions using the same signed
// convention TransactionViewModel.formattedAmount already uses (outflow
// for EXPENSE/TRANSFER_OUT, inflow otherwise), so the running total agrees
// with what each row displays. A voided transaction never happened, so it
// never contributes to the total.
export function formatGroupTotal(transactions: TransactionViewModel[]): string {
  const total = transactions.reduce((sum, tx) => {
    if (tx.isVoided) return sum;
    const isOutflow = tx.type === 'EXPENSE' || tx.type === 'TRANSFER_OUT';
    return sum + (isOutflow ? -tx.amount : tx.amount);
  }, 0);

  const prefix = total < 0 ? '-' : '+';
  // No transaction to read a currency from (an empty group) falls back to
  // INR, matching every other currency default in this feature.
  const currencySymbol = !transactions[0] || transactions[0].currencyCode === 'INR' ? '₹' : '';
  return `${prefix}${currencySymbol}${Math.abs(total).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function groupTransactionsByDate(transactions: TransactionViewModel[]): TransactionDateGroupData[] {
  const groups: { [dateKey: string]: TransactionViewModel[] } = {};
  transactions.forEach((tx) => {
    const dateKey = tx.formattedDate || 'Recent';
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(tx);
  });

  return Object.keys(groups).map((dateKey) => ({
    dateLabel: dateKey,
    data: groups[dateKey],
    totalLabel: formatGroupTotal(groups[dateKey]),
  }));
}

export interface TransactionsScreenProps {
  transactions?: TransactionViewModel[];
  accounts?: Array<{ id: string; name: string; isArchived?: boolean }>;
  categories?: Array<{ id: string; name: string; kind?: 'EXPENSE' | 'INCOME' }>;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onSelectTransaction?: (transaction: TransactionViewModel) => void;
  onAddTransaction?: () => void;
  onFormSubmit?: (values: TransactionFormValues, mode: TransactionFormMode, transactionId?: string) => Promise<void>;
  onVoidTransaction?: (transactionId: string) => Promise<void>;
  autoOpenForm?: boolean;
}

export function TransactionsScreen({
  transactions = [],
  accounts = [],
  categories = [],
  isLoading = false,
  error = null,
  onRefresh,
  onSelectTransaction,
  onAddTransaction,
  onFormSubmit,
  onVoidTransaction,
  autoOpenForm = false,
}: TransactionsScreenProps) {
  const { colors, typography, radius, spacing } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE' | 'TRANSFER'>('ALL');

  // Internal Modal & Sheet States
  const [isFormVisible, setIsFormVisible] = useState(autoOpenForm);
  const [formMode, setFormMode] = useState<TransactionFormMode>('expense');
  const [editingTransaction, setEditingTransaction] = useState<TransactionViewModel | null>(null);


  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionViewModel | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const filteredTransactions = useMemo(
    () => filterTransactions(transactions, searchQuery, filterType),
    [transactions, searchQuery, filterType]
  );

  const groupedTransactions = useMemo(
    () => groupTransactionsByDate(filteredTransactions),
    [filteredTransactions]
  );

  const handleRowPress = (tx: TransactionViewModel) => {
    if (onSelectTransaction) {
      onSelectTransaction(tx);
    } else {
      setSelectedTransaction(tx);
      setIsDetailVisible(true);
    }
  };

  const handleFabPress = () => {
    if (onAddTransaction) {
      onAddTransaction();
    } else {
      setFormMode('expense');
      setEditingTransaction(null);
      setModalError(null);
      setIsFormVisible(true);
    }
  };

  const handleEditPress = (tx: TransactionViewModel) => {
    setIsDetailVisible(false);
    setFormMode('edit');
    setEditingTransaction(tx);
    setModalError(null);
    setIsFormVisible(true);
  };

  const handleModalSubmit = async (values: TransactionFormValues, submittedMode?: TransactionFormMode) => {
    if (!onFormSubmit) {
      if (__DEV__) {
        console.warn('[TransactionsScreen] onFormSubmit handler was not provided.');
      }
      setModalError('Transaction submission handler is missing. Unable to save transaction.');
      return;
    }

    try {
      setIsSubmitting(true);
      setModalError(null);
      await onFormSubmit(values, submittedMode || formMode, editingTransaction?.id);
      setIsFormVisible(false);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setModalError(err?.message || 'Failed to save transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoidTransaction = async (txId: string) => {
    if (!onVoidTransaction) {
      if (__DEV__) {
        console.warn('[TransactionsScreen] onVoidTransaction handler was not provided.');
      }
      setModalError('Transaction void handler is missing. Unable to void transaction.');
      return;
    }

    try {
      setIsSubmitting(true);
      setModalError(null);
      await onVoidTransaction(txId);
      setIsDetailVisible(false);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setModalError(err?.message || 'Failed to void transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

      <View style={[styles.searchFilterContainer, { paddingHorizontal: spacing.space20 }]}>
        <TransactionSearch value={searchQuery} onChangeText={setSearchQuery} />

        <View style={styles.filterPillsRow}>
          {(['ALL', 'EXPENSE', 'INCOME', 'TRANSFER'] as const).map((type) => {
            const isActive = filterType === type;
            const label =
              type === 'ALL'
                ? 'All'
                : type === 'EXPENSE'
                ? 'Expenses'
                : type === 'INCOME'
                ? 'Income'
                : 'Transfers';

            return (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterPill,
                  {
                    borderRadius: radius.pill,
                    borderColor: isActive ? colors.brandPrimary : colors.borderSubtle,
                  },
                ]}
                onPress={() => setFilterType(type)}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={`Filter by ${label}`}
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
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {error && (
        <View
          style={[
            styles.errorContainer,
            {
              marginHorizontal: spacing.space20,
              borderRadius: radius.medium,
              backgroundColor: colors.surfaceSecondary,
              borderColor: colors.error,
              borderWidth: 1,
            },
          ]}
        >
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
          keyExtractor={(item) => `group-${item.dateLabel}`}
          contentContainerStyle={[styles.listContent, { paddingHorizontal: spacing.space20 }]}
          onRefresh={onRefresh}
          refreshing={isLoading}
          renderItem={({ item }) => (
            <View style={styles.groupSection}>
              <TransactionDateGroup dateLabel={item.dateLabel} totalLabel={item.totalLabel} />
              {item.data.map((tx) => (
                <View key={tx.id} style={styles.rowSpacing}>
                  <TransactionRow transaction={tx} onPress={handleRowPress} />
                </View>
              ))}
            </View>
          )}
        />
      )}

      <FAB iconName="Plus" onPress={handleFabPress} accessibilityLabel="Add transaction" />

      <TransactionFormModal
        visible={isFormVisible}
        mode={formMode}
        initialValues={
          editingTransaction
            ? {
                accountId: editingTransaction.accountId,
                amount: editingTransaction.amount,
                currencyCode: editingTransaction.currencyCode,
                description: editingTransaction.description,
                categoryId: editingTransaction.categoryId,
              }
            : undefined
        }
        accounts={accounts}
        categories={categories}
        isLoading={isSubmitting}
        error={modalError}
        onSubmit={handleModalSubmit}
        onClose={() => setIsFormVisible(false)}
      />

      <TransactionDetailSheet
        visible={isDetailVisible}
        transaction={selectedTransaction}
        isLoading={isSubmitting}
        error={modalError}
        onEdit={handleEditPress}
        onVoid={handleVoidTransaction}
        onClose={() => setIsDetailVisible(false)}
      />
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
    paddingVertical: 8,
    borderWidth: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillText: {
    fontWeight: '600',
  },
  errorContainer: {
    marginBottom: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
  },
  retryBtn: {
    marginLeft: 8,
    minHeight: 44,
    justifyContent: 'center',
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
    paddingBottom: 80,
  },
  groupSection: {
    marginBottom: 16,
  },
  rowSpacing: {
    marginBottom: 8,
  },
});
