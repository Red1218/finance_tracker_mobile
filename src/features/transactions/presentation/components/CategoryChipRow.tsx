import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../../../shared/theme';

export interface CategoryChipRowCategory {
  id: string;
  name: string;
}

interface CategoryChipRowProps {
  categories: CategoryChipRowCategory[];
  selectedCategoryId: string | null;
  onSelect: (categoryId: string) => void;
  maxVisible?: number;
}

export function CategoryChipRow({ categories, selectedCategoryId, onSelect, maxVisible = 4 }: CategoryChipRowProps) {
  const { colors, radius, spacing } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const hasOverflow = categories.length > maxVisible;
  const visibleCategories = expanded || !hasOverflow ? categories : categories.slice(0, maxVisible);

  return (
    <View
      style={[styles.container, { gap: spacing.space8 }]}
      accessibilityRole="radiogroup"
      accessibilityLabel="Category"
    >
      {visibleCategories.map((category) => {
        const isSelected = category.id === selectedCategoryId;
        return (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.chip,
              {
                borderRadius: radius.pill,
                borderColor: isSelected ? colors.brandPrimary : colors.borderSubtle,
                backgroundColor: isSelected ? colors.surfaceElevated : 'transparent',
              },
            ]}
            onPress={() => onSelect(category.id)}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected }}
            accessibilityLabel={category.name}
          >
            <Text style={[styles.chipText, { color: isSelected ? colors.brandPrimary : colors.textSecondary, fontWeight: isSelected ? '700' : '500' }]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        );
      })}

      {hasOverflow && !expanded ? (
        <TouchableOpacity
          style={[styles.chip, styles.overflowChip, { borderRadius: radius.pill, borderColor: colors.borderSubtle }]}
          onPress={() => setExpanded(true)}
          accessibilityRole="button"
          accessibilityLabel={`Show all ${categories.length} categories`}
        >
          <Text style={[styles.chipText, { color: colors.textSecondary }]}>All {categories.length} ›</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overflowChip: {
    borderStyle: 'dashed',
  },
  chipText: {
    fontSize: 14,
  },
});
