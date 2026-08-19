import React, { useState } from 'react';
import { View, Text, ActivityIndicator, Modal, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '@/src/shared/theme';
import { AppBar, FAB, Icon } from '@/src/shared/components';
import { useBudgets } from '../hooks/useBudgets';
import { useCreateBudget } from '../hooks/useCreateBudget';
import { useUpdateBudget } from '../hooks/useUpdateBudget';
import { useArchiveBudget } from '../hooks/useArchiveBudget';
import { BudgetForm } from '../components/BudgetForm';
import { BudgetCard } from '../components/BudgetCard';
import { BudgetViewModel } from '../models/BudgetViewModel';
import { BudgetPeriod } from '../../domain';
import { CreateBudgetFormData } from '../validation/budgetSchema';
import { BudgetsModule } from '../../composition/BudgetsModule';


const budgetsModule = new BudgetsModule();

export const BudgetsScreen: React.FC = () => {
  const { colors, typography, spacing } = useTheme();
  const { budgets, isLoading, error, refresh } = useBudgets(budgetsModule.listBudgetsUseCase);
  const { createBudget, isLoading: isCreating, error: createError } = useCreateBudget(budgetsModule.createBudgetUseCase);
  const { updateBudget, isLoading: isUpdating, error: updateError } = useUpdateBudget(budgetsModule.updateBudgetUseCase);
  const { archiveBudget, isLoading: isArchiving } = useArchiveBudget(budgetsModule.archiveBudgetUseCase);

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetViewModel | null>(null);
  const [budgetToArchive, setBudgetToArchive] = useState<BudgetViewModel | null>(null);

  const handleAddBudget = () => {
    setEditingBudget(null);
    setIsFormVisible(true);
  };

  const handleEditBudget = (budget: BudgetViewModel) => {
    setEditingBudget(budget);
    setIsFormVisible(true);
  };

  const handleArchiveRequest = (budget: BudgetViewModel) => {
    setBudgetToArchive(budget);
  };

  const handleFormSubmit = async (formData: CreateBudgetFormData) => {
    if (editingBudget) {
      const res = await updateBudget({
        id: editingBudget.id,
        newAmount: formData.amount,
      });

      if (res) {
        setIsFormVisible(false);
        setEditingBudget(null);
        refresh();
      }
    } else {
      const res = await createBudget({
        categoryId: formData.categoryId ?? null,
        amount: formData.amount,
        currencyCode: formData.currencyCode,
        periodKind: formData.period,
        startDate: formData.startDate,
        endDate: formData.endDate,
      });

      if (res) {
        setIsFormVisible(false);
        refresh();
      }
    }
  };

  const handleConfirmArchive = async () => {
    if (!budgetToArchive) return;
    const success = await archiveBudget({ id: budgetToArchive.id });

    if (success) {
      setBudgetToArchive(null);
      refresh();
    }
  };

  if (isLoading && budgets.length === 0) {
    return (
      <View style={[styles.centeredContainer, { backgroundColor: colors.backgroundPrimary }]}>
        <ActivityIndicator size="large" color={colors.brandPrimary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <AppBar title="Budgets" />

      {error && (
        <View style={[styles.errorContainer, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
          <Text style={[styles.errorText, { color: colors.error, fontSize: typography.caption.fontSize }]}>{error}</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {budgets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="Target" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary, fontSize: typography.title.fontSize }]}>
              No active budgets
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary, fontSize: typography.body.fontSize }]}>
              Tap '+' to create your first budget.
            </Text>
          </View>
        ) : (
          budgets.map((b) => {
            const summary = {
              budget: {
                id: b.id,
                categoryId: b.categoryId,
                amount: b.amount,
                currency: b.currency,
                period: (b.periodKind as unknown as BudgetPeriod) || ('MONTHLY' as unknown as BudgetPeriod),
                startDate: new Date(b.startDate),
                endDate: new Date(b.endDate),
              },
              spentAmount: b.spentAmount ?? 0,
              remainingAmount: b.remainingAmount ?? b.amount,
              percentageUsed: b.percentageUsed ?? 0,
              status: (b.healthStatus === 'NEAR_LIMIT' ? 'AtRisk' : b.healthStatus === 'OVER_BUDGET' ? 'Overbudget' : 'OnTrack') as 'OnTrack' | 'AtRisk' | 'Overbudget',
            };
            const catName = b.isOverall ? 'Overall Budget' : `Category (${b.categoryId ?? 'Uncategorized'})`;

            return (
              <BudgetCard
                key={b.id}
                summary={summary}
                categoryName={catName}
                onEdit={() => handleEditBudget(b)}
                onDelete={() => handleArchiveRequest(b)}
              />
            );
          })
        )}
      </ScrollView>

      <FAB iconName="Plus" onPress={handleAddBudget} accessibilityLabel="Add Budget" />


      {/* Form Modal for Create / Edit */}
      <Modal
        visible={isFormVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsFormVisible(false)}
      >
        <View style={[styles.modalHeader, { backgroundColor: colors.surfacePrimary, borderBottomColor: colors.borderSubtle }]}>
          <Text style={[styles.modalTitle, { color: colors.textPrimary, fontSize: typography.title.fontSize }]}>
            {editingBudget ? 'Edit Budget' : 'New Budget'}
          </Text>
          <TouchableOpacity onPress={() => setIsFormVisible(false)} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Close modal">
            <Text style={{ color: colors.brandPrimary, fontWeight: '600' }}>Close</Text>
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
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormVisible(false)}
          isSubmitting={isCreating || isUpdating}
          error={editingBudget ? updateError || undefined : createError || undefined}
        />
      </Modal>

      {/* Archive Confirmation Modal */}
      <Modal visible={!!budgetToArchive} transparent animationType="fade">
        <View style={styles.dialogBackdrop}>
          <View style={[styles.dialogCard, { backgroundColor: colors.surfacePrimary, borderColor: colors.border }]}>
            <Text style={[styles.dialogTitle, { color: colors.textPrimary, fontSize: typography.title.fontSize }]}>
              Archive Budget?
            </Text>
            <Text style={[styles.dialogMessage, { color: colors.textSecondary, fontSize: typography.body.fontSize }]}>
              This budget will be hidden from active budgets but remains in history.
            </Text>
            <View style={styles.dialogActions}>
              <TouchableOpacity
                onPress={() => setBudgetToArchive(null)}
                style={[styles.dialogBtn, { backgroundColor: colors.surfaceSecondary }]}
                accessibilityRole="button"
                accessibilityLabel="Cancel archive"
              >
                <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmArchive}
                disabled={isArchiving}
                style={[styles.dialogBtn, { backgroundColor: colors.error }]}
                accessibilityRole="button"
                accessibilityLabel="Confirm archive"
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
                  {isArchiving ? 'Archiving...' : 'Archive'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
  },
  errorText: {},
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 6,
  },
  emptySubtitle: {
    textAlign: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontWeight: '700',
  },
  closeBtn: {
    minHeight: 44,
    justifyContent: 'center',
  },
  dialogBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 360,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  dialogTitle: {
    fontWeight: '700',
    marginBottom: 8,
  },
  dialogMessage: {
    marginBottom: 20,
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  dialogBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
