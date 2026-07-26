import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { AccountViewModel } from '../models/AccountViewModel';
import { AccountTypeBadge } from './AccountTypeBadge';
import { DefaultAccountBadge } from './DefaultAccountBadge';

interface AccountCardProps {
  viewModel: AccountViewModel;
  onSetDefault?: (id: string) => void;
  onArchive?: (id: string) => void;
  onRestore?: (id: string) => void;
  disabled?: boolean;
}

export function AccountCard({
  viewModel,
  onSetDefault,
  onArchive,
  onRestore,
  disabled,
}: AccountCardProps) {
  const { colors, spacing, typography, radius } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surfacePrimary, borderRadius: radius.medium, padding: spacing.space16, marginBottom: spacing.space12 }]}>
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={[{ color: colors.textPrimary, fontWeight: 'bold' }, typography.title]}>
            {viewModel.name}
          </Text>
          <View style={styles.badgeRow}>
            <AccountTypeBadge type={viewModel.type} label={viewModel.typeLabel} />
            {viewModel.isDefault && <DefaultAccountBadge />}
          </View>
        </View>

        <View style={styles.balanceContainer}>
          <Text style={[{ color: colors.textPrimary, fontWeight: 'bold' }, typography.heading]}>
            {viewModel.formattedDerivedBalance}
          </Text>
          <Text style={[{ color: colors.textSecondary }, typography.caption]}>Opening: {viewModel.formattedOpeningBalance}</Text>
        </View>
      </View>

      {/* Action Buttons Footer */}
      <View style={styles.actionsRow}>
        {!viewModel.isArchived && !viewModel.isDefault && onSetDefault && (
          <Pressable
            style={[styles.actionButton, { backgroundColor: colors.backgroundPrimary, borderRadius: radius.small, paddingHorizontal: spacing.space12, paddingVertical: spacing.space8 }]}
            onPress={() => onSetDefault(viewModel.id)}
            disabled={disabled}
          >
            <Text style={[typography.caption, { color: colors.brandPrimary, fontWeight: '600' }]}>Set Default</Text>
          </Pressable>
        )}

        {!viewModel.isArchived && onArchive && (
          <Pressable
            style={[styles.actionButton, { backgroundColor: colors.backgroundPrimary, borderRadius: radius.small, paddingHorizontal: spacing.space12, paddingVertical: spacing.space8 }]}
            onPress={() => onArchive(viewModel.id)}
            disabled={disabled}
          >
            <Text style={[typography.caption, { color: colors.error, fontWeight: '600' }]}>Archive</Text>
          </Pressable>
        )}

        {viewModel.isArchived && onRestore && (
          <Pressable
            style={[styles.actionButton, { backgroundColor: colors.backgroundPrimary, borderRadius: radius.small, paddingHorizontal: spacing.space12, paddingVertical: spacing.space8 }]}
            onPress={() => onRestore(viewModel.id)}
            disabled={disabled}
          >
            <Text style={[typography.caption, { color: colors.brandPrimary, fontWeight: '600' }]}>Restore</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    paddingRight: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  actionButton: {},
});
