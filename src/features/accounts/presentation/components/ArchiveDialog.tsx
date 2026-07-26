import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { useTheme } from '../../../../shared/theme';

interface ArchiveDialogProps {
  visible: boolean;
  accountName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ArchiveDialog({
  visible,
  accountName,
  onConfirm,
  onCancel,
  isSubmitting,
}: ArchiveDialogProps) {
  const { colors, spacing, typography, radius } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={[styles.dialog, { backgroundColor: colors.surfacePrimary, borderRadius: radius.medium, padding: spacing.space20 }]}>
          <Text style={[{ color: colors.textPrimary, marginBottom: spacing.space8 }, typography.title]}>
            Archive Account?
          </Text>
          <Text style={[{ color: colors.textSecondary, marginBottom: spacing.space20 }, typography.body]}>
            Are you sure you want to archive "{accountName}"? You can restore it later from Archived Accounts.
          </Text>

          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.button, { backgroundColor: colors.backgroundPrimary, borderRadius: radius.small }]}
              onPress={onCancel}
              disabled={isSubmitting}
            >
              <Text style={[typography.body, { color: colors.textPrimary }]}>Cancel</Text>
            </Pressable>

            <Pressable
              style={[styles.button, { backgroundColor: colors.error, borderRadius: radius.small }]}
              onPress={onConfirm}
              disabled={isSubmitting}
            >
              <Text style={[typography.body, { color: '#ffffff', fontWeight: 'bold' }]}>
                {isSubmitting ? 'Archiving...' : 'Archive'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 400,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
