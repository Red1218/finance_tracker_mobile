import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { Category, CategoryType } from '../../domain';
import { CategoryItem } from './CategoryItem';
import { EmptyState } from '../../../../shared/components';
import { useTheme } from '../../../../shared/theme';

interface CategoryListProps {
  categories: Category[];
  onSelect: (category: Category) => void;
  onDelete?: (category: Category) => void;
}

export function CategoryList({ categories, onSelect, onDelete }: CategoryListProps) {
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
      keyExtractor={(item) => item.id.value}
      renderItem={({ item }) => {
        const isProtected = item.type === CategoryType.Protected;
        return (
          <CategoryItem 
            category={item} 
            onPress={onSelect} 
            onDelete={onDelete}
            isReadonly={isProtected}
            canDelete={!isProtected}
          />
        );
      }}
      contentContainerStyle={{ padding: spacing.space16 }}
      ItemSeparatorComponent={() => <View style={{ height: spacing.space8 }} />}
    />
  );
}
