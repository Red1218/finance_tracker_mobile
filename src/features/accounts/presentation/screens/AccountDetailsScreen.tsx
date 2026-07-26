import React from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { AccountsModule } from '../../composition/AccountsModule';
import { useAccount } from '../hooks/useAccount';
import { AccountTypeBadge } from '../components/AccountTypeBadge';
import { DefaultAccountBadge } from '../components/DefaultAccountBadge';

interface AccountDetailsScreenProps {
  accountId: string;
  module?: AccountsModule;
  onNavigateToEdit?: (id: string) => void;
}

const defaultModule = new AccountsModule();

export function AccountDetailsScreen({
  accountId,
  module = defaultModule,
  onNavigateToEdit,
}: AccountDetailsScreenProps) {
  const { colors, spacing, typography, radius } = useTheme();

  const { viewModel, isLoading, error } = useAccount(module.controller, accountId);

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
          {error ?? 'Account details not found.'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}
      contentContainerStyle={{ padding: spacing.space16 }}
    >
      <View style={styles.headerRow}>
        <Text style={[{ color: colors.textPrimary }, typography.heading]}>{viewModel.name}</Text>
        {onNavigateToEdit && (
          <Pressable
            style={[styles.editButton, { backgroundColor: colors.surfaceSecondary, borderRadius: radius.small, paddingHorizontal: spacing.space12, paddingVertical: spacing.space8 }]}
            onPress={() => onNavigateToEdit(viewModel.id)}
          >
            <Text style={[typography.caption, { color: colors.brandPrimary, fontWeight: '600' }]}>Edit</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.badgeRow}>
        <AccountTypeBadge type={viewModel.type} label={viewModel.typeLabel} />
        {viewModel.isDefault && <DefaultAccountBadge />}
      </View>

      <View style={{ height: spacing.space20 }} />

      {/* Balance Details Card */}
      <View style={[styles.card, { backgroundColor: colors.surfacePrimary, borderRadius: radius.medium, padding: spacing.space20 }]}>
        <Text style={[{ color: colors.textSecondary, marginBottom: spacing.space8 }, typography.label]}>Current Balance</Text>
        <Text style={[{ color: colors.textPrimary, fontWeight: 'bold', marginBottom: spacing.space16 }, typography.display]}>
          {viewModel.formattedDerivedBalance}
        </Text>

        <View style={styles.detailRow}>
          <Text style={[{ color: colors.textSecondary }, typography.body]}>Opening Balance</Text>
          <Text style={[{ color: colors.textPrimary, fontWeight: '600' }, typography.body]}>{viewModel.formattedOpeningBalance}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={[{ color: colors.textSecondary }, typography.body]}>Currency</Text>
          <Text style={[{ color: colors.textPrimary, fontWeight: '600' }, typography.body]}>{viewModel.currencyCode}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={[{ color: colors.textSecondary }, typography.body]}>Status</Text>
          <Text style={[{ color: viewModel.isArchived ? colors.error : colors.textPrimary, fontWeight: '600' }, typography.body]}>
            {viewModel.isArchived ? 'Archived' : 'Active'}
          </Text>
        </View>
      </View>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editButton: {},
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  card: {},
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
});
