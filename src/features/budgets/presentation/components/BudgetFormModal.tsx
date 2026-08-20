import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { BudgetForm, CategoryOption } from './BudgetForm';
import { CreateBudgetFormData } from '../validation/budgetSchema';
import { BudgetViewModel } from '../models/BudgetViewModel';

export interface BudgetFormModalProps {
  visible: boolean;
  isEditMode?: boolean;
  editingBudget?: BudgetViewModel | null;
  categories?: CategoryOption[];
  isSubmitting?: boolean;
  error?: string | null;
  onSubmit: (formData: CreateBudgetFormData) => void;
  onClose: () => void;
}

export function BudgetFormModal({
  visible,
  isEditMode = false,
  editingBudget,
  categories = [],
  isSubmitting = false,
  error = null,
  onSubmit,
  onClose,
}: BudgetFormModalProps) {
  const { colors, typography } = useTheme();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
        <View style={[styles.header, { backgroundColor: colors.surfacePrimary, borderBottomColor: colors.borderSubtle }]}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary, fontSize: typography.title.fontSize }]}>
            {isEditMode ? 'Edit Budget Limit' : 'New Budget'}
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            accessibilityRole="button"
            accessibilityLabel="Close form modal"
          >
            <Text style={[styles.closeBtnText, { color: colors.brandPrimary }]}>Close</Text>
          </TouchableOpacity>
        </View>

        <BudgetForm
          initialValues={
            editingBudget
              ? {
                  amount: editingBudget.amount,
                  currencyCode: editingBudget.currency,
                  startDate: new Date(editingBudget.startDate),
                  endDate: new Date(editingBudget.endDate),
                  categoryId: editingBudget.categoryId,
                }
              : undefined
          }
          categories={categories}
          isEditMode={isEditMode}
          onSubmit={onSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
          error={error}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontWeight: '700',
  },
  closeBtn: {
    minHeight: 44,
    justifyContent: 'center',
  },
  closeBtnText: {
    fontWeight: '600',
  },
});
