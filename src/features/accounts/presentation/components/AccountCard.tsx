import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { Card } from '../../../../shared/components';
import { AccountViewModel } from '../models/AccountViewModel';
import { AccountTypeBadge } from './AccountTypeBadge';
import { DefaultAccountBadge } from './DefaultAccountBadge';

export interface AccountCardProps {
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
  const { colors, typography } = useTheme();

  return (
    <Card style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={[styles.accountName, { color: colors.textPrimary, fontSize: typography.title.fontSize }]} numberOfLines={1}>
            {viewModel.name}
          </Text>
          <View style={styles.badgeRow}>
            <AccountTypeBadge type={viewModel.type} label={viewModel.typeLabel} />
            {viewModel.isDefault && <DefaultAccountBadge />}
          </View>
        </View>

        <View style={styles.balanceContainer}>
          <Text style={[styles.derivedBalance, { color: colors.textPrimary, fontSize: typography.numeric.fontSize, fontVariant: ['tabular-nums'] }]}>
            {viewModel.formattedDerivedBalance}
          </Text>
          <Text style={[styles.openingBalance, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
            Opening: {viewModel.formattedOpeningBalance}
          </Text>
        </View>
      </View>

      <View style={[styles.actionsRow, { borderTopColor: colors.borderSubtle }]}>
        {!viewModel.isArchived && !viewModel.isDefault && onSetDefault && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surfaceElevated }]}
            onPress={() => onSetDefault(viewModel.id)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={`Set ${viewModel.name} as default account`}
          >
            <Text style={[styles.actionBtnText, { color: colors.brandPrimary, fontSize: typography.caption.fontSize }]}>Set Default</Text>
          </TouchableOpacity>
        )}

        {!viewModel.isArchived && onArchive && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}
            onPress={() => onArchive(viewModel.id)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={`Archive ${viewModel.name}`}
          >
            <Text style={[styles.actionBtnText, { color: colors.error, fontSize: typography.caption.fontSize }]}>Archive</Text>
          </TouchableOpacity>
        )}

        {viewModel.isArchived && onRestore && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surfaceElevated }]}
            onPress={() => onRestore(viewModel.id)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={`Restore ${viewModel.name}`}
          >
            <Text style={[styles.actionBtnText, { color: colors.brandPrimary, fontSize: typography.caption.fontSize }]}>Restore</Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 12,
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
  accountName: {
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  derivedBalance: {
    fontWeight: '700',
  },
  openingBalance: {
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minHeight: 32,
    justifyContent: 'center',
  },
  actionBtnText: {
    fontWeight: '600',
  },
});
