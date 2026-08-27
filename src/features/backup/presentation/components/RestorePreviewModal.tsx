import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { Icon } from '../../../../shared/components/Icon';
import { BackupManifest } from '../../domain/value-objects/BackupManifest';

export interface RestorePreviewModalProps {
  readonly isVisible: boolean;
  readonly manifest: BackupManifest | null;
  readonly requiresPassphrase?: boolean;
  readonly isRestoring: boolean;
  readonly onConfirmRestore: (passphrase?: string) => void;
  readonly onCancel: () => void;
}

export function RestorePreviewModal({
  isVisible,
  manifest,
  requiresPassphrase = false,
  isRestoring,
  onConfirmRestore,
  onCancel,
}: RestorePreviewModalProps) {
  const { colors, typography } = useTheme();
  const [passphrase, setPassphrase] = useState('');

  if (!isVisible) {
    return null;
  }

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={[styles.backdrop, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={[styles.modalCard, { backgroundColor: colors.surfaceElevated }]}>
          <View style={styles.headerRow}>
            <Icon name="AlertTriangle" size="md" color={colors.warning} />
            <Text style={[styles.title, { color: colors.textPrimary, fontSize: typography.heading.fontSize }]}>
              Restore Backup Confirmation
            </Text>
          </View>

          <Text style={[styles.warningBanner, { color: colors.error, fontSize: typography.caption.fontSize }]}>
            ⚠️ Restoring will overwrite existing local data. Exactly ONE safety snapshot will be created before restoring.
          </Text>

          {manifest && (
            <View style={[styles.manifestBox, { backgroundColor: colors.surfacePrimary, borderColor: colors.borderSubtle }]}>
              <Text style={[styles.manifestHeader, { color: colors.textPrimary, fontSize: typography.body.fontSize }]}>
                Backup Metadata:
              </Text>
              <Text style={[styles.manifestText, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
                Format Version: {manifest.manifestVersion} | App Version: {manifest.appVersion}
              </Text>
              <Text style={[styles.manifestText, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
                Created: {manifest.createdAt.toLocaleString()}
              </Text>
              <Text style={[styles.manifestText, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
                Accounts: {manifest.entityCounts.accounts ?? 0} | Transactions: {manifest.entityCounts.transactions ?? 0}
              </Text>
            </View>
          )}

          {requiresPassphrase && (
            <TextInput
              style={[styles.input, { borderColor: colors.borderSubtle, color: colors.textPrimary }]}
              placeholder="Enter Decryption Passphrase"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              value={passphrase}
              onChangeText={setPassphrase}
            />
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel} disabled={isRestoring}>
              <Text style={[styles.cancelText, { color: colors.textSecondary, fontSize: typography.body.fontSize }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.restoreButton, { backgroundColor: colors.error }]}
              onPress={() => onConfirmRestore(passphrase || undefined)}
              disabled={isRestoring}
            >
              <Text style={[styles.restoreText, { color: colors.surfacePrimary, fontSize: typography.body.fontSize }]}>
                {isRestoring ? 'Restoring...' : 'Confirm Restore'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    padding: 20,
    borderRadius: 16,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontWeight: '700',
  },
  warningBanner: {
    fontWeight: '600',
    marginBottom: 16,
    lineHeight: 18,
  },
  manifestBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  manifestHeader: {
    fontWeight: '600',
    marginBottom: 4,
  },
  manifestText: {
    marginTop: 2,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelText: {
    fontWeight: '500',
  },
  restoreButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  restoreText: {
    fontWeight: '600',
  },
});
