import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { Button, Icon, SegmentedControl } from '../../../../shared/components';
import { NumericKeypad, NumericKeypadKey } from './NumericKeypad';
import { CategoryChipRow } from './CategoryChipRow';
import { TransactionFormMode, TransactionFormValues } from './TransactionFormModal';
import { validateTransactionFormFields } from '../validation/validateTransactionForm';

const TYPE_OPTIONS = [
  { id: 'expense', label: 'Expense' },
  { id: 'income', label: 'Income' },
  { id: 'transfer', label: 'Transfer' },
];

export interface QuickAddTransactionModalProps {
  visible: boolean;
  accounts: Array<{ id: string; name: string; isArchived?: boolean }>;
  categories: Array<{ id: string; name: string; kind?: 'EXPENSE' | 'INCOME' }>;
  budgetRemainingByCategoryId?: Record<string, number>;
  isLoading?: boolean;
  error?: string | null;
  onSubmit: (values: TransactionFormValues, mode: TransactionFormMode) => Promise<void>;
  onMoreDetails: (seed: { mode: TransactionFormMode; amount?: number; categoryId?: string | null }) => void;
  onClose: () => void;
}

/**
 * 3b - amount-first entry from the FAB. Of the six fields the full form
 * (3c / TransactionFormModal) collects, only amount and category change
 * every time; account and date show as their defaults here and become
 * editable behind "More details", which hands off to 3c seeded with
 * whatever was already entered so nothing typed is lost.
 */
