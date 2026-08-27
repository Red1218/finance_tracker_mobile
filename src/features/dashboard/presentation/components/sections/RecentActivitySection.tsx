import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SectionStateContainer } from '../common/SectionStateContainer';
import { RecentActivityViewModel, RecentActivityRow, RecentActivityData } from '../../../application/view-models/RecentActivityViewModel';
import { useTheme } from '../../../../../shared/theme';
import { Card } from '../../../../../shared/components/Card';
import { Icon } from '../../../../../shared/components/Icon';
import { EmptyState } from '../common/EmptyState';

interface RecentActivitySectionProps {
  viewModel: RecentActivityViewModel;
  onRetry: () => void;
  onSeeAll?: () => void;
}

export function RecentActivitySection({ viewModel, onRetry, onSeeAll }: RecentActivitySectionProps) {
  const { colors, typography } = useTheme();
  let router: ReturnType<typeof useRouter> | null = null;
  try {
    router = useRouter();
  } catch {
    router = null;
  }

  const allRows: RecentActivityRow[] = viewModel.content
    ? Array.isArray(viewModel.content)
      ? (viewModel.content as RecentActivityRow[])
      : (viewModel.content as RecentActivityData).rows || []
    : [];

  const rows = allRows.slice(0, 3);

  const handleSeeAllPress = () => {
    if (onSeeAll) {
      onSeeAll();
    } else if (router) {
      router.push('/spends');
    }
  };

  return (
    <SectionStateContainer
      status={viewModel.status}
      errorMessage={viewModel.error || undefined}
      onRetry={onRetry}
      skeletonHeight={160}
    >
      <Card variant="elevated" style={styles.cardContainer}>
        {/* Header Row: Title & See All Action */}
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.textPrimary, fontSize: typography.heading.fontSize }]} accessibilityRole="header">
            Recent Activity
          </Text>
          <Pressable
            onPress={handleSeeAllPress}
            style={({ pressed }) => [styles.seeAllButton, pressed && styles.pressed]}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="See all transactions"
          >
            <Text style={[styles.seeAllText, { color: colors.brandPrimary, fontSize: typography.label.fontSize }]}>
              See All
            </Text>
          </Pressable>
        </View>

        {rows.length === 0 ? (
          <EmptyState message="No recent activity transactions found." />
        ) : (
          rows.map((activity: RecentActivityRow, index: number) => {
            const isIncome = activity.direction === 'Income' || (activity as unknown as { type?: string }).type === 'INCOME';
            const description = activity.description;
            const categoryName = activity.categoryName || 'General';
            const dateText = activity.date || (activity as unknown as { formattedDate?: string }).formattedDate || 'Recent';
            const amountText = activity.amount || (activity as unknown as { formattedAmount?: string }).formattedAmount || '₹0';
            const iconName = isIncome ? 'ArrowUpRight' : 'Receipt';

            return (
              <View
                key={index}
                style={[
                  styles.row,
                  index < rows.length - 1 && { borderBottomColor: colors.borderSubtle, borderBottomWidth: 1 },
                ]}
              >
                {/* Left: Icon Badge & Description Details */}
                <View style={styles.leftGroup}>
                  <View style={[styles.iconBadge, { backgroundColor: colors.surfaceElevated }]}>
                    <Icon
                      name={iconName}
                      size="sm"
                      color={isIncome ? colors.success : colors.brandPrimary}
                    />
                  </View>
                  <View style={styles.textGroup}>
                    <Text style={[styles.description, { color: colors.textPrimary, fontSize: typography.body.fontSize }]}>
                      {description}
                    </Text>
                    <Text style={[styles.category, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
                      {dateText} · {categoryName}
                    </Text>
                  </View>
                </View>

                {/* Right: Formatted Amount */}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontWeight: '700',
  },
  seeAllButton: {
    minHeight: 44,
    minWidth: 60,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
  },
  seeAllText: {
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    minHeight: 52,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textGroup: {
    flex: 1,
  },
  description: {
    fontWeight: '600',
    marginBottom: 2,
  },
  category: {
    fontWeight: '400',
  },
  amount: {
    fontWeight: '700',
  },
});
