import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { Category, CategoryKind } from '../../../categories/domain';
import { DefaultsViewModel } from '../models/PreferencesViewModel';

interface DefaultsSectionProps {
  viewModel: DefaultsViewModel;
  categories: Category[];
  onSelectDefaultExpenseCategory: (categoryId: string | null) => void;
  onSelectDefaultIncomeCategory: (categoryId: string | null) => void;
  disabled?: boolean;
}

export function DefaultsSection({
  viewModel,
  categories,
  onSelectDefaultExpenseCategory,
  onSelectDefaultIncomeCategory,
  disabled,
}: DefaultsSectionProps) {
  const { colors, spacing, typography, radius } = useTheme();

  const expenseCategories = categories.filter((c) => c.kind === CategoryKind.Expense && !c.isArchived);
  const incomeCategories = categories.filter((c) => c.kind === CategoryKind.Income && !c.isArchived);

  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.surfacePrimary, borderRadius: radius.medium, padding: spacing.space16, marginBottom: spacing.space16 }]}>
      <Text style={[{ color: colors.textPrimary, marginBottom: spacing.space16 }, typography.title]}>
        Defaults
      </Text>

      {/* Default Expense Category Selector */}
      <Text style={[{ color: colors.textSecondary, marginBottom: spacing.space8 }, typography.label]}>
        Default Expense Category
      </Text>

      <View style={styles.chipRow}>
        <Pressable
          style={[
            styles.chip,
            {
              backgroundColor: viewModel.defaultExpenseCategoryId === null ? colors.brandPrimary : colors.backgroundPrimary,
              borderRadius: radius.small,
              paddingHorizontal: spacing.space12,
              paddingVertical: spacing.space8,
            },
          ]}
          onPress={() => onSelectDefaultExpenseCategory(null)}
          disabled={disabled}
        >
          <Text style={[typography.caption, { color: viewModel.defaultExpenseCategoryId === null ? '#fff' : colors.textPrimary }]}>
            None
          </Text>
        </Pressable>

        {expenseCategories.map((cat) => {
          const isSelected = viewModel.defaultExpenseCategoryId === cat.id.value;
          return (
            <Pressable
              key={cat.id.value}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? colors.brandPrimary : colors.backgroundPrimary,
                  borderRadius: radius.small,
                  paddingHorizontal: spacing.space12,
                  paddingVertical: spacing.space8,
                },
              ]}
              onPress={() => onSelectDefaultExpenseCategory(cat.id.value)}
              disabled={disabled}
            >
              <Text style={[typography.caption, { color: isSelected ? '#fff' : colors.textPrimary }]}>
                {cat.name.value}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ height: spacing.space16 }} />

      {/* Default Income Category Selector */}
      <Text style={[{ color: colors.textSecondary, marginBottom: spacing.space8 }, typography.label]}>
        Default Income Category
      </Text>

      <View style={styles.chipRow}>
        <Pressable
          style={[
            styles.chip,
            {
              backgroundColor: viewModel.defaultIncomeCategoryId === null ? colors.brandPrimary : colors.backgroundPrimary,
              borderRadius: radius.small,
              paddingHorizontal: spacing.space12,
              paddingVertical: spacing.space8,
            },
          ]}
          onPress={() => onSelectDefaultIncomeCategory(null)}
          disabled={disabled}
        >
          <Text style={[typography.caption, { color: viewModel.defaultIncomeCategoryId === null ? '#fff' : colors.textPrimary }]}>
            None
          </Text>
        </Pressable>

        {incomeCategories.map((cat) => {
          const isSelected = viewModel.defaultIncomeCategoryId === cat.id.value;
          return (
            <Pressable
              key={cat.id.value}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? colors.brandPrimary : colors.backgroundPrimary,
                  borderRadius: radius.small,
                  paddingHorizontal: spacing.space12,
                  paddingVertical: spacing.space8,
                },
              ]}
              onPress={() => onSelectDefaultIncomeCategory(cat.id.value)}
              disabled={disabled}
            >
              <Text style={[typography.caption, { color: isSelected ? '#fff' : colors.textPrimary }]}>
                {cat.name.value}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: {},
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 4,
  },
});
