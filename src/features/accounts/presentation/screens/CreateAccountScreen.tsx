import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { AccountsModule } from '../../composition/AccountsModule';
import { useUpdateAccount } from '../hooks/useUpdateAccount';
import { AccountForm } from '../components/AccountForm';
import { AccountTypeKind } from '../../domain';

interface CreateAccountScreenProps {
  module?: AccountsModule;
  onSuccess?: () => void;
}

const defaultModule = new AccountsModule();

export function CreateAccountScreen({
  module = defaultModule,
  onSuccess,
}: CreateAccountScreenProps) {
  const { colors, spacing, typography } = useTheme();

  const { isUpdating, updateError, createAccount } = useUpdateAccount(
    module.controller,
    onSuccess
  );

  const handleSubmit = async (data: {
    name: string;
    type: AccountTypeKind;
    openingBalance: number;
    isDefault: boolean;
  }) => {
    await createAccount(data);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}
      contentContainerStyle={{ padding: spacing.space16 }}
    >
      <Text style={[{ color: colors.textPrimary, marginBottom: spacing.space16 }, typography.heading]}>
        Create Account
      </Text>

      {updateError && (
        <View style={[styles.errorCard, { backgroundColor: colors.surfaceSecondary, marginBottom: spacing.space16 }]}>
          <Text style={[{ color: colors.error }, typography.caption]}>{updateError}</Text>
        </View>
      )}

      <AccountForm onSubmit={handleSubmit} isSubmitting={isUpdating} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorCard: {
    padding: 12,
    borderRadius: 8,
  },
});
