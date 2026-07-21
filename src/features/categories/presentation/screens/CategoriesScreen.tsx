import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Text, Modal } from 'react-native';
import { Screen, Loading, Button } from '../../../../shared/components';
import { useTheme } from '../../../../shared/theme';
import { CategoriesModule } from '../../composition';
import { Category, CategoryType } from '../../domain';
import { CategoryList, CategoryForm, ArchiveCategoryDialog } from '../components';
import {
  useCategories,
  useCreateCategory,
  useRenameCategory,
  useArchiveCategory,
} from '../hooks';

const categoriesModule = new CategoriesModule();

export function CategoriesScreen() {
  const { colors, spacing, typography } = useTheme();

  const { categories, isLoading: isFetching, error: fetchError, refresh } = useCategories(
    categoriesModule.listCategoriesUseCase
  );

  const { createCategory, isLoading: isCreating } = useCreateCategory(
    categoriesModule.createCategoryUseCase
  );

  const { renameCategory, isLoading: isRenaming } = useRenameCategory(
    categoriesModule.renameCategoryUseCase
  );

  const { archiveCategory, isLoading: isArchiving } = useArchiveCategory(
    categoriesModule.archiveCategoryUseCase
  );

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryToArchive, setCategoryToArchive] = useState<Category | null>(null);

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setIsFormVisible(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsFormVisible(true);
  };

  const handleArchiveRequest = (category: Category) => {
    setCategoryToArchive(category);
  };

  const handleFormSubmit = async (data: { name: string; type: CategoryType }) => {
    let success = false;
    if (selectedCategory) {
      success = await renameCategory({ id: selectedCategory.id.value, newName: data.name });
    } else {
      success = await createCategory({ name: data.name, type: data.type });
    }

    if (success) {
      setIsFormVisible(false);
      refresh();
    }
  };

  const handleConfirmArchive = async () => {
    if (!categoryToArchive) return;
    const success = await archiveCategory({ id: categoryToArchive.id.value });
    if (success) {
      setCategoryToArchive(null);
      refresh();
    }
  };

  const isSelectedCategoryProtected = selectedCategory?.type === CategoryType.Protected;

  return (
    <Screen style={styles.container}>
      <View style={[styles.header, { padding: spacing.space16, backgroundColor: colors.surfacePrimary }]}>
        <Text style={[{ color: colors.textPrimary }, typography.title]}>Categories</Text>
        <Button title="Add" onPress={handleAddCategory} />
      </View>

      {fetchError ? (
        <View style={[styles.center, { padding: spacing.space16 }]}>
          <Text style={[{ color: colors.error, textAlign: 'center' }, typography.body]}>
            {fetchError}
          </Text>
          <Button title="Retry" onPress={refresh} style={{ marginTop: spacing.space16 }} />
        </View>
      ) : isFetching && categories.length === 0 ? (
        <View style={styles.center}>
          <Loading />
        </View>
      ) : (
        <CategoryList
          categories={categories}
          onSelect={handleEditCategory}
          onArchive={handleArchiveRequest}
        />
      )}

      <Modal visible={isFormVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <CategoryForm
            initialName={selectedCategory?.name.value}
            initialType={selectedCategory?.type}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormVisible(false)}
            isLoading={isCreating || isRenaming}
            disabled={isSelectedCategoryProtected}
            error={isSelectedCategoryProtected ? "Protected categories cannot be modified." : undefined}
          />
        </View>
      </Modal>

      <Modal visible={!!categoryToArchive} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          {categoryToArchive && (
            <ArchiveCategoryDialog
              categoryName={categoryToArchive.name.value}
              onConfirm={handleConfirmArchive}
              onCancel={() => setCategoryToArchive(null)}
              isLoading={isArchiving}
            />
          )}
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 16,
  },
});
