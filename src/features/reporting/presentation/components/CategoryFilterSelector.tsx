import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
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
  return (
    <View className="py-1 px-4">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
        {/* All Categories Option */}
        <TouchableOpacity
          onPress={() => onSelectCategory(null)}
          disabled={disabled}
          accessibilityLabel="Select All Categories filter"
          className={`mr-2 px-3 py-1.5 rounded-full border ${
            selectedCategoryId === null
              ? 'bg-blue-600 border-blue-600'
              : 'bg-gray-100 border-gray-200'
          } ${disabled ? 'opacity-50' : 'opacity-100'}`}
        >
          <Text
            className={`text-xs font-medium ${
              selectedCategoryId === null ? 'text-white font-semibold' : 'text-gray-700'
            }`}
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
              className={`mr-2 px-3 py-1.5 rounded-full border ${
                isSelected ? 'bg-blue-600 border-blue-600' : 'bg-gray-100 border-gray-200'
              } ${disabled ? 'opacity-50' : 'opacity-100'}`}
            >
              <Text
                className={`text-xs font-medium ${
                  isSelected ? 'text-white font-semibold' : 'text-gray-700'
                }`}
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
