import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Category, CategoryKind } from '../../domain';
import { useTheme } from '../../../../shared/theme';

interface CategoryItemProps {
  category: Category;
  onPress: (category: Category) => void;
  onArchive?: (category: Category) => void;
  isReadonly?: boolean;
  canArchive?: boolean;
}

export function CategoryItem({ category, onPress, onArchive, isReadonly, canArchive }: CategoryItemProps) {
  const { colors, spacing, typography, radius } = useTheme();

  const isIncome = category.kind === CategoryKind.Income;

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
        <View style={styles.titleRow}>
          <Text style={[{ color: colors.textPrimary }, typography.body]}>
            {category.name.value}
          </Text>
          <View style={[styles.badge, { backgroundColor: isIncome ? '#e6f4ea' : '#fce8e6', paddingHorizontal: spacing.space8, borderRadius: radius.small }]}>
            <Text style={[{ color: isIncome ? '#137333' : '#c5221f' }, typography.caption]}>
              {isIncome ? 'Income' : 'Expense'}
            </Text>
          </View>
        </View>
        {isReadonly && (
          <Text style={[{ color: colors.textSecondary, marginTop: spacing.space4 }, typography.caption]}>
            System Category
          </Text>
        )}
      </View>
      {canArchive && onArchive && (
        <Pressable
          onPress={() => onArchive(category)}
          style={({ pressed }) => [
            styles.actionButton,
            { padding: spacing.space8, opacity: pressed ? 0.6 : 1 }
          ]}
        >
          <Text style={[{ color: colors.error }, typography.label]}>Archive</Text>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingVertical: 2,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
