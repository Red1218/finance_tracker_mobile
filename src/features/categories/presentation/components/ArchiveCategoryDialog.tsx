import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Button } from '../../../../shared/components';
import { useTheme } from '../../../../shared/theme';

interface ArchiveCategoryDialogProps {
  categoryName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ArchiveCategoryDialog({
  categoryName,
  onConfirm,
  onCancel,
  isLoading,
}: ArchiveCategoryDialogProps) {
  const { colors, spacing, typography, radius } = useTheme();

  const containerStyle: ViewStyle = {
    padding: spacing.space24,
    backgroundColor: colors.surfacePrimary,
    borderRadius: radius.large,
    alignItems: 'center',
  };

  const titleStyle: TextStyle = {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.space16,
    textAlign: 'center',
  };

  const messageStyle: TextStyle = {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.space24,
    textAlign: 'center',
  };

  return (
    <View style={containerStyle}>
      <Text style={titleStyle}>Archive Category</Text>
      <Text style={messageStyle}>
        Archive "{categoryName}"? It will be hidden from pickers but remain attached to existing expenses. You can restore it at any time.
      </Text>

      <View style={styles.actions}>
        <Button
          title="Cancel"
          variant="secondary"
          onPress={onCancel}
          disabled={isLoading}
          style={styles.button}
        />
        <View style={{ width: spacing.space16 }} />
        <Button
          title="Archive"
          variant="destructive"
          onPress={onConfirm}
          loading={isLoading}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    width: '100%',
  },
  button: {
    flex: 1,
  },
});
