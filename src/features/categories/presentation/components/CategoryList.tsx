import React from 'react';
import { FlatList, View } from 'react-native';
import { Category } from '../../domain';
import { CategoryItem } from './CategoryItem';
import { EmptyState } from '../../../../shared/components';
import { useTheme } from '../../../../shared/theme';

interface CategoryListProps {
  categories: Category[];
  onSelect: (category: Category) => void;
  onArchive?: (category: Category) => void;
}

export function CategoryList({ categories, onSelect, onArchive }: CategoryListProps) {
  const { spacing } = useTheme();

  if (categories.length === 0) {
    return (
      <EmptyState
        title="No Categories"
        description="Create your first category to get started."
      />
    );
  }

  return (
    <FlatList
      data={categories}
      keyExtractor={(item: any, index: number) =>
        (item?.id?.value ? item.id.value : item?.id ? String(item.id) : `category-${index}`)
      }
      renderItem={({ item }) => {
        const isSystem = item.isSystem;
        return (
          <CategoryItem
            category={item}
            onPress={onSelect}
            onArchive={onArchive}
            isReadonly={isSystem}
            canArchive={!isSystem}
          />
        );
      }}
      contentContainerStyle={{ padding: spacing.space16 }}
      ItemSeparatorComponent={() => <View style={{ height: spacing.space8 }} />}
    />
  );
}
