import React, { useState, useMemo } from 'react';
import { View, Text, ActivityIndicator, Modal, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { AppBar, FAB } from '../../../../shared/components';
import { useBudgets } from '../hooks/useBudgets';
import { useCreateBudget } from '../hooks/useCreateBudget';
import { useUpdateBudget } from '../hooks/useUpdateBudget';
import { useArchiveBudget } from '../hooks/useArchiveBudget';
import { useCategoryOptions } from '../hooks/useCategoryOptions';
import { BudgetCard } from '../components/BudgetCard';
import { BudgetSummaryCard } from '../components/BudgetSummaryCard';
import { BudgetFormModal } from '../components/BudgetFormModal';
import { BudgetDetailSheet } from '../components/BudgetDetailSheet';
import { EmptyBudgetState } from '../components/EmptyBudgetState';
import { BudgetViewModel } from '../models/BudgetViewModel';
import { CreateBudgetFormData } from '../validation/budgetSchema';
import { BudgetsModule } from '../../composition/BudgetsModule';
import { BudgetPeriod } from '../../domain';

const budgetsModule = new BudgetsModule();

export const BudgetsScreen: React.FC = () => {
  const { colors, typography } = useTheme();
  const { budgets, isLoading, error, refresh } = useBudgets(budgetsModule.listBudgetsUseCase);
  const { createBudget, isLoading: isCreating, error: createError } = useCreateBudget(budgetsModule.createBudgetUseCase);
  const { updateBudget, isLoading: isUpdating, error: updateError } = useUpdateBudget(budgetsModule.updateBudgetUseCase);
  const { archiveBudget, isLoading: isArchiving } = useArchiveBudget(budgetsModule.archiveBudgetUseCase);
  const { categoryOptions, categories } = useCategoryOptions();

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetViewModel | null>(null);
  const [selectedDetailBudget, setSelectedDetailBudget] = useState<BudgetViewModel | null>(null);
  const [budgetToArchive, setBudgetToArchive] = useState<BudgetViewModel | null>(null);

  // Category map for fast name lookup
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((cat) => {
      map.set(cat.id, cat.name);
    });
    return map;
  }, [categories]);

  // Aggregated summary calculation across active budgets
  const { totalBudgeted, totalSpent, totalRemaining, overallHealthStatus } = useMemo(() => {
    let budgeted = 0;
    let spent = 0;
    let hasOverBudget = false;
    let hasNearLimit = false;

    budgets.forEach((b) => {
      budgeted += b.amount;
      const s = b.spentAmount ?? 0;
      spent += s;
      if (b.healthStatus === 'OVER_BUDGET') hasOverBudget = true;
      if (b.healthStatus === 'NEAR_LIMIT') hasNearLimit = true;
    });

    const remaining = budgeted - spent;
    let health = 'ON_TRACK';
    if (hasOverBudget) health = 'OVER_BUDGET';
    else if (hasNearLimit) health = 'NEAR_LIMIT';

    return {
      totalBudgeted: budgeted,
      totalSpent: spent,
      totalRemaining: remaining,
      overallHealthStatus: health,
    };
  }, [budgets]);

  const handleAddBudget = () => {
    setEditingBudget(null);
    setIsFormVisible(true);
  };

  const handleEditBudget = (budget: BudgetViewModel) => {
    setSelectedDetailBudget(null);
    setEditingBudget(budget);
    setIsFormVisible(true);
  };

  const handleArchiveRequest = (budget: BudgetViewModel) => {
    setSelectedDetailBudget(null);
    setBudgetToArchive(budget);
  };

  const handleCardPress = (budget: BudgetViewModel) => {
    setSelectedDetailBudget(budget);
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
          <Text style={[styles.errorText, { color: colors.error, fontSize: typography.caption.fontSize }]}>
            {error}
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {budgets.length > 0 && (
          <BudgetSummaryCard
            totalBudgeted={totalBudgeted}
            totalSpent={totalSpent}
            totalRemaining={totalRemaining}
            overallHealthStatus={overallHealthStatus}
          />
        )}

        {budgets.length === 0 ? (
          <EmptyBudgetState />
        ) : (
          budgets.map((b) => {
            const catName = b.isOverall
              ? 'Overall Budget'
              : (b.categoryId ? categoryMap.get(b.categoryId) || 'Category' : 'Category');

            const summary = {
              budget: {
                id: b.id,
                categoryId: b.categoryId,
                amount: b.amount,
                currency: b.currency,
                period: b.periodKind as unknown as BudgetPeriod,
                startDate: new Date(b.startDate),
                endDate: new Date(b.endDate),
              },
              spentAmount: b.spentAmount ?? 0,
              remainingAmount: b.remainingAmount ?? (b.amount - (b.spentAmount ?? 0)),
              percentageUsed: b.percentageUsed ?? (b.amount > 0 ? ((b.spentAmount ?? 0) / b.amount) * 100 : 0),
              status: (b.healthStatus === 'NEAR_LIMIT'
                ? 'AtRisk'
                : b.healthStatus === 'OVER_BUDGET'
                ? 'Overbudget'
                : 'OnTrack') as 'OnTrack' | 'AtRisk' | 'Overbudget',
            };

            return (
              <BudgetCard
                key={b.id}
                summary={summary}
                categoryName={catName}
                onPress={() => handleCardPress(b)}
                onEdit={() => handleEditBudget(b)}
                onDelete={() => handleArchiveRequest(b)}
              />
            );
          })
        )}
      </ScrollView>

      <FAB iconName="Plus" onPress={handleAddBudget} accessibilityLabel="Add Budget" />

      {/* Form Modal (Create / Edit) */}
      <BudgetFormModal
        visible={isFormVisible}
        isEditMode={!!editingBudget}
        editingBudget={editingBudget}
        categories={categoryOptions.map((c) => ({ id: c.id, label: c.name }))}
        isSubmitting={isCreating || isUpdating}
        error={editingBudget ? updateError || undefined : createError || undefined}
        onSubmit={handleFormSubmit}
        onClose={() => {
          setIsFormVisible(false);
          setEditingBudget(null);
        }}
      />

      {/* Detail Bottom Sheet */}
      <BudgetDetailSheet
        visible={!!selectedDetailBudget}
        budget={selectedDetailBudget}
        categoryName={
          selectedDetailBudget
            ? selectedDetailBudget.isOverall
              ? 'Overall Budget'
              : (selectedDetailBudget.categoryId ? categoryMap.get(selectedDetailBudget.categoryId) || 'Category' : 'Category')
            : undefined
        }
        onClose={() => setSelectedDetailBudget(null)}
        onEdit={handleEditBudget}
        onArchive={handleArchiveRequest}
      />

      {/* Archive Confirmation Dialog Modal */}
      <Modal visible={!!budgetToArchive} transparent animationType="fade">
        <View style={styles.dialogBackdrop}>
          <View style={[styles.dialogCard, { backgroundColor: colors.surfacePrimary, borderColor: colors.borderSubtle }]}>
            <Text style={[styles.dialogTitle, { color: colors.textPrimary, fontSize: typography.title.fontSize }]}>
              Archive Budget?
            </Text>
            <Text style={[styles.dialogMessage, { color: colors.textSecondary, fontSize: typography.body.fontSize }]}>
              This budget will be hidden from active budgets but remains in historical reporting.
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
