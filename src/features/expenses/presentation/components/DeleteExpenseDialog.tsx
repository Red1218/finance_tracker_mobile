import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { Button } from '../../../../shared/components';
import { useTheme } from '../../../../shared/theme';
import { ExpenseItemModel } from '../models';

interface DeleteExpenseDialogProps {
  selectedExpense?: ExpenseItemModel;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DeleteExpenseDialog({
  selectedExpense,
  onConfirm,
  onCancel,
  isLoading,
}: DeleteExpenseDialogProps) {
  const { colors, spacing, typography, radius } = useTheme();
  
  const visible = selectedExpense !== undefined;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.dialog, { padding: spacing.space24, backgroundColor: colors.surfacePrimary, borderRadius: radius.large }]}>
          <Text style={[typography.title, { color: colors.textPrimary, marginBottom: spacing.space12 }]}>
            Delete Expense
          </Text>
          
          <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.space24 }]}>
            Are you sure you want to delete this expense for {selectedExpense?.formattedAmount}? This action cannot be undone.
          </Text>

          <View style={styles.actions}>
            <Button
              title="Cancel"
              onPress={onCancel}
              disabled={isLoading}
              style={{ flex: 1, marginRight: spacing.space8, backgroundColor: colors.surfaceSecondary }}
              accessibilityRole="button"
            />
            <Button
              title={isLoading ? 'Deleting...' : 'Delete'}
              onPress={onConfirm}
              disabled={isLoading}
              style={{ flex: 1, marginLeft: spacing.space8, backgroundColor: colors.error }}
              accessibilityRole="button"
              accessibilityState={{ disabled: isLoading }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  dialog: {
    width: '100%',
    maxWidth: 400,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
