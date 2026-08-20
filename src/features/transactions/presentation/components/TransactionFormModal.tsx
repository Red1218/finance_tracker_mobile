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
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { Button, Icon } from '../../../../shared/components';

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

export interface TransactionFormModalProps {
  visible: boolean;
  mode: TransactionFormMode;
  initialValues?: Partial<TransactionFormValues>;
  accounts: Array<{ id: string; name: string; isArchived?: boolean }>;
  categories: Array<{ id: string; name: string; kind?: 'EXPENSE' | 'INCOME' }>;
  isLoading?: boolean;
  error?: string | null;
  onSubmit: (values: TransactionFormValues) => Promise<void>;
  onClose: () => void;
}

export function TransactionFormModal({
  visible,
  mode,
  initialValues,
  accounts = [],
  categories = [],
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

      setValidationErrors({});
      setIsDirty(false);
    }
  }, [visible, mode, initialValues, accounts]);

  const activeAccounts = accounts.filter((a) => !a.isArchived);

  const filteredCategories = categories.filter((c) => {
    if (activeMode === 'expense') return !c.kind || c.kind === 'EXPENSE';
    if (activeMode === 'income') return !c.kind || c.kind === 'INCOME';
    return false;
  });

  const handleModeChange = (newMode: 'expense' | 'income' | 'transfer') => {
    if (mode === 'edit') return;
    setActiveMode(newMode);
    setValidationErrors({});
    setIsDirty(true);
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!accountId) {
      errors.accountId = 'Please select an account';
    }

    if (activeMode === 'transfer') {
      if (!destAccountId) {
        errors.destAccountId = 'Please select a destination account';
      } else if (destAccountId === accountId) {
        errors.destAccountId = 'Destination account must differ from source account';
      }
    }

    const parsedAmount = parseFloat(amountStr);
    if (!amountStr.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      errors.amount = 'Amount must be greater than zero';
    }

    if (!description.trim()) {
      errors.description = 'Description is required';
    } else if (description.length > 255) {
      errors.description = 'Description cannot exceed 255 characters';
    }

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
      transactionDate: initialValues?.transactionDate || new Date(),
    };

    await onSubmit(values);
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
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />

        <View style={[styles.modalContent, { backgroundColor: colors.surfacePrimary, borderColor: colors.border }]}>
          <View style={styles.handleBar} />

          <View style={styles.headerRow}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary, fontSize: typography.title.fontSize }]}>
              {mode === 'edit'
                ? 'Edit Transaction'
                : activeMode === 'expense'
                ? 'New Expense'
                : activeMode === 'income'
                ? 'New Income'
                : 'New Transfer'}
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

          {mode !== 'edit' && (
            <View style={styles.segmentedRow}>
              {(['expense', 'income', 'transfer'] as const).map((m) => {
                const isActive = activeMode === m;
                return (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.segmentPill,
                      {
                        backgroundColor: isActive ? colors.brandPrimary : colors.surfaceSecondary,
                        borderColor: isActive ? colors.brandPrimary : colors.borderSubtle,
                      },
                    ]}
                    onPress={() => handleModeChange(m)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                    accessibilityLabel={`Set mode to ${m}`}
                  >
                    <Text
                      style={[
                        styles.segmentPillText,
                        { color: isActive ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {error && (
            <View
              style={[
                styles.errorBanner,
                { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: colors.error },
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
            <View style={styles.amountCard}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>AMOUNT</Text>
              <View style={styles.amountInputRow}>
                <Text
                  style={[
                    styles.currencyPrefix,
                    {
                      color:
                        activeMode === 'income'
                          ? colors.success
                          : activeMode === 'expense'
                          ? colors.error
                          : colors.warning,
                    },
                  ]}
                >
                  ₹
                </Text>
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
              </View>
              {validationErrors.amount && (
                <Text style={[styles.fieldError, { color: colors.error }]}>
                  {validationErrors.amount}
                </Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                {activeMode === 'transfer' ? 'FROM ACCOUNT' : 'ACCOUNT'}
              </Text>
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
                        setIsDirty(true);
                      }}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      accessibilityLabel={`Account ${acc.name}`}
                    >
                      <Text style={{ color: isSelected ? colors.brandPrimary : colors.textPrimary }}>
                        {acc.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {validationErrors.accountId && (
                <Text style={[styles.fieldError, { color: colors.error }]}>
                  {validationErrors.accountId}
                </Text>
              )}
            </View>

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
                        accessibilityRole="button"
                        accessibilityState={{ selected: isSelected, disabled: isSource }}
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

            {activeMode !== 'transfer' && filteredCategories.length > 0 && (
              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>CATEGORY</Text>
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
                          setCategoryId(isSelected ? null : cat.id);
                          setIsDirty(true);
                        }}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isSelected }}
                        accessibilityLabel={`Category ${cat.name}`}
                      >
                        <Text style={{ color: isSelected ? colors.brandPrimary : colors.textPrimary }}>
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>DESCRIPTION</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.surfaceSecondary,
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
          </ScrollView>

          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose} disabled={isLoading}>
              <Text style={{ color: colors.textSecondary }}>Cancel</Text>
            </TouchableOpacity>
            <Button
              title={
                isLoading
                  ? 'Saving...'
                  : mode === 'edit'
                  ? 'Save Changes'
                  : activeMode === 'expense'
                  ? 'Save Expense'
                  : activeMode === 'income'
                  ? 'Save Income'
                  : 'Execute Transfer'
              }
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
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
  segmentedRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  segmentPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  segmentPillText: {
    fontWeight: '600',
    fontSize: 14,
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
  amountCard: {
    marginBottom: 16,
    alignItems: 'center',
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
  },
  currencyPrefix: {
    fontSize: 28,
    fontWeight: '700',
  },
  amountInput: {
    fontWeight: '700',
    minWidth: 120,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  textInput: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    minHeight: 44,
  },
  fieldError: {
    fontSize: 12,
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
