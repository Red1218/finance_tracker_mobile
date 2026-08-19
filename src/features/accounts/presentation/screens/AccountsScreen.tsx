import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { AppBar, FAB, Icon } from '../../../../shared/components';
import { AccountsModule } from '../../composition/AccountsModule';
import { useAccounts } from '../hooks/useAccounts';
import { useUpdateAccount } from '../hooks/useUpdateAccount';
import { BalanceCard } from '../components/BalanceCard';
import { AccountCard } from '../components/AccountCard';
import { ArchiveDialog } from '../components/ArchiveDialog';
import { AccountViewModel } from '../models/AccountViewModel';

export interface AccountsScreenProps {
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
      <AppBar title="Accounts" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Title & Nav Links */}
        <View style={styles.headerRow}>
          <Text style={[{ color: colors.textPrimary }, typography.heading]}>My Accounts</Text>
          {onNavigateToArchived && (
            <Pressable
              style={[
                styles.navLink,
                { backgroundColor: colors.surfaceSecondary, borderRadius: radius.small, paddingHorizontal: spacing.space12, paddingVertical: spacing.space8 },
              ]}
              onPress={onNavigateToArchived}
              accessibilityRole="button"
              accessibilityLabel="View archived accounts"
            >
              <Text style={[typography.caption, { color: colors.textPrimary, fontWeight: '600' }]}>
                Archived Accounts
              </Text>
            </Pressable>
          )}
        </View>

        {(error || updateError) && (
          <View style={[styles.errorCard, { backgroundColor: 'rgba(239, 68, 68, 0.15)', marginBottom: spacing.space16 }]}>
            <Text style={[{ color: colors.error }, typography.caption]}>
              {error ?? updateError}
            </Text>
          </View>
        )}

        {/* Total Net Worth Header Card */}
        <BalanceCard totalBalance={totalBalance} activeAccountsCount={viewModels.length} />

        {/* Active Accounts Section */}
        <Text style={[styles.sectionHeader, { color: colors.textSecondary, fontSize: typography.label.fontSize }]}>
          ACTIVE ACCOUNTS ({viewModels.length})
        </Text>

        {viewModels.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="CreditCard" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary, fontSize: typography.title.fontSize }]}>
              No accounts created
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary, fontSize: typography.body.fontSize }]}>
              Tap '+' to create your first account.
            </Text>
          </View>
        ) : (
          viewModels.map((vm) => (
            <AccountCard
              key={vm.id}
              viewModel={vm}
              onSetDefault={setDefaultAccount}
              onArchive={() => setAccountToArchive(vm)}
              disabled={isUpdating}
            />
          ))
        )}
      </ScrollView>

      {/* Create Account FAB */}
      {onNavigateToCreate && <FAB iconName="Plus" onPress={onNavigateToCreate} accessibilityLabel="Add Account" />}


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
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
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
  sectionHeader: {
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
  },
  emptyTitle: {
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 6,
  },
  emptySubtitle: {
    textAlign: 'center',
  },
});
