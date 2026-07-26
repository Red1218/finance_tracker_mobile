import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Switch } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { AccountTypeKind } from '../../domain';

interface AccountFormProps {
  initialValues?: {
    name?: string;
    type?: AccountTypeKind;
    openingBalance?: number;
    isDefault?: boolean;
  };
  onSubmit: (data: {
    name: string;
    type: AccountTypeKind;
    openingBalance: number;
    isDefault: boolean;
  }) => void;
  isSubmitting?: boolean;
}

const ACCOUNT_TYPES: { key: AccountTypeKind; label: string }[] = [
  { key: AccountTypeKind.Cash, label: 'Cash' },
  { key: AccountTypeKind.Bank, label: 'Bank Account' },
  { key: AccountTypeKind.CreditCard, label: 'Credit Card' },
  { key: AccountTypeKind.Wallet, label: 'Digital Wallet' },
];

export function AccountForm({ initialValues, onSubmit, isSubmitting }: AccountFormProps) {
  const { colors, spacing, typography, radius } = useTheme();

  const [name, setName] = useState<string>(initialValues?.name ?? '');
  const [type, setType] = useState<AccountTypeKind>(initialValues?.type ?? AccountTypeKind.Cash);
  const [openingBalanceStr, setOpeningBalanceStr] = useState<string>(
    initialValues?.openingBalance !== undefined ? String(initialValues.openingBalance) : '0'
  );
  const [isDefault, setIsDefault] = useState<boolean>(initialValues?.isDefault ?? false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = () => {
    setValidationError(null);
    if (!name.trim()) {
      setValidationError('Account name is required.');
      return;
    }

    const bal = parseFloat(openingBalanceStr.trim());
    if (isNaN(bal)) {
      setValidationError('Opening balance must be a valid number.');
      return;
    }

    onSubmit({
      name: name.trim(),
      type,
      openingBalance: bal,
      isDefault,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surfacePrimary, borderRadius: radius.medium, padding: spacing.space16 }]}>
      {validationError && (
        <View style={[styles.errorBox, { backgroundColor: colors.surfaceSecondary, marginBottom: spacing.space12 }]}>
          <Text style={[{ color: colors.error }, typography.caption]}>{validationError}</Text>
        </View>
      )}

      {/* Account Name */}
      <Text style={[{ color: colors.textSecondary, marginBottom: spacing.space8 }, typography.label]}>
        Account Name
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.backgroundPrimary,
            color: colors.textPrimary,
            borderRadius: radius.small,
            padding: spacing.space12,
            marginBottom: spacing.space16,
          },
        ]}
        placeholder="e.g. HDFC Savings, Cash Wallet"
        placeholderTextColor={colors.textSecondary}
        value={name}
        onChangeText={setName}
        editable={!isSubmitting}
      />

      {/* Account Type */}
      <Text style={[{ color: colors.textSecondary, marginBottom: spacing.space8 }, typography.label]}>
        Account Type
      </Text>
      <View style={styles.chipRow}>
        {ACCOUNT_TYPES.map((t) => {
          const isSelected = type === t.key;
          return (
            <Pressable
              key={t.key}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? colors.brandPrimary : colors.backgroundPrimary,
                  borderRadius: radius.small,
                  paddingHorizontal: spacing.space12,
                  paddingVertical: spacing.space8,
                },
              ]}
              onPress={() => setType(t.key)}
              disabled={isSubmitting}
            >
              <Text style={[typography.caption, { color: isSelected ? '#ffffff' : colors.textPrimary, fontWeight: '600' }]}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ height: spacing.space16 }} />

      {/* Opening Balance */}
      <Text style={[{ color: colors.textSecondary, marginBottom: spacing.space8 }, typography.label]}>
        Opening Balance (₹)
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.backgroundPrimary,
            color: colors.textPrimary,
            borderRadius: radius.small,
            padding: spacing.space12,
            marginBottom: spacing.space16,
          },
        ]}
        placeholder="0.00"
        placeholderTextColor={colors.textSecondary}
        keyboardType="numeric"
        value={openingBalanceStr}
        onChangeText={setOpeningBalanceStr}
        editable={!isSubmitting}
      />

      {/* Set Default Toggle */}
      <View style={styles.switchRow}>
        <Text style={[{ color: colors.textPrimary }, typography.body]}>Set as Default Account</Text>
        <Switch value={isDefault} onValueChange={setIsDefault} disabled={isSubmitting} />
      </View>

      <View style={{ height: spacing.space20 }} />

      {/* Submit Button */}
      <Pressable
        style={[
          styles.submitButton,
          { backgroundColor: colors.brandPrimary, borderRadius: radius.medium, padding: spacing.space16 },
        ]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={[typography.body, { color: '#ffffff', fontWeight: 'bold', textAlign: 'center' }]}>
          {isSubmitting ? 'Saving...' : 'Save Account'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  errorBox: {
    padding: 10,
    borderRadius: 6,
  },
  input: {
    fontSize: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {},
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  submitButton: {},
});
