import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SectionStateContainer } from '../common/SectionStateContainer';
import { SectionViewModel } from '../../../application/view-models/DashboardViewModel';
import { useTheme } from '../../../../../shared/theme';
import { Card } from '../../../../../shared/components/Card';
import { EmptyState } from '../common/EmptyState';

interface RecentActivitySectionProps {
  viewModel: SectionViewModel<any>;
  onRetry: () => void;
}

export function RecentActivitySection({ viewModel, onRetry }: RecentActivitySectionProps) {
  const { colors, typography } = useTheme();

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
        {(!viewModel.content || viewModel.content.length === 0) ? (
          <EmptyState message="No recent activity transactions found." />
        ) : (
          viewModel.content.map((activity: any, index: number) => {
            const isIncome = activity.type === 'INCOME' || activity.direction === 'Income';

            return (
              <View key={index} style={[styles.row, { borderBottomColor: colors.borderSubtle }]}>
                <View style={styles.left}>
                  <Text style={[styles.description, { color: colors.textPrimary, fontSize: typography.body.fontSize }]}>
                    {activity.description}
                  </Text>
                  <Text style={[styles.category, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
                    {activity.categoryName || 'General'} • {activity.formattedDate || 'Recent'}
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
                  {isIncome ? '+' : '-'}{activity.formattedAmount}
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
