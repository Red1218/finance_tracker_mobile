import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { CategoryOptionItem } from '../hooks/useCategoryOptions';

interface Props {
  readonly selectedCategoryId: string | null;
  readonly categories: CategoryOptionItem[];
  readonly onSelectCategory: (categoryId: string | null) => void;
  readonly disabled?: boolean;
}

export const CategoryFilterSelector: React.FC<Props> = ({
  selectedCategoryId,
  categories,
  onSelectCategory,
  disabled = false,
}) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* All Categories Option */}
        <TouchableOpacity
          onPress={() => onSelectCategory(null)}
          disabled={disabled}
          accessibilityLabel="Select All Categories filter"
          style={[
            styles.chip,
            {
              backgroundColor: selectedCategoryId === null ? theme.colors.brandPrimary : theme.colors.surfaceElevated,
              borderColor: selectedCategoryId === null ? theme.colors.brandPrimary : theme.colors.borderSubtle,
              opacity: disabled ? 0.5 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.chipText,
              { color: selectedCategoryId === null ? theme.colors.textPrimary : theme.colors.textSecondary, fontWeight: selectedCategoryId === null ? '700' : '500' },
            ]}
          >
            All Categories
          </Text>
        </TouchableOpacity>

        {/* Individual Categories Options */}
        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              onPress={() => onSelectCategory(cat.id)}
              disabled={disabled}
              accessibilityLabel={`Filter by category ${cat.name}`}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? theme.colors.brandPrimary : theme.colors.surfaceElevated,
                  borderColor: isSelected ? theme.colors.brandPrimary : theme.colors.borderSubtle,
                  opacity: disabled ? 0.5 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: isSelected ? theme.colors.textPrimary : theme.colors.textSecondary, fontWeight: isSelected ? '700' : '500' },
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
  },
});
