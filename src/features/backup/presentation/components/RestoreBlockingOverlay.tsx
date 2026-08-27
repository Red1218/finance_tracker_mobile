import React from 'react';
import { View, Text, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { useTheme } from '../../../../shared/theme';

export interface RestoreBlockingOverlayProps {
  readonly isVisible: boolean;
  readonly progressMessage?: string;
}

export function RestoreBlockingOverlay({
  isVisible,
  progressMessage = 'Restoring database & validating safety snapshot...',
}: RestoreBlockingOverlayProps) {
  const { colors, typography } = useTheme();

  if (!isVisible) return null;

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={() => {}}>
      <View
        style={[styles.backdrop, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]}
        accessibilityRole="alert"
        accessibilityLiveRegion="assertive"
      >
        <View style={[styles.card, { backgroundColor: colors.surfaceElevated }]}>
          <ActivityIndicator size="large" color={colors.brandPrimary} />
          <Text style={[styles.title, { color: colors.textPrimary, fontSize: typography.heading.fontSize }]}>
            Restore In Progress
          </Text>
          <Text style={[styles.message, { color: colors.textSecondary, fontSize: typography.body.fontSize }]}>
            {progressMessage}
          </Text>
          <Text style={[styles.subtext, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
            Please do not close or minimize the application.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 12,
  },
  title: {
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    marginBottom: 12,
  },
  subtext: {
    textAlign: 'center',
  },
});
