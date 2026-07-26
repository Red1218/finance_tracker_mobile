import React, { useState } from 'react';
import { View, Text, ActivityIndicator, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useBudgets } from '../hooks/useBudgets';
import { useCreateBudget } from '../hooks/useCreateBudget';
import { useUpdateBudget } from '../hooks/useUpdateBudget';
import { useArchiveBudget } from '../hooks/useArchiveBudget';
import { BudgetForm } from '../components/BudgetForm';
import { BudgetViewModel } from '../models/BudgetViewModel';
import { CreateBudgetFormData } from '../validation/budgetSchema';
import { BudgetsModule } from '../../composition/BudgetsModule';

const budgetsModule = new BudgetsModule();

export const BudgetsScreen: React.FC = () => {
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
        <Text className="text-red-500 font-semibold">{error}</Text>
      </View>
    );
  }

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

      <ScrollView className="flex-1 p-4">
        {budgets.length === 0 ? (
          <View className="p-6 items-center">
            <Text className="text-gray-500">No active budgets found. Tap "Add Budget" to create one.</Text>
          </View>
        ) : (
          budgets.map((b) => (
            <View key={b.id} className="bg-white p-4 rounded-xl border border-gray-200 mb-3 shadow-sm">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="font-bold text-lg text-gray-900">
                  {b.isOverall ? 'Overall Budget' : `Category Budget (${b.categoryId})`}
                </Text>
                <Text className="text-blue-600 font-semibold text-base">{b.amount} {b.currency}</Text>
              </View>

              <Text className="text-xs text-gray-500 mb-3">
                Period: {b.periodKind} ({new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()})
              </Text>

              <View className="flex-row justify-end space-x-3">
                <TouchableOpacity onPress={() => handleEditBudget(b)} className="px-3 py-1 bg-gray-100 rounded">
                  <Text className="text-xs font-semibold text-gray-700">Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleArchiveRequest(b)} className="px-3 py-1 bg-red-50 rounded">
                  <Text className="text-xs font-semibold text-red-600">Archive</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
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
            {editingBudget ? 'Edit Budget' : 'New Budget'}
          </Text>
          <TouchableOpacity onPress={() => setIsFormVisible(false)}>
            <Text className="text-blue-600 font-medium">Close</Text>
          </TouchableOpacity>
        </View>

        <BudgetForm
          initialValues={editingBudget ? {
            amount: editingBudget.amount,
            currencyCode: editingBudget.currency,
            startDate: new Date(editingBudget.startDate),
            endDate: new Date(editingBudget.endDate),
            categoryId: editingBudget.categoryId,
          } : undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormVisible(false)}
          isSubmitting={isCreating || isUpdating}
          error={editingBudget ? (updateError || undefined) : (createError || undefined)}
        />
      </Modal>

      {/* Archive Confirmation Modal */}
      <Modal visible={!!budgetToArchive} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white p-6 rounded-xl w-full max-w-sm">
            <Text className="text-lg font-bold text-gray-900 mb-2">Archive Budget?</Text>
            <Text className="text-gray-600 text-sm mb-6">
              This budget will be hidden from active budgets but remains in history.
            </Text>
            <View className="flex-row justify-end space-x-3">
              <TouchableOpacity onPress={() => setBudgetToArchive(null)} className="px-4 py-2 bg-gray-200 rounded-lg">
                <Text className="font-semibold text-gray-700">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirmArchive} disabled={isArchiving} className="px-4 py-2 bg-red-600 rounded-lg">
                <Text className="font-semibold text-white">{isArchiving ? 'Archiving...' : 'Archive'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
