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
        {(!viewModel.content || viewModel.content.length === 0) ? (
          <EmptyState message="No category spending recorded for this period." />
        ) : (
          viewModel.content.map((category: CategoryBreakdownRow, index: number) => {
            const name = category.categoryName || (category as unknown as { name?: string }).name || 'Category';
            const color = (category as unknown as { colorCode?: string }).colorCode || colors.brandPrimary;
            const percentageText = `${Math.round(category.proportion * 100)}%`;

            return (
              <View key={index} style={[styles.row, { borderBottomColor: colors.borderSubtle }]}>
                <View style={styles.left}>
                  <View style={[styles.dot, { backgroundColor: color }]} />
                  <Text style={[styles.name, { color: colors.textPrimary, fontSize: typography.body.fontSize }]}>
                    {name}
                  </Text>
                </View>
                <View style={styles.right}>
                  <Text style={[styles.amount, { color: colors.textPrimary, fontSize: typography.body.fontSize }]}>
                    {category.amountSpent}
                  </Text>
                  <Text style={[styles.percentage, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
                    {percentageText}
                  </Text>
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
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  name: {
    fontWeight: '500',
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    fontWeight: '600',
  },
  percentage: {
    marginTop: 2,
  },
});
