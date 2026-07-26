import React from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { AccountsModule } from '../../composition/AccountsModule';
import { useAccount } from '../hooks/useAccount';
import { useUpdateAccount } from '../hooks/useUpdateAccount';
import { AccountForm } from '../components/AccountForm';
import { AccountTypeKind } from '../../domain';

interface EditAccountScreenProps {
  accountId: string;
  module?: AccountsModule;
  onSuccess?: () => void;
}

const defaultModule = new AccountsModule();

export function EditAccountScreen({
  accountId,
  module = defaultModule,
  onSuccess,
}: EditAccountScreenProps) {
  const { colors, spacing, typography } = useTheme();

  const { viewModel, isLoading, error, refresh } = useAccount(module.controller, accountId);

  const { isUpdating, updateError, renameAccount, setDefaultAccount } = useUpdateAccount(
    module.controller,
    () => {
      refresh();
      onSuccess?.();
    }
  );

  const handleSubmit = async (data: {
    name: string;
    type: AccountTypeKind;
    openingBalance: number;
    isDefault: boolean;
  }) => {
    if (!viewModel) return;

    if (data.name !== viewModel.name) {
      await renameAccount(viewModel.id, data.name);
    }

    if (data.isDefault !== viewModel.isDefault && data.isDefault) {
      await setDefaultAccount(viewModel.id);
    }
  };

  if (isLoading && !viewModel) {
    return (
      <View style={[styles.centeredContainer, { backgroundColor: colors.backgroundPrimary }]}>
        <ActivityIndicator size="large" color={colors.brandPrimary} />
      </View>
    );
  }

  if (error || !viewModel) {
    return (
      <View style={[styles.centeredContainer, { backgroundColor: colors.backgroundPrimary }]}>
        <Text style={[{ color: colors.error }, typography.body]}>
          {error ?? 'Account not found.'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}
      contentContainerStyle={{ padding: spacing.space16 }}
    >
      <Text style={[{ color: colors.textPrimary, marginBottom: spacing.space16 }, typography.heading]}>
        Edit Account
      </Text>

      {updateError && (
        <View style={[styles.errorCard, { backgroundColor: colors.surfaceSecondary, marginBottom: spacing.space16 }]}>
          <Text style={[{ color: colors.error }, typography.caption]}>{updateError}</Text>
        </View>
      )}

      <AccountForm
        initialValues={{
          name: viewModel.name,
          type: viewModel.type,
          openingBalance: viewModel.openingBalance,
          isDefault: viewModel.isDefault,
        }}
        onSubmit={handleSubmit}
        isSubmitting={isUpdating}
      />
    </ScrollView>
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
    padding: 24,
  },
  errorCard: {
    padding: 12,
    borderRadius: 8,
  },
});