export function QuickAddTransactionModal({
  visible,
  accounts,
  categories,
  budgetRemainingByCategoryId,
  isLoading = false,
  error = null,
  onSubmit,
  onMoreDetails,
  onClose,
}: QuickAddTransactionModalProps) {
  const { colors, typography, spacing } = useTheme();

  const [activeMode, setActiveMode] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [amountStr, setAmountStr] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const activeAccounts = accounts.filter((a) => !a.isArchived);
  const defaultAccount = activeAccounts[0];

  useEffect(() => {
    if (visible) {
      setActiveMode('expense');
      setAmountStr('');
      setCategoryId(null);
      setValidationError(null);
    }
  }, [visible]);

  const filteredCategories = categories.filter((c) => {
    if (activeMode === 'expense') return !c.kind || c.kind === 'EXPENSE';
    if (activeMode === 'income') return !c.kind || c.kind === 'INCOME';
    return false;
  });

  const selectedCategory = filteredCategories.find((c) => c.id === categoryId);
  const budgetRemaining = categoryId != null ? budgetRemainingByCategoryId?.[categoryId] : undefined;

  const handleTypeChange = (id: string) => {
    const nextMode = id as 'expense' | 'income' | 'transfer';
    if (nextMode === 'transfer') {
      // Transfers need a destination account and are "anything unusual" -
      // the full form is the route for them (§6.6), not a cramped keypad.
      onMoreDetails({ mode: 'transfer', amount: parseFloat(amountStr) || undefined });
      return;
    }
    setActiveMode(nextMode);
    setCategoryId(null);
  };

  const handleKeyPress = (key: NumericKeypadKey) => {
    setValidationError(null);
    if (key === 'backspace') {
      setAmountStr((prev) => prev.slice(0, -1));
      return;
    }
    if (key === '.' && amountStr.includes('.')) return;
    setAmountStr((prev) => prev + key);
  };

  const handleMoreDetailsPress = () => {
    onMoreDetails({
      mode: activeMode,
      amount: parseFloat(amountStr) || undefined,
      categoryId,
    });
  };

  const handleSave = async () => {
    if (!defaultAccount) {
      setValidationError('Add an account before recording a transaction.');
      return;
    }

    const description = selectedCategory?.name ?? (activeMode === 'expense' ? 'Expense' : 'Income');

    const errors = validateTransactionFormFields(
      { accountId: defaultAccount.id, amountStr, description },
      activeMode
    );
    if (Object.keys(errors).length > 0) {
      setValidationError(errors.amount || Object.values(errors)[0]);
      return;
    }

    await onSubmit(
      {
        accountId: defaultAccount.id,
        amount: parseFloat(amountStr),
        currencyCode: 'INR',
        description,
        categoryId,
        transactionDate: new Date(),
      },
      activeMode
    );
  };

  const saveLabel = activeMode === 'expense' ? 'Save expense' : 'Save income';

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.screen, { backgroundColor: colors.backgroundPrimary }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Icon name="X" size={22} color={colors.textSecondary} />
          </TouchableOpacity>

          <SegmentedControl
            options={TYPE_OPTIONS}
            selectedId={activeMode}
            onChange={handleTypeChange}
            style={styles.segmentedControl}
            accessibilityLabel="Transaction type"
          />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.amountBlock}>
            <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>AMOUNT</Text>
            <View
              style={styles.amountRow}
              accessible={true}
              accessibilityLiveRegion="polite"
              accessibilityLabel={`Amount ₹${amountStr || '0'}`}
            >
              <Text style={[styles.currencySymbol, { color: colors.textMuted }]}>₹</Text>
              <Text style={[styles.amountValue, { color: colors.textPrimary, fontSize: typography.displayXLarge.fontSize }]}>
                {amountStr || '0'}
              </Text>
              <View style={[styles.cursor, { backgroundColor: colors.brandPrimary }]} />
            </View>
            {(error || validationError) && (
              <Text style={[styles.fieldError, { color: colors.error }]}>{error || validationError}</Text>
            )}
          </View>

          {activeMode !== 'transfer' && filteredCategories.length > 0 && (
            <CategoryChipRow
              categories={filteredCategories}
              selectedCategoryId={categoryId}
              onSelect={setCategoryId}
            />
          )}

          {budgetRemaining !== undefined && selectedCategory ? (
            <Text style={[styles.consequenceText, { color: colors.textSecondary }]}>
              Counts against your {selectedCategory.name} budget — ₹
              {budgetRemaining.toLocaleString('en-IN', { maximumFractionDigits: 0 })} left this month.
            </Text>
          ) : null}

          <View style={[styles.defaultsRow, { borderColor: colors.borderSubtle }]}>
            <Text style={[styles.defaultsText, { color: colors.textSecondary }]} numberOfLines={1}>
              {defaultAccount?.name ?? 'No account'}
            </Text>
            <Text style={[styles.defaultsDivider, { color: colors.borderSubtle }]}>|</Text>
            <Text style={[styles.defaultsText, { color: colors.textSecondary }]}>Today</Text>
            <Text style={[styles.defaultsDivider, { color: colors.borderSubtle }]}>|</Text>
            <TouchableOpacity onPress={handleMoreDetailsPress} accessibilityRole="button" accessibilityLabel="More details">
              <Text style={[styles.moreDetailsText, { color: colors.brandPrimary }]}>More details</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <NumericKeypad onKeyPress={handleKeyPress} disabled={isLoading} />
          <Button
            variant="outline"
            title={isLoading ? 'Saving...' : saveLabel}
            onPress={handleSave}
            disabled={isLoading}
            style={styles.saveButton}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  closeBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentedControl: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    alignItems: 'center',
  },
  amountBlock: {
    alignItems: 'center',
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '400',
    marginRight: 4,
    marginBottom: 8,
  },
  amountValue: {
    fontWeight: '400',
  },
  cursor: {
    width: 2,
    height: 40,
    marginLeft: 4,
    marginBottom: 6,
  },
  fieldError: {
    fontSize: 12,
    marginTop: 8,
  },
  consequenceText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
  },
  defaultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 24,
  },
  defaultsText: {
    fontSize: 13,
  },
  defaultsDivider: {
    fontSize: 13,
  },
  moreDetailsText: {
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 12,
    gap: 16,
  },
  saveButton: {
    width: '100%',
  },
});
