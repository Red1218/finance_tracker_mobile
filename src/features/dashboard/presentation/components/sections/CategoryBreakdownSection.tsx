import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SectionStateContainer } from '../common/SectionStateContainer';
import { CategoryBreakdownViewModel, CategoryBreakdownRow } from '../../../application/view-models/CategoryBreakdownViewModel';
import { useTheme } from '../../../../../shared/theme';
import { Card } from '../../../../../shared/components/Card';
import { EmptyState } from '../common/EmptyState';

interface CategoryBreakdownSectionProps {
  viewModel: CategoryBreakdownViewModel;
  onRetry: () => void;
}

export function CategoryBreakdownSection({ viewModel, onRetry }: CategoryBreakdownSectionProps) {
  const { colors, typography } = useTheme();

  const topCategories = viewModel.content ? viewModel.content.slice(0, 4) : [];

  return (
    <SectionStateContainer
      status={viewModel.status}
      errorMessage={viewModel.error || undefined}
      onRetry={onRetry}
      skeletonHeight={140}
    >
      <Card variant="elevated" style={styles.cardContainer}>
        <Text style={[styles.title, { color: colors.textPrimary, fontSize: typography.heading.fontSize }]} accessibilityRole="header">
          Top Spending Categories
        </Text>
        {topCategories.length === 0 ? (
          <EmptyState message="No category spending recorded for this period." />
        ) : (
          topCategories.map((category: CategoryBreakdownRow, index: number) => {
            const name = category.categoryName || (category as unknown as { name?: string }).name || 'Category';
            const color = (category as unknown as { colorCode?: string }).colorCode || colors.brandPrimary;
            const percentageVal = Math.round(category.proportion * 100);
            const percentageText = `${percentageVal}%`;

            return (
              <View key={index} style={styles.categoryBlock}>
                {/* Category Name, Percentage, and Amount Row */}
                <View style={styles.row}>
                  <Text style={[styles.name, { color: colors.textPrimary, fontSize: typography.body.fontSize }]}>
                    {name}
                  </Text>
                  <View style={styles.rightValues}>
                    <Text style={[styles.percentage, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
                      {percentageText}
                    </Text>
                    <Text style={[styles.amount, { color: colors.textPrimary, fontSize: typography.body.fontSize }]}>
                      {category.amountSpent}
                    </Text>
                  </View>
                </View>

                {/* Horizontal Progress Bar */}
                <View
                  style={[styles.barBackground, { backgroundColor: colors.borderSubtle }]}
                  accessible={true}
                  accessibilityRole="progressbar"
                  accessibilityLabel={`${name} spending share ${percentageText}`}
                  accessibilityValue={{ min: 0, max: 100, now: percentageVal }}
                >
                  <View
                    style={[
                      styles.barFill,
                      { width: `${percentageVal}%`, backgroundColor: color },
                    ]}
                  />
                </View>
              </View>
            );
          })
        )}
      </Card>
    </SectionStateContainer>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    padding: 16,
  },
  title: {
    fontWeight: '700',
    marginBottom: 16,
  },
  categoryBlock: {
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontWeight: '600',
  },
  rightValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  percentage: {
    fontWeight: '500',
  },
  amount: {
    fontWeight: '600',
  },
  barBackground: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
});
