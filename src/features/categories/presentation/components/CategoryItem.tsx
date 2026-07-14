import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Category } from '../../domain';
import { useTheme } from '../../../../shared/theme';

interface CategoryItemProps {
  category: Category;
  onPress: (category: Category) => void;
  onDelete?: (category: Category) => void;
  isReadonly?: boolean;
  canDelete?: boolean;
}

export function CategoryItem({ category, onPress, onDelete, isReadonly, canDelete }: CategoryItemProps) {
  const { colors, spacing, typography, radius } = useTheme();

  return (
    <Pressable 
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: colors.surfacePrimary,
          padding: spacing.space16,
          borderRadius: radius.medium,
          marginBottom: spacing.space8,
          opacity: pressed ? 0.8 : 1,
        }
      ]} 
      onPress={() => onPress(category)}
    >
      <View style={styles.content}>
        <Text style={[{ color: colors.textPrimary }, typography.body]}>
          {category.name.value}
        </Text>
        {isReadonly && (
          <Text style={[{ color: colors.textSecondary }, typography.caption]}>
            Protected
          </Text>
        )}
      </View>
      {canDelete && onDelete && (
        <Pressable 
          onPress={() => onDelete(category)} 
          style={({ pressed }) => [
            styles.deleteButton,
            { padding: spacing.space8, opacity: pressed ? 0.6 : 1 }
          ]}
        >
          <Text style={[{ color: colors.error }, typography.label]}>Delete</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
