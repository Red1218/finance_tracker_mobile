import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { AccountsModule } from '../../composition/AccountsModule';
import { useAccounts } from '../hooks/useAccounts';
import { useUpdateAccount } from '../hooks/useUpdateAccount';
import { BalanceCard } from '../components/BalanceCard';
import { AccountCard } from '../components/AccountCard';
import { ArchiveDialog } from '../components/ArchiveDialog';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { AccountViewModel } from '../models/AccountViewModel';

interface AccountsScreenProps {
  module?: AccountsModule;
  onNavigateToCreate?: () => void;
  onNavigateToArchived?: () => void;
}

const defaultModule = new AccountsModule();

export function AccountsScreen({
  module = defaultModule,
  onNavigateToCreate,
  onNavigateToArchived,
}: AccountsScreenProps) {
  const { colors, spacing, typography, radius } = useTheme();

  const { viewModels, totalBalance, isLoading, error, refresh } = useAccounts(
    module.controller,
    false
  );

  const { isUpdating, updateError, setDefaultAccount, archiveAccount } = useUpdateAccount(
    module.controller,
    refresh
  );

  const [accountToArchive, setAccountToArchive] = useState<AccountViewModel | null>(null);

  const handleConfirmArchive = async () => {
    if (!accountToArchive) return;
    await archiveAccount(accountToArchive.id);
    setAccountToArchive(null);
  };

  if (isLoading && viewModels.length === 0) {
    return (
      <View style={[styles.centeredContainer, { backgroundColor: colors.backgroundPrimary }]}>
        <ActivityIndicator size="large" color={colors.brandPrimary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <ScrollView contentContainerStyle={{ padding: spacing.space16 }}>
        {/* Header Title & Nav Links */}
        <View style={styles.headerRow}>
          <Text style={[{ color: colors.textPrimary }, typography.heading]}>Accounts</Text>
          {onNavigateToArchived && (
            <Pressable
              style={[
                styles.navLink,
                { backgroundColor: colors.surfaceSecondary, borderRadius: radius.small, paddingHorizontal: spacing.space12, paddingVertical: spacing.space8 },
              ]}
              onPress={onNavigateToArchived}
            >
              <Text style={[typography.caption, { color: colors.textPrimary, fontWeight: '600' }]}>
                Archived Accounts
              </Text>
            </Pressable>
          )}
        </View>

        {(error || updateError) && (
          <View style={[styles.errorCard, { backgroundColor: colors.surfaceSecondary, marginBottom: spacing.space16 }]}>
            <Text style={[{ color: colors.error }, typography.caption]}>
              {error ?? updateError}
            </Text>
          </View>
        )}

        {/* Total Net Worth Header Card */}
        <BalanceCard totalBalance={totalBalance} activeAccountsCount={viewModels.length} />

        {/* Active Accounts Section */}
        <Text style={[{ color: colors.textSecondary, marginBottom: spacing.space12 }, typography.label]}>
          Active Accounts
        </Text>

        {viewModels.map((vm) => (
          <AccountCard
            key={vm.id}
            viewModel={vm}
            onSetDefault={setDefaultAccount}
            onArchive={() => setAccountToArchive(vm)}
            disabled={isUpdating}
          />
        ))}
      </ScrollView>

      {/* Create Account FAB */}
      {onNavigateToCreate && <FloatingActionButton onPress={onNavigateToCreate} />}

      {/* Archive Modal */}
      <ArchiveDialog
        visible={!!accountToArchive}
        accountName={accountToArchive?.name ?? ''}
        onConfirm={handleConfirmArchive}
        onCancel={() => setAccountToArchive(null)}
        isSubmitting={isUpdating}
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
    padding: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navLink: {},
  errorCard: {
    padding: 12,
    borderRadius: 8,
  },
});
