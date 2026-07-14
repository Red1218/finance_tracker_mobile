import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Text, Modal } from 'react-native';
import { Screen, Loading, Button } from '../../../../shared/components';
import { useTheme } from '../../../../shared/theme';
import { ExpenseItemModel, CategoryOption } from '../models';
import { ExpenseList, ExpenseForm, DeleteExpenseDialog } from '../components';
import {
  useExpenses,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
} from '../hooks';

// We need categories for the Expense form
import { useCategories } from '../../../categories/presentation/hooks';
import { CategoriesModule } from '../../../categories/composition';
const categoriesModule = new CategoriesModule();

export function ExpensesScreen() {
  const { colors, spacing, typography } = useTheme();

  // Load Categories for the form dropdown
  const { categories, isLoading: isCategoriesLoading } = useCategories(
    categoriesModule.listCategoriesUseCase
  );
  
  const categoryOptions: CategoryOption[] = useMemo(() => {
    return categories.map(cat => ({
      id: cat.id.value,
      label: cat.name.value,
    }));
  }, [categories]);

  // Expenses Hooks
  const { groupedExpenses, isLoading: isFetching, error: fetchError, refresh } = useExpenses();
  const { createExpense, isLoading: isCreating } = useCreateExpense();
  const { updateExpense, isLoading: isUpdating } = useUpdateExpense();
  const { deleteExpense, isLoading: isDeleting } = useDeleteExpense();

  // UI State
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseItemModel | undefined>(undefined);
  const [expenseToDelete, setExpenseToDelete] = useState<ExpenseItemModel | undefined>(undefined);

  const handleAddExpense = () => {
    setSelectedExpense(undefined);
    setIsFormVisible(true);
  };

  const handleEditExpense = (expense: ExpenseItemModel) => {
    setSelectedExpense(expense);
    setIsFormVisible(true);
  };

  const handleDeleteRequest = (expense: ExpenseItemModel) => {
    setExpenseToDelete(expense);
  };

  const handleFormSubmit = async (data: {
    categoryId: string;
    amount: number;
    currency: string;
    date: number;
    paymentMethod: string;
    note?: string;
    merchant?: string;
  }) => {
    let success = false;
    if (selectedExpense) {
      success = await updateExpense({
        id: selectedExpense.id,
        categoryId: data.categoryId,
        amount: data.amount,
        currency: data.currency,
        date: data.date,
        paymentMethod: data.paymentMethod as any,
        note: data.note || null,
        merchant: data.merchant || null,
      });
    } else {
      success = await createExpense({
        categoryId: data.categoryId,
        amount: data.amount,
        currency: data.currency,
        date: data.date,
        paymentMethod: data.paymentMethod as any,
        note: data.note,
        merchant: data.merchant,
      });
    }

    if (success) {
      setIsFormVisible(false);
      refresh();
    }
  };

  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;
    const success = await deleteExpense({ id: expenseToDelete.id });
    if (success) {
      setExpenseToDelete(undefined);
      refresh();
    }
  };

  return (
    <Screen style={styles.container}>
      <View style={[styles.header, { padding: spacing.space16, backgroundColor: colors.surfacePrimary }]}>
        <Text style={[{ color: colors.textPrimary }, typography.title]}>Expenses</Text>
        <Button title="Add" onPress={handleAddExpense} />
      </View>

      {fetchError ? (
        <View style={[styles.center, { padding: spacing.space16 }]}>
          <Text style={[{ color: colors.error, textAlign: 'center' }, typography.body]}>
            {fetchError}
          </Text>
          <Button title="Retry" onPress={refresh} style={{ marginTop: spacing.space16 }} />
        </View>
      ) : isFetching && groupedExpenses.length === 0 ? (
        <View style={styles.center}>
          <Loading />
        </View>
      ) : (
        <ExpenseList
          groupedExpenses={groupedExpenses}
          onSelect={handleEditExpense}
          onDeleteRequest={handleDeleteRequest}
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
            {selectedExpense ? 'Edit Expense' : 'New Expense'}
          </Text>
        </View>
        
        {isCategoriesLoading ? (
          <View style={styles.center}>
            <Loading />
          </View>
        ) : (
          <ExpenseForm
            initialData={selectedExpense}
            categories={categoryOptions}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormVisible(false)}
            isLoading={isCreating || isUpdating}
          />
        )}
      </Modal>

      <DeleteExpenseDialog
        selectedExpense={expenseToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={() => setExpenseToDelete(undefined)}
        isLoading={isDeleting}
      />
    </Screen>
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
