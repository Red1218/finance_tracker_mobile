import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SectionStateContainer } from '../common/SectionStateContainer';
import { KPICardViewModel } from '../../../application/view-models/KPICardViewModel';
import { useTheme } from '../../../../../shared/theme';
import { Card } from '../../../../../shared/components/Card';
import { Icon } from '../../../../../shared/components/Icon';

interface KPICardsSectionProps {
  viewModel: KPICardViewModel;
  onRetry: () => void;
}

export function KPICardsSection({ viewModel, onRetry }: KPICardsSectionProps) {
  const { colors, typography } = useTheme();
  const content = viewModel.content;

  const netBalance = content?.totalBalance || content?.netForPeriod || '₹0.00';
  const periodIncome = content?.periodIncome || '₹0.00';
  const periodExpenses = content?.periodExpenses || '₹0.00';

  return (
    <SectionStateContainer
      status={viewModel.status}
      errorMessage={viewModel.error || undefined}
      onRetry={onRetry}
      skeletonHeight={160}
    >
      <Card variant="elevated" style={styles.cardContainer}>
        {/* Net Balance Header Section */}
        <Text
          style={[styles.label, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}
          accessibilityRole="header"
        >
          NET BALANCE
        </Text>
        <Text
          style={[styles.netBalanceValue, { color: colors.textPrimary }]}
          accessible={true}
          accessibilityLabel={`Net Balance is ${netBalance}`}
        >
          {netBalance}
        </Text>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

        {/* Sub-Metrics Row: Income & Expenses */}
        <View style={styles.metricsRow}>
          {/* Income Column */}
          <View style={styles.metricItem} accessible={true} accessibilityLabel={`Income is ${periodIncome}`}>
            <View style={styles.metricHeader}>
              <View style={[styles.iconBadge, { backgroundColor: 'rgba(22, 163, 74, 0.12)' }]}>
                <Icon name="ArrowUpRight" size="sm" color={colors.success} />
              </View>
              <Text style={[styles.metricLabel, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
                Income
              </Text>
            </View>
            <Text style={[styles.metricValue, { color: colors.textPrimary, fontSize: typography.title.fontSize }]}>
              {periodIncome}
            </Text>
          </View>

          {/* Expenses Column */}
          <View style={styles.metricItem} accessible={true} accessibilityLabel={`Expenses is ${periodExpenses}`}>
            <View style={styles.metricHeader}>
              <View style={[styles.iconBadge, { backgroundColor: 'rgba(220, 38, 38, 0.12)' }]}>
                <Icon name="ArrowDownRight" size="sm" color={colors.error} />
              </View>
              <Text style={[styles.metricLabel, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
                Expenses
              </Text>
            </View>
            <Text style={[styles.metricValue, { color: colors.textPrimary, fontSize: typography.title.fontSize }]}>
              {periodExpenses}
            </Text>
          </View>
        </View>
      </Card>
    </SectionStateContainer>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    padding: 20,
  },
  label: {
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  netBalanceValue: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricItem: {
    flex: 1,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  iconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    fontWeight: '500',
  },
  metricValue: {
    fontWeight: '700',
  },
});
