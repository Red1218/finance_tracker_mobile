import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Text, Modal, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Screen, Loading, Button } from '../../../../shared/components';
import { useTheme } from '../../../../shared/theme';
import { ExpenseItemModel, CategoryOption } from '../models';
import { ExpenseList, ExpenseForm, DeleteExpenseDialog } from '../components';
import {
  useExpenses,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
  useRestoreExpense,
} from '../hooks';
import { ExpenseVisibility } from '../../application/repositories/ExpenseFilter';

// We need categories for the Expense form
import { useCategories } from '../../../categories/presentation/hooks';
import { CategoriesModule } from '../../../categories/composition';
const categoriesModule = new CategoriesModule();

export function ExpensesScreen() {
  const { colors, spacing, typography } = useTheme();

  // Load Categories (including archived for display purposes in forms/lists)
  const { categories, isLoading: isCategoriesLoading } = useCategories(
    categoriesModule.listCategoriesUseCase,
    true
  );
  
  const categoryOptions: CategoryOption[] = useMemo(() => {
    return categories.map(cat => ({
      id: cat.id.value,
      label: cat.name.value,
      isArchived: cat.isArchived,
    }));
  }, [categories]);

  // UI State for Filters
  const [visibility, setVisibility] = useState<ExpenseVisibility>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  
  // Date Filter State
  type DateFilter = 'all' | 'this_month' | 'last_month';
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  
  const dateRange = useMemo(() => {
    if (dateFilter === 'all') return { startDate: undefined, endDate: undefined };
    const now = new Date();
    if (dateFilter === 'this_month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      return { startDate: start, endDate: undefined };
    }
    if (dateFilter === 'last_month') {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999).getTime();
      return { startDate: start, endDate: end };
    }
    return { startDate: undefined, endDate: undefined };
  }, [dateFilter]);

  // Expenses Hooks
  const { groupedExpenses, isLoading: isFetching, error: fetchError, refresh } = useExpenses(
    { 
      visibility, 
      categoryId: selectedCategoryId, 
      startDate: dateRange.startDate, 
      endDate: dateRange.endDate 
    },
    categories,
    searchQuery
  );
  const { createExpense, isLoading: isCreating } = useCreateExpense();
  const { updateExpense, isLoading: isUpdating } = useUpdateExpense();
  const { deleteExpense, isLoading: isDeleting } = useDeleteExpense();
  const { restoreExpense } = useRestoreExpense();

  // UI State for Forms/Dialogs
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

  const handleRestoreRequest = async (expense: ExpenseItemModel) => {
    const success = await restoreExpense({ id: expense.id });
    if (success) {
      refresh();
    }
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

      <View style={{ padding: spacing.space16, backgroundColor: colors.surfacePrimary, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        {/* Visibility Toggle */}
        <View style={{ flexDirection: 'row', marginBottom: spacing.space12 }}>
          <Button 
            title="Active" 
            onPress={() => setVisibility('active')} 
            style={{ flex: 1, marginRight: 8, backgroundColor: visibility === 'active' ? colors.brandPrimary : colors.surfaceSecondary }} 
          />
          <Button 
            title="Deleted" 
            onPress={() => setVisibility('deleted')} 
            style={{ flex: 1, backgroundColor: visibility === 'deleted' ? colors.brandPrimary : colors.surfaceSecondary }} 
          />
        </View>

        {/* Search */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.backgroundPrimary, borderRadius: 8, paddingHorizontal: 12, marginBottom: spacing.space12 }}>
          <Text style={{ marginRight: 8 }}>🔍</Text>
          <TextInput
            style={{ flex: 1, paddingVertical: 12, color: colors.textPrimary }}
            placeholder="Search merchants, notes, categories..."
            placeholderTextColor={colors.disabled}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={{ color: colors.textSecondary }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Date Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', marginBottom: spacing.space12 }}>
          <Button
            title="All Time"
            onPress={() => setDateFilter('all')}
            style={{ marginRight: 8, paddingVertical: 6, backgroundColor: dateFilter === 'all' ? colors.brandPrimary : colors.surfaceSecondary }}
          />
          <Button
            title="This Month"
            onPress={() => setDateFilter('this_month')}
            style={{ marginRight: 8, paddingVertical: 6, backgroundColor: dateFilter === 'this_month' ? colors.brandPrimary : colors.surfaceSecondary }}
          />
          <Button
            title="Last Month"
            onPress={() => setDateFilter('last_month')}
            style={{ marginRight: 8, paddingVertical: 6, backgroundColor: dateFilter === 'last_month' ? colors.brandPrimary : colors.surfaceSecondary }}
          />
        </ScrollView>

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
          <Button
            title="All Categories"
            onPress={() => setSelectedCategoryId(undefined)}
            style={{ marginRight: 8, paddingVertical: 6, backgroundColor: selectedCategoryId === undefined ? colors.brandPrimary : colors.surfaceSecondary }}
          />
          {categoryOptions.filter(c => !c.isArchived).map(cat => (
            <Button
              key={cat.id}
              title={cat.label}
              onPress={() => setSelectedCategoryId(cat.id)}
              style={{ marginRight: 8, paddingVertical: 6, backgroundColor: selectedCategoryId === cat.id ? colors.brandPrimary : colors.surfaceSecondary }}
            />
          ))}
        </ScrollView>
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
          onRestoreRequest={handleRestoreRequest}
          isLoading={isFetching}
          filterState={{ visibility, searchQuery, categoryId: selectedCategoryId }}
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
