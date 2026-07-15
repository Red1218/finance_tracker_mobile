import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { Button } from '../../../../shared/components';
import { useTheme } from '../../../../shared/theme';
import { BudgetItemModel } from '../models';

interface DeleteBudgetDialogProps {
  visible: boolean;
  budget: BudgetItemModel | null;
  onConfirm: (budget: BudgetItemModel) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DeleteBudgetDialog({ visible, budget, onConfirm, onCancel, isLoading }: DeleteBudgetDialogProps) {
  const { colors, spacing, typography, radius } = useTheme();

  if (!budget) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.dialog, { backgroundColor: colors.surfacePrimary, padding: spacing.space24, borderRadius: radius.medium }]}>
          <Text style={[typography.heading, { color: colors.textPrimary, marginBottom: spacing.space16 }]}>
            Delete Budget
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.space24 }]}>
            Are you sure you want to delete this budget for period {budget.period}? This action cannot be undone.
          </Text>
          
          <View style={styles.actions}>
            <Button
              title="Cancel"
              onPress={onCancel}
              disabled={isLoading}
              style={{ flex: 1, marginRight: spacing.space8, backgroundColor: colors.surfaceSecondary }}
            />
            <Button
              title={isLoading ? 'Deleting...' : 'Delete'}
              onPress={() => onConfirm(budget)}
              disabled={isLoading}
              style={{ flex: 1, marginLeft: spacing.space8, backgroundColor: colors.error }}
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
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 400,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  }
});
