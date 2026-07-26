import React from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { AccountsModule } from '../../composition/AccountsModule';
import { useAccounts } from '../hooks/useAccounts';
import { useUpdateAccount } from '../hooks/useUpdateAccount';
import { AccountCard } from '../components/AccountCard';

interface ArchivedAccountsScreenProps {
  module?: AccountsModule;
}

const defaultModule = new AccountsModule();

export function ArchivedAccountsScreen({ module = defaultModule }: ArchivedAccountsScreenProps) {
  const { colors, spacing, typography } = useTheme();

  const { viewModels, isLoading, error, refresh } = useAccounts(
    module.controller,
    true // includeArchived
  );

  const { isUpdating, updateError, restoreAccount } = useUpdateAccount(
    module.controller,
    refresh
  );

  const archivedViewModels = viewModels.filter((vm) => vm.isArchived);

  if (isLoading && viewModels.length === 0) {
    return (
      <View style={[styles.centeredContainer, { backgroundColor: colors.backgroundPrimary }]}>
        <ActivityIndicator size="large" color={colors.brandPrimary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}
      contentContainerStyle={{ padding: spacing.space16 }}
    >
      <Text style={[{ color: colors.textPrimary, marginBottom: spacing.space16 }, typography.heading]}>
        Archived Accounts
      </Text>

      {(error || updateError) && (
        <View style={[styles.errorCard, { backgroundColor: colors.surfaceSecondary, marginBottom: spacing.space16 }]}>
          <Text style={[{ color: colors.error }, typography.caption]}>
            {error ?? updateError}
          </Text>
        </View>
      )}

      {archivedViewModels.length === 0 ? (
        <View style={[styles.emptyContainer, { padding: spacing.space24 }]}>
          <Text style={[{ color: colors.textSecondary }, typography.body]}>
            No archived accounts found.
          </Text>
        </View>
      ) : (
        archivedViewModels.map((vm) => (
          <AccountCard
            key={vm.id}
            viewModel={vm}
            onRestore={restoreAccount}
            disabled={isUpdating}
          />
        ))
      )}
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorCard: {
    padding: 12,
    borderRadius: 8,
  },
});
