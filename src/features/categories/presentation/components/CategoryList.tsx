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

  const getCategoryKey = (item: Category, index: number): string => {
    const rawId = item.id as unknown;
    if (typeof rawId === 'object' && rawId !== null && 'value' in rawId) {
      return String((rawId as { value: string }).value);
    }
    if (rawId) {
      return String(rawId);
    }
    return `category-${index}`;
  };

  return (
    <FlatList
      data={categories}
      keyExtractor={getCategoryKey}

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
