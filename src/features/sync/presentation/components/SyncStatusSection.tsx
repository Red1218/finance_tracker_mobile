import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { Card } from '../../../../shared/components/Card';
import { Icon } from '../../../../shared/components/Icon';
import { StatusIndicator } from '../../../../shared/components/StatusIndicator';
import { SyncViewModel } from '../models/SyncViewModel';

export interface LegacySyncViewModel {
  readonly isOnline: boolean;
  readonly syncStatus: 'IDLE' | 'SYNCING' | 'FAILED';
  readonly pendingMutationCount: number;
  readonly lastSyncTimestamp: Date | null;
  readonly errorMessage: string | null;
}

export interface SyncStatusSectionProps {
  readonly viewModel: SyncViewModel | LegacySyncViewModel;
  readonly isSyncing?: boolean;
  readonly error?: string | null;
  readonly onManualSyncPress: () => void;
}

function isStandardSyncViewModel(vm: SyncViewModel | LegacySyncViewModel): vm is SyncViewModel {
  return 'statusLabel' in vm && 'statusColor' in vm;
}

export function SyncStatusSection({
  viewModel,
  isSyncing: isSyncingProp,
  error: errorProp,
  onManualSyncPress,
}: SyncStatusSectionProps) {
  const { colors, typography } = useTheme();

  let isOnline = viewModel.isOnline;
  let isSyncing = isSyncingProp ?? false;
  let badgeVariant: 'success' | 'warning' | 'error' | 'info' = 'success';
  let badgeText = 'ONLINE';
  let pendingMutationsCount = 0;
  let lastSyncFormatted: string | null = null;
  let errorMessage: string | null = errorProp ?? null;

  if (isStandardSyncViewModel(viewModel)) {
    isOnline = viewModel.isOnline;
    pendingMutationsCount = viewModel.pendingCount;

    if (viewModel.statusColor === 'emerald') badgeVariant = 'success';
    else if (viewModel.statusColor === 'amber') badgeVariant = 'warning';
    else if (viewModel.statusColor === 'red') badgeVariant = 'error';
    else badgeVariant = 'warning';

    badgeText = viewModel.statusLabel.toUpperCase();
    lastSyncFormatted = viewModel.lastSyncedFormatted !== 'Never' ? viewModel.lastSyncedFormatted : null;
  } else {
    isSyncing = isSyncingProp ?? viewModel.syncStatus === 'SYNCING';
    const isFailed = viewModel.syncStatus === 'FAILED';
    pendingMutationsCount = viewModel.pendingMutationCount;

    badgeVariant = !viewModel.isOnline
      ? 'warning'
      : isFailed
        ? 'error'
        : isSyncing
          ? 'info'
          : 'success';

    badgeText = !viewModel.isOnline
      ? 'OFFLINE'
      : isFailed
        ? 'SYNC FAILED'
        : isSyncing
          ? 'SYNCING...'
          : 'ONLINE';

    lastSyncFormatted = viewModel.lastSyncTimestamp
      ? viewModel.lastSyncTimestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : null;
    errorMessage = errorMessage ?? viewModel.errorMessage;
  }

  return (
    <Card variant="elevated" style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <Icon name="Cloud" size="md" color={colors.brandPrimary} />
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.heading.fontSize }]} accessibilityRole="header">
          Network & Synchronization
        </Text>
      </View>

      <View style={styles.statusRow}>
        <Text style={[styles.label, { color: colors.textSecondary, fontSize: typography.body.fontSize }]}>
          Connection Status:
        </Text>
        <View accessibilityLiveRegion="polite">
          <StatusIndicator status={badgeVariant} label={badgeText} variant="badge" />
        </View>
      </View>

      <View style={styles.statusRow}>
        <Text style={[styles.label, { color: colors.textSecondary, fontSize: typography.body.fontSize }]}>
          Pending Offline Queue:
        </Text>
        <Text style={[styles.value, { color: colors.textPrimary, fontSize: typography.body.fontSize }]}>
          {pendingMutationsCount} mutations
        </Text>
      </View>

      {lastSyncFormatted && (
        <View style={styles.statusRow}>
          <Text style={[styles.label, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
            Last Sync:
          </Text>
          <Text style={[styles.value, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
            {lastSyncFormatted}
          </Text>
        </View>
      )}

      {errorMessage && (
        <Text style={[styles.errorText, { color: colors.error, fontSize: typography.caption.fontSize }]}>
          {errorMessage}
        </Text>
      )}

      <TouchableOpacity
        style={[styles.syncButton, { borderColor: colors.brandPrimary }]}
        onPress={onManualSyncPress}
        disabled={isSyncing || !isOnline}
        accessibilityRole="button"
        accessibilityLabel="Sync Now"
      >
        <Icon name="RefreshCw" size="sm" color={colors.brandPrimary} />
        <Text style={[styles.syncButtonText, { color: colors.brandPrimary, fontSize: typography.body.fontSize }]}>
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </Text>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    padding: 16,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontWeight: '500',
  },
  value: {
    fontWeight: '600',
  },
  errorText: {
    marginTop: 4,
    marginBottom: 12,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
    gap: 6,
  },
  syncButtonText: {
    fontWeight: '600',
  },
});
