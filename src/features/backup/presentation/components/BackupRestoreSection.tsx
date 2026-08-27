import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { Card } from '../../../../shared/components/Card';
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
  const { colors, typography } = useTheme();

  return (
    <Card variant="elevated" style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <Icon name="Database" size="md" color={colors.brandPrimary} />
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.heading.fontSize }]} accessibilityRole="header">
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
    marginBottom: 8,
    gap: 8,
  },
  sectionTitle: {
    fontWeight: '700',
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
