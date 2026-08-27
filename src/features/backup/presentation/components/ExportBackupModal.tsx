import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { Icon } from '../../../../shared/components/Icon';

export interface ExportBackupModalProps {
  readonly isVisible: boolean;
  readonly isGenerating: boolean;
  readonly onGenerateExport: (passphrase?: string) => void;
  readonly onCancel: () => void;
}

export function ExportBackupModal({
  isVisible,
  isGenerating,
  onGenerateExport,
  onCancel,
}: ExportBackupModalProps) {
  const { colors, typography } = useTheme();
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerate = () => {
    if (passphrase && passphrase !== confirmPassphrase) {
      setErrorMessage('Passphrases do not match.');
      return;
    }
    setErrorMessage(null);
    onGenerateExport(passphrase || undefined);
  };

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={[styles.backdrop, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={[styles.modalCard, { backgroundColor: colors.surfaceElevated }]}>
          <View style={styles.headerRow}>
            <Icon name="Shield" size="md" color={colors.brandPrimary} />
            <Text style={[styles.title, { color: colors.textPrimary, fontSize: typography.heading.fontSize }]}>
              Export Encrypted Backup
            </Text>
          </View>

          <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
            Set an optional passphrase to encrypt your backup container (.ftb).
          </Text>

          <TextInput
            style={[styles.input, { borderColor: colors.borderSubtle, color: colors.textPrimary }]}
            placeholder="Optional Passphrase"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            value={passphrase}
            onChangeText={setPassphrase}
          />

          <TextInput
            style={[styles.input, { borderColor: colors.borderSubtle, color: colors.textPrimary }]}
            placeholder="Confirm Passphrase"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            value={confirmPassphrase}
            onChangeText={setConfirmPassphrase}
          />

          {errorMessage && (
            <Text style={[styles.errorText, { color: colors.error, fontSize: typography.caption.fontSize }]}>
              {errorMessage}
            </Text>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel} disabled={isGenerating}>
              <Text style={[styles.cancelText, { color: colors.textSecondary, fontSize: typography.body.fontSize }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.generateButton, { backgroundColor: colors.brandPrimary }]}
              onPress={handleGenerate}
              disabled={isGenerating}
            >
              <Text style={[styles.generateText, { color: colors.surfacePrimary, fontSize: typography.body.fontSize }]}>
                {isGenerating ? 'Generating...' : 'Generate & Share'}
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
    marginBottom: 8,
  },
  title: {
    fontWeight: '700',
  },
  subtitle: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  errorText: {
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelText: {
    fontWeight: '500',
  },
  generateButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  generateText: {
    fontWeight: '600',
  },
});
