import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../../../shared/theme';
import { Button, Icon, SegmentedControl } from '../../../../shared/components';
import { validateTransactionFormFields } from '../validation/validateTransactionForm';

export type TransactionFormMode = 'expense' | 'income' | 'transfer' | 'edit';

export interface TransactionFormValues {
  accountId: string;
  destAccountId?: string;
  amount: number;
  currencyCode: string;
  description: string;
  categoryId?: string | null;
  transactionDate?: Date;
}

const TYPE_OPTIONS = [
  { id: 'expense', label: 'Expense' },
  { id: 'income', label: 'Income' },
  { id: 'transfer', label: 'Transfer' },
];

export interface TransactionFormModalProps {
  visible: boolean;
  mode: TransactionFormMode;
  initialValues?: Partial<TransactionFormValues>;
  accounts: Array<{ id: string; name: string; isArchived?: boolean }>;
  categories: Array<{ id: string; name: string; kind?: 'EXPENSE' | 'INCOME' }>;
  // categoryId -> remaining amount on that category's active budget - the
  // same composition-layer prop TransactionDetailSheet's "Counts against"
  // row already uses (§9 of the visual-refresh spec). Drives the "counts
  // against your X budget" consequence line (fixes #12).
  budgetRemainingByCategoryId?: Record<string, number>;
  isLoading?: boolean;
  error?: string | null;
  onSubmit: (values: TransactionFormValues, mode: TransactionFormMode) => Promise<void>;
  onClose: () => void;
}

