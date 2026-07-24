import React, { useState, useMemo } from 'react';
import { View, Text, ActivityIndicator, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { toast } from '@/hooks/use-toast';
import { useBudgets } from '../hooks/useBudgets';
import { useCreateBudget } from '../hooks/useCreateBudget';
import { useUpdateBudget } from '../hooks/useUpdateBudget';
import { useDeleteBudget } from '../hooks/useDeleteBudget';
import { useCategoryOptions } from '../hooks/useCategoryOptions';
import { EmptyBudgetState } from '../components/EmptyBudgetState';
import { CategoryBudgetList } from '../components/CategoryBudgetList';
import { BudgetSummaryLoader } from '../components/BudgetSummaryLoader';
import { DeleteBudgetDialog } from '../components/DeleteBudgetDialog';
import { BudgetForm } from '../components/BudgetForm';
import { BudgetSummaryViewModel } from '../types/BudgetViewModel';
import { CreateBudgetFormData } from '../validation/budgetSchema';
import { budgetsModule } from '../hooks/module';

export const BudgetsScreen: React.FC = () => {
  const { budgets, isLoading, error, refresh } = useBudgets(budgetsModule.listBudgetsUseCase);
  const { createBudget, isLoading: isCreating, error: createError } = useCreateBudget();
  const { updateBudget, isLoading: isUpdating, error: updateError } = useUpdateBudget();
  const { deleteBudget, isLoading: isDeleting, error: deleteError } = useDeleteBudget();
  const { categoryOptions } = useCategoryOptions();

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<BudgetSummaryViewModel | null>(null);
  const [editingBudgetSummary, setEditingBudgetSummary] = useState<BudgetSummaryViewModel | null>(null);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const categoryMap = useMemo(() => {
    return new Map(categoryOptions.map(c => [c.id, c.name]));
  }, [categoryOptions]);

  const formCategories = useMemo(() => {
    return categoryOptions.map(c => ({ id: c.id, label: c.name }));
  }, [categoryOptions]);

  const handleAddBudget = () => {
    setEditingBudgetSummary(null);
    setIsFormVisible(true);
  };

  const handleEditBudget = (summary: BudgetSummaryViewModel) => {
    setEditingBudgetSummary(summary);
    setIsFormVisible(true);
  };

  const handleDeleteRequest = (summary: BudgetSummaryViewModel) => {
    setSelectedBudget(summary);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (formData: CreateBudgetFormData) => {
    let success = false;

    if (editingBudgetSummary) {
      success = await updateBudget({
        id: editingBudgetSummary.budget.id,
        amount: formData.amount,
      });

      if (success) {
        toast({
          title: 'Budget updated',
          description: 'The budget has been updated successfully.',
        });
      }
      success = await createBudget({
        categoryId: formData.categoryId ?? null,
        amount: formData.amount,
        currencyCode: formData.currencyCode,
        period: formData.period,
        startDate: formData.startDate,
        endDate: formData.endDate,
      });

      if (success) {
        toast({
          title: 'Budget created',
          description: 'The budget has been created successfully.',
        });
      }
    }

    if (success) {
      setIsFormVisible(false);
      setEditingBudgetSummary(null);
      refresh();
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedBudget) return;

    const success = await deleteBudget({ id: selectedBudget.budget.id });

    if (success) {
      toast({
        title: 'Budget deleted',
        description: 'The budget has been deleted successfully.',
      });
      setDeleteDialogOpen(false);
      setSelectedBudget(null);
      refresh();
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-red-500 font-semibold">Failed to load budgets. Please try again.</Text>
      </View>
    );
  }

  const overallBudget = budgets?.find(b => !b.categoryId);
  const categoryBudgets = budgets?.filter(b => b.categoryId) || [];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header with Add Budget button */}
      <View className="flex-row justify-between items-center p-4 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Budgets</Text>
        <TouchableOpacity
          onPress={handleAddBudget}
          className="bg-blue-600 px-4 py-2 rounded-lg"
          accessibilityLabel="Add Budget"
        >
          <Text className="text-white font-semibold text-sm">Add Budget</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {overallBudget && (
          <View className="p-4">
            <BudgetSummaryLoader 
              budgetId={overallBudget.id} 
              onEdit={handleEditBudget}
              onDelete={handleDeleteRequest}
            />
          </View>
        )}

        {budgets.length === 0 ? (
          <EmptyBudgetState />
        ) : (
          <CategoryBudgetList 
            budgets={categoryBudgets} 
            categoryMap={categoryMap}
            onBudgetPress={(b) => setSelectedBudget(b)} 
            onEditBudget={handleEditBudget}
            onDeleteBudget={handleDeleteRequest}
          />
        )}
      </ScrollView>

      {/* Form Modal for Create / Edit */}
      <Modal
        visible={isFormVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsFormVisible(false)}
      >
        <View className="flex-row justify-between items-center p-4 border-b border-gray-200 bg-white">
          <Text className="text-lg font-bold text-gray-900">
            {editingBudgetSummary ? 'Edit Budget' : 'New Budget'}
          </Text>
          <TouchableOpacity onPress={() => setIsFormVisible(false)}>
            <Text className="text-blue-600 font-medium">Close</Text>
          </TouchableOpacity>
        </View>

        <BudgetForm
          initialValues={editingBudgetSummary ? {
            amount: editingBudgetSummary.budget.amount,
            currencyCode: editingBudgetSummary.budget.currency,
            period: editingBudgetSummary.budget.period,
            startDate: new Date(editingBudgetSummary.budget.startDate),
            endDate: new Date(editingBudgetSummary.budget.endDate),
            categoryId: editingBudgetSummary.budget.categoryId,
          } : undefined}
          categories={formCategories}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormVisible(false)}
          isSubmitting={isCreating || isUpdating}
          error={editingBudgetSummary ? (updateError || undefined) : (createError || undefined)}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <DeleteBudgetDialog 
        visible={isDeleteDialogOpen}
        onCancel={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </View>
  );
};

