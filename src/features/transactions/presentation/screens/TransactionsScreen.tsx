import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTheme } from '@/src/shared/theme';
import { AppBar, FAB, Icon } from '@/src/shared/components';
import { TransactionRow, TransactionSearch, TransactionDateGroup, TransactionFormModal, TransactionDetailSheet, TransactionFormValues, TransactionFormMode } from '../components';
import { TransactionViewModel } from '../models/TransactionViewModel';

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
}

export function TransactionsScreen({
  transactions = [],
  accounts = [{ id: 'acc-default', name: 'Default Account' }],
  categories = [
    { id: 'cat-food', name: 'Food & Dining', kind: 'EXPENSE' },
    { id: 'cat-salary', name: 'Salary', kind: 'INCOME' },
  ],
  isLoading = false,
  error = null,
  onRefresh,
  onSelectTransaction,
  onAddTransaction,
  onFormSubmit,
  onVoidTransaction,
}: TransactionsScreenProps) {
  const { colors, typography } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  // Internal Modal & Sheet States
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formMode, setFormMode] = useState<TransactionFormMode>('expense');
  const [editingTransaction, setEditingTransaction] = useState<TransactionViewModel | null>(null);

  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionViewModel | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

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

  const handleModalSubmit = async (values: TransactionFormValues) => {
    if (!onFormSubmit) {
      setIsFormVisible(false);
      return;
    }

    try {
      setIsSubmitting(true);
      setModalError(null);
      await onFormSubmit(values, formMode, editingTransaction?.id);
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
      setIsDetailVisible(false);
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