export function TransactionFormModal({
  visible,
  mode,
  initialValues,
  accounts = [],
  categories = [],
  budgetRemainingByCategoryId,
  isLoading = false,
  error = null,
  onSubmit,
  onClose,
}: TransactionFormModalProps) {
  const { colors, typography, spacing } = useTheme();

  const [activeMode, setActiveMode] = useState<'expense' | 'income' | 'transfer'>(
    mode === 'edit' ? 'expense' : mode
  );

  const [accountId, setAccountId] = useState<string>('');
  const [destAccountId, setDestAccountId] = useState<string>('');
  const [amountStr, setAmountStr] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [transactionDate, setTransactionDate] = useState<Date>(new Date());

  const [accountPickerOpen, setAccountPickerOpen] = useState(false);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [isDirty, setIsDirty] = useState<boolean>(false);

  useEffect(() => {
    if (visible) {
      const effectiveMode = mode === 'edit' ? 'expense' : mode;
      setActiveMode(effectiveMode);

      setAccountId(initialValues?.accountId || (accounts.find((a) => !a.isArchived)?.id ?? ''));
      setDestAccountId(initialValues?.destAccountId || (accounts.find((a) => a.id !== (initialValues?.accountId || accounts[0]?.id) && !a.isArchived)?.id ?? ''));
      setAmountStr(initialValues?.amount ? String(initialValues.amount) : '');
      setDescription(initialValues?.description || '');
      setCategoryId(initialValues?.categoryId ?? null);
      setTransactionDate(initialValues?.transactionDate || new Date());

      setAccountPickerOpen(false);
      setCategoryPickerOpen(false);
      setDatePickerOpen(false);
      setValidationErrors({});
      setIsDirty(false);
    }
  }, [visible, mode, initialValues, accounts]);

  const activeAccounts = accounts.filter((a) => !a.isArchived);
  const selectedAccount = activeAccounts.find((a) => a.id === accountId);

  const filteredCategories = categories.filter((c) => {
    if (activeMode === 'expense') return !c.kind || c.kind === 'EXPENSE';
    if (activeMode === 'income') return !c.kind || c.kind === 'INCOME';
    return false;
  });
  const selectedCategory = filteredCategories.find((c) => c.id === categoryId);

  const budgetRemaining = categoryId != null ? budgetRemainingByCategoryId?.[categoryId] : undefined;
  const showConsequenceLine = activeMode !== 'transfer' && selectedCategory && budgetRemaining !== undefined;

  const formattedDate = transactionDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

  const handleModeChange = (newMode: string) => {
    setActiveMode(newMode as 'expense' | 'income' | 'transfer');
    setValidationErrors({});
    setIsDirty(true);
  };

  const validateForm = (): boolean => {
    const errors = validateTransactionFormFields({ accountId, destAccountId, amountStr, description }, activeMode);
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || isLoading) return;

    const values: TransactionFormValues = {
      accountId,
      destAccountId: activeMode === 'transfer' ? destAccountId : undefined,
      amount: parseFloat(amountStr),
      currencyCode: 'INR',
      description: description.trim(),
      categoryId: activeMode === 'transfer' ? null : categoryId,
      transactionDate,
    };

    await onSubmit(values, activeMode);
  };

  const handleClose = () => {
    if (isDirty && !isLoading) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: onClose },
        ]
      );
    } else {
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={[styles.backdrop, { backgroundColor: colors.overlay }]}
          activeOpacity={1}
          onPress={handleClose}
        />

        <View style={[styles.modalContent, { backgroundColor: colors.surfacePrimary, borderColor: colors.border }]}>
          <View style={[styles.handleBar, { backgroundColor: colors.borderSubtle }]} />

          <View style={styles.headerRow}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary, fontSize: typography.title.fontSize }]}>
              {mode === 'edit' ? 'Edit Transaction' : 'New transaction'}
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close Modal"
            >
              <Icon name="X" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <SegmentedControl
            options={TYPE_OPTIONS}
            selectedId={activeMode}
            onChange={handleModeChange}
            disabled={mode === 'edit'}
            style={styles.segmentedControl}
            accessibilityLabel="Transaction type"
          />

          {error && (
            <View
              style={[
                styles.errorBanner,
                { backgroundColor: colors.surfaceSecondary, borderColor: colors.error },
              ]}
              accessibilityLiveRegion="polite"
            >
              <Icon name="AlertTriangle" size={18} color={colors.error} />
              <Text style={[styles.errorBannerText, { color: colors.error }]}>{error}</Text>
            </View>
          )}

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>AMOUNT</Text>
              <View style={[styles.amountInputRow, { borderBottomColor: colors.brandPrimary }]}>
                <Text style={[styles.currencyPrefix, { color: colors.textMuted }]}>₹</Text>
                <TextInput
                  style={[
                    styles.amountInput,
                    {
                      color: colors.textPrimary,
                      fontSize: typography.numericLarge.fontSize,
                    },
                  ]}
                  value={amountStr}
                  onChangeText={(val) => {
                    setAmountStr(val);
                    setIsDirty(true);
                  }}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={colors.textMuted}
                  editable={!isLoading}
                  accessibilityLabel="Amount in Rupees"
                />
                <Text style={[styles.currencyCode, { color: colors.textMuted }]}>INR</Text>
              </View>
              {validationErrors.amount && (
                <Text style={[styles.fieldError, { color: colors.error }]}>
                  {validationErrors.amount}
                </Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>DESCRIPTION</Text>
              <TextInput
                style={[
                  styles.field,
                  {
                    backgroundColor: 'transparent',
                    color: colors.textPrimary,
                    borderColor: validationErrors.description ? colors.error : colors.borderSubtle,
                  },
                ]}
                value={description}
                onChangeText={(val) => {
                  setDescription(val);
                  setIsDirty(true);
                }}
                placeholder="Enter description"
                placeholderTextColor={colors.textMuted}
                editable={!isLoading}
                accessibilityLabel="Description input"
              />
              {validationErrors.description && (
                <Text style={[styles.fieldError, { color: colors.error }]}>
                  {validationErrors.description}
                </Text>
              )}
            </View>

            {/* Category and date are both single-choice pickers - paired on one row. */}
            <View style={styles.pairRow}>
              {activeMode !== 'transfer' && (
                <View style={styles.pairColumn}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>CATEGORY</Text>
                  <TouchableOpacity
                    style={[styles.field, { borderColor: colors.borderSubtle }]}
                    onPress={() => setCategoryPickerOpen((v) => !v)}
                    accessibilityRole="button"
                    accessibilityLabel="Choose category"
                    accessibilityState={{ expanded: categoryPickerOpen }}
                  >
                    <Text style={[styles.fieldValue, { color: selectedCategory ? colors.textPrimary : colors.textMuted }]} numberOfLines={1}>
                      {selectedCategory?.name || 'Select'}
                    </Text>
                    <Icon name="ChevronDown" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.pairColumn}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>DATE</Text>
                <TouchableOpacity
                  style={[styles.field, { borderColor: colors.borderSubtle }]}
                  onPress={() => setDatePickerOpen((v) => !v)}
                  accessibilityRole="button"
                  accessibilityLabel="Choose date"
                  accessibilityState={{ expanded: datePickerOpen }}
                >
                  <Text style={[styles.fieldValue, { color: colors.textPrimary }]}>{formattedDate}</Text>
                  <Icon name="ChevronDown" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            {categoryPickerOpen && filteredCategories.length > 0 && (
              <View style={styles.pickerContainer}>
                {filteredCategories.map((cat) => {
                  const isSelected = categoryId === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.pickerChip,
                        {
                          backgroundColor: isSelected ? colors.surfaceElevated : colors.surfaceSecondary,
                          borderColor: isSelected ? colors.brandPrimary : colors.borderSubtle,
                        },
                      ]}
                      onPress={() => {
                        setCategoryId(cat.id);
                        setCategoryPickerOpen(false);
                        setIsDirty(true);
                      }}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: isSelected }}
                      accessibilityLabel={cat.name}
                    >
                      <Text style={{ color: isSelected ? colors.brandPrimary : colors.textPrimary }}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {datePickerOpen && (
              <DateTimePicker
                value={transactionDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_event, date) => {
                  if (Platform.OS === 'android') setDatePickerOpen(false);
                  if (date) {
                    setTransactionDate(date);
                    setIsDirty(true);
                  }
                }}
              />
            )}

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                {activeMode === 'transfer' ? 'FROM ACCOUNT' : 'ACCOUNT'}
              </Text>
              <TouchableOpacity
                style={[styles.field, { borderColor: colors.borderSubtle }]}
                onPress={() => setAccountPickerOpen((v) => !v)}
                accessibilityRole="button"
                accessibilityLabel="Choose account"
                accessibilityState={{ expanded: accountPickerOpen }}
              >
                <Text style={[styles.fieldValue, { color: selectedAccount ? colors.textPrimary : colors.textMuted }]} numberOfLines={1}>
                  {selectedAccount?.name || 'Select'}
                </Text>
                <Icon name="ChevronDown" size={16} color={colors.textMuted} />
              </TouchableOpacity>
              {validationErrors.accountId && (
                <Text style={[styles.fieldError, { color: colors.error }]}>
                  {validationErrors.accountId}
                </Text>
              )}
            </View>

            {accountPickerOpen && (
              <View style={styles.pickerContainer}>
                {activeAccounts.map((acc) => {
                  const isSelected = accountId === acc.id;
                  return (
                    <TouchableOpacity
                      key={acc.id}
                      style={[
                        styles.pickerChip,
                        {
                          backgroundColor: isSelected ? colors.surfaceElevated : colors.surfaceSecondary,
                          borderColor: isSelected ? colors.brandPrimary : colors.borderSubtle,
                        },
                      ]}
                      onPress={() => {
                        if (mode === 'edit' && initialValues?.destAccountId) return;
                        setAccountId(acc.id);
                        setAccountPickerOpen(false);
                        setIsDirty(true);
                      }}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: isSelected }}
                      accessibilityLabel={`Account ${acc.name}`}
                    >
                      <Text style={{ color: isSelected ? colors.brandPrimary : colors.textPrimary }}>
                        {acc.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {activeMode === 'transfer' && (
              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>TO ACCOUNT</Text>
                <View style={styles.pickerContainer}>
                  {activeAccounts.map((acc) => {
                    const isSelected = destAccountId === acc.id;
                    const isSource = accountId === acc.id;
                    return (
                      <TouchableOpacity
                        key={acc.id}
                        style={[
                          styles.pickerChip,
                          {
                            backgroundColor: isSelected
                              ? colors.surfaceElevated
                              : colors.surfaceSecondary,
                            borderColor: isSelected ? colors.brandPrimary : colors.borderSubtle,
                            opacity: isSource ? 0.4 : 1,
                          },
                        ]}
                        disabled={isSource || isLoading}
                        onPress={() => {
                          setDestAccountId(acc.id);
                          setIsDirty(true);
                        }}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: isSelected, disabled: isSource }}
                        accessibilityLabel={`Destination Account ${acc.name}`}
                      >
                        <Text style={{ color: isSelected ? colors.brandPrimary : colors.textPrimary }}>
                          {acc.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {validationErrors.destAccountId && (
                  <Text style={[styles.fieldError, { color: colors.error }]}>
                    {validationErrors.destAccountId}
                  </Text>
                )}
              </View>
            )}

            {showConsequenceLine && (
              <Text style={[styles.consequenceText, { color: colors.textMuted }]}>
                This {activeMode} will be counted against your{' '}
                <Text style={{ fontWeight: '700', color: colors.textSecondary }}>{selectedCategory!.name}</Text> budget
                {' — ₹'}
                {budgetRemaining!.toLocaleString('en-IN', { maximumFractionDigits: 0 })} left this month.
              </Text>
            )}
          </ScrollView>

          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose} disabled={isLoading}>
              <Text style={{ color: colors.textSecondary }}>Cancel</Text>
            </TouchableOpacity>
            <Button
              variant="outline"
              title={isLoading ? 'Saving...' : mode === 'edit' ? 'Save changes' : 'Save transaction'}
              onPress={handleSubmit}
              disabled={isLoading}
              style={styles.submitBtn}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#334155',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  headerTitle: {
    fontWeight: '700',
  },
  closeBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentedControl: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderBottomWidth: 2,
    paddingBottom: 8,
  },
  currencyPrefix: {
    fontSize: 20,
    fontWeight: '400',
  },
  amountInput: {
    flex: 1,
    fontWeight: '400',
  },
  currencyCode: {
    fontSize: 13,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 16,
  },
  pairRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  pairColumn: {
    flex: 1,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    minHeight: 44,
  },
  fieldValue: {
    fontSize: 15,
    flexShrink: 1,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  pickerChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  fieldError: {
    fontSize: 12,
    marginTop: 4,
  },
  consequenceText: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  cancelBtn: {
    minHeight: 44,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtn: {
    flex: 1,
  },
});
