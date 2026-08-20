import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SectionStateContainer } from '../common/SectionStateContainer';
import { RecentActivityViewModel, RecentActivityRow, RecentActivityData } from '../../../application/view-models/RecentActivityViewModel';
import { useTheme } from '../../../../../shared/theme';
import { Card } from '../../../../../shared/components/Card';
import { EmptyState } from '../common/EmptyState';

interface RecentActivitySectionProps {
  viewModel: RecentActivityViewModel;
  onRetry: () => void;
}

export function RecentActivitySection({ viewModel, onRetry }: RecentActivitySectionProps) {
  const { colors, typography } = useTheme();

  const rows: RecentActivityRow[] = viewModel.content
    ? Array.isArray(viewModel.content)
      ? (viewModel.content as RecentActivityRow[])
      : (viewModel.content as RecentActivityData).rows || []
    : [];

  return (
    <SectionStateContainer
      status={viewModel.status}
      errorMessage={viewModel.error || undefined}
      onRetry={onRetry}
      skeletonHeight={160}
    >
      <Card variant="elevated" style={styles.cardContainer}>
        <Text style={[styles.title, { color: colors.textPrimary, fontSize: typography.heading.fontSize }]} accessibilityRole="header">
          Recent Activity
        </Text>
        {rows.length === 0 ? (
          <EmptyState message="No recent activity transactions found." />
        ) : (
          rows.map((activity: RecentActivityRow, index: number) => {
            const isIncome = activity.direction === 'Income' || (activity as unknown as { type?: string }).type === 'INCOME';
            const description = activity.description;
            const categoryName = activity.categoryName || 'General';
            const dateText = activity.date || (activity as unknown as { formattedDate?: string }).formattedDate || 'Recent';
            const amountText = activity.amount || (activity as unknown as { formattedAmount?: string }).formattedAmount || '₹0';

            return (
              <View key={index} style={[styles.row, { borderBottomColor: colors.borderSubtle }]}>
                <View style={styles.left}>
                  <Text style={[styles.description, { color: colors.textPrimary, fontSize: typography.body.fontSize }]}>
                    {description}
                  </Text>
                  <Text style={[styles.category, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
                    {categoryName} • {dateText}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.amount,
                    {
                      color: isIncome ? colors.success : colors.textPrimary,
                      fontSize: typography.body.fontSize,
                    },
                  ]}
                >
                  {isIncome ? '+' : '-'}{amountText}
                </Text>
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
    flex: 1,
    paddingRight: 12,
  },
  description: {
    fontWeight: '600',
    marginBottom: 3,
  },
  category: {
    fontWeight: '400',
  },
  amount: {
    fontWeight: '700',
  },
});
