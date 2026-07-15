import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { Button, Loading, Screen } from '../../../../shared/components';
import { useTheme } from '../../../../shared/theme';
import { BudgetForm, BudgetList, DeleteBudgetDialog } from '../components';
import {
  useBudgets,
  useCategoryOptions,
  useCloneBudgetPeriod,
  useCreateBudget,
  useDeleteBudget,
  useUpdateBudget,
} from '../hooks';
import { BudgetItemModel } from '../models';

export function ManageBudgetsScreen() {
  const { colors, spacing, typography } = useTheme();

  const { categoryOptions, isLoading: isCategoriesLoading } = useCategoryOptions();

  const { budgets, isLoading: isFetching, error: fetchError, refresh } = useBudgets();
  const { createBudget, isLoading: isCreating } = useCreateBudget();
  const { updateBudget, isLoading: isUpdating } = useUpdateBudget();
  const { deleteBudget, isLoading: isDeleting } = useDeleteBudget();
  const { cloneBudgetPeriod, isLoading: isCloning } = useCloneBudgetPeriod();

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<BudgetItemModel | undefined>(undefined);
  const [budgetToDelete, setBudgetToDelete] = useState<BudgetItemModel | null>(null);

  const handleAddBudget = () => {
    setSelectedBudget(undefined);
    setIsFormVisible(true);
  };

  const handleEditBudget = (budget: BudgetItemModel) => {
    setSelectedBudget(budget);
    setIsFormVisible(true);
  };

  const handleDeleteRequest = (budget: BudgetItemModel) => {
    setBudgetToDelete(budget);
  };

  const handleClonePrevious = async () => {
    // Basic example of cloning previous to current
    const success = await cloneBudgetPeriod({
      sourcePeriod: '2024-01',
      targetPeriod: '2024-02'
    });
    if (success) refresh();
  };

  const handleFormSubmit = async (data: {
    categoryId: string | null;
    amount: number;
    currency: string;
    period: string;
    status: string;
  }) => {
    let success = false;
    if (selectedBudget) {
      success = await updateBudget({
        id: selectedBudget.id,
        amount: data.amount,
        currency: data.currency as any,
        status: data.status as any,
      });
    } else {
      success = await createBudget({
        categoryId: data.categoryId,
        amount: data.amount,
        currency: data.currency as any,
        period: data.period,
      });
    }

    if (success) {
      setIsFormVisible(false);
      refresh();
    }
  };

  const handleConfirmDelete = async () => {
    if (!budgetToDelete) return;
    const success = await deleteBudget({ id: budgetToDelete.id });
    if (success) {
      setBudgetToDelete(null);
      refresh();
    }
  };

  return (
    <Screen style={styles.container}>
      <View style={[styles.header, { padding: spacing.space16, backgroundColor: colors.surfacePrimary }]}>
        <Text style={[{ color: colors.textPrimary }, typography.title]}>Manage Budgets</Text>
        <View style={styles.headerActions}>
          <Button title="Clone" onPress={handleClonePrevious} disabled={isCloning} style={{ marginRight: spacing.space8 }} />
          <Button title="Add" onPress={handleAddBudget} />
        </View>
      </View>

      {fetchError ? (
        <View style={[styles.center, { padding: spacing.space16 }]}>
          <Text style={[{ color: colors.error, textAlign: 'center' }, typography.body]}>
            {fetchError}
          </Text>
          <Button title="Retry" onPress={refresh} style={{ marginTop: spacing.space16 }} />
        </View>
      ) : isFetching && budgets.length === 0 ? (
        <View style={styles.center}>
          <Loading />
        </View>
      ) : (
        <BudgetList
          budgets={budgets}
          onBudgetPress={handleEditBudget}
          onDeleteBudget={handleDeleteRequest}
          isLoading={isFetching}
        />
      )}

      <Modal
        visible={isFormVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsFormVisible(false)}
      >
        <View style={[styles.modalHeader, { padding: spacing.space16, backgroundColor: colors.surfacePrimary }]}>
          <Text style={[{ color: colors.textPrimary }, typography.title]}>
            {selectedBudget ? 'Edit Budget' : 'New Budget'}
          </Text>
        </View>

        {isCategoriesLoading ? (
          <View style={styles.center}>
            <Loading />
          </View>
        ) : (
          <BudgetForm
            initialData={selectedBudget}
            categories={categoryOptions}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormVisible(false)}
            isLoading={isCreating || isUpdating}
          />
        )}
      </Modal>

      <DeleteBudgetDialog
        visible={budgetToDelete !== null}
        budget={budgetToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={() => setBudgetToDelete(null)}
        isLoading={isDeleting}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
