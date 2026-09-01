import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { Icon } from '../../../../shared/components/Icon';

export interface BackupRestoreSectionProps {
  readonly onExportPress: () => void;
  readonly onRestorePress: () => void;
  readonly isExporting?: boolean;
  readonly isRestoring?: boolean;
}

export function BackupRestoreSection({
  onExportPress,
  onRestorePress,
  isExporting = false,
  isRestoring = false,
}: BackupRestoreSectionProps) {
  const { colors, spacing, typography } = useTheme();

  return (
    <View style={[styles.cardContainer, { paddingVertical: spacing.space16, borderBottomWidth: 1, borderBottomColor: colors.divider }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.groupLabel, { color: colors.textSecondary }]} accessibilityRole="header">
          Data & Backup
        </Text>
        <View style={[styles.badge, { backgroundColor: colors.borderSubtle }]}>
          <Text style={[styles.badgeText, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
            DEFERRED
          </Text>
        </View>
      </View>

      <Text style={[styles.description, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
        Platform encryption and backup container providers (.ftb) are implemented. Automated database export and restore orchestration is currently deferred for a future release.
      </Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.brandPrimary }]}
          onPress={onExportPress}
          disabled={isExporting || isRestoring}
          accessibilityRole="button"
          accessibilityLabel="Export Encrypted Backup"
        >
          <Icon name="Shield" size="sm" color={colors.surfacePrimary} />
          <Text style={[styles.buttonText, { color: colors.surfacePrimary, fontSize: typography.body.fontSize }]}>
            {isExporting ? 'Exporting...' : 'Export Backup'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButtonOutlined, { borderColor: colors.brandPrimary }]}
          onPress={onRestorePress}
          disabled={isExporting || isRestoring}
          accessibilityRole="button"
          accessibilityLabel="Restore Data from Backup"
        >
          <Text style={[styles.buttonTextOutlined, { color: colors.brandPrimary, fontSize: typography.body.fontSize }]}>
            {isRestoring ? 'Restoring...' : 'Restore Backup'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {},
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  groupLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  badgeText: {
    fontWeight: '700',
    fontSize: 10,
  },
  description: {
    marginBottom: 16,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  buttonText: {
    fontWeight: '600',
  },
  actionButtonOutlined: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  buttonTextOutlined: {
    fontWeight: '600',
  },
});
