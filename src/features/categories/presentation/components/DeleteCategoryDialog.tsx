import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Button } from '../../../../shared/components';
import { useTheme } from '../../../../shared/theme';

interface DeleteCategoryDialogProps {
  categoryName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DeleteCategoryDialog({
  categoryName,
  onConfirm,
  onCancel,
  isLoading,
}: DeleteCategoryDialogProps) {
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
      <Text style={titleStyle}>Delete Category</Text>
      <Text style={messageStyle}>
        Are you sure you want to delete "{categoryName}"? This action cannot be undone.
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
          title="Delete"
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
