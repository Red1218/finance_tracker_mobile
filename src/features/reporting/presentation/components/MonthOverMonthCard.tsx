import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../../../shared/components/Card';
import { useTheme } from '../../../../shared/theme';
import { MonthOverMonthComparison } from '../../domain';

interface Props {
  readonly comparison: MonthOverMonthComparison;
}

export const MonthOverMonthCard: React.FC<Props> = ({ comparison }) => {
  const theme = useTheme();

  const renderDeltaBadge = (
    delta: number,
    percentageChange: number | null,
    isZeroBaseline: boolean,
    isExpense: boolean = false
  ) => {
    if (isZeroBaseline && isExpense) {
      return (
        <View style={[styles.badge, { backgroundColor: theme.colors.surfaceSecondary }]}>
          <Text style={[styles.badgeText, { color: theme.colors.textSecondary }]}>New Expense</Text>
        </View>
      );
    }

    const isPositive = delta > 0;
    const isGood = isExpense ? !isPositive : isPositive;
    const badgeColor = isGood ? theme.colors.success : theme.colors.error;

    return (
      <View style={[styles.badge, { backgroundColor: theme.colors.surfaceSecondary }]}>
        <Text style={[styles.badgeText, { color: badgeColor }]}>
          {isPositive ? '+' : ''}
          {delta.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
          {percentageChange !== null ? ` (${percentageChange > 0 ? '+' : ''}${percentageChange}%)` : ''}
        </Text>
      </View>
    );
  };

  return (
    <Card
      variant="elevated"
      style={styles.card}
      accessibilityLabel={`Month over month comparison. Expense change: ${
        comparison.isZeroBaseline ? 'New Expense' : `${comparison.expenseDelta}`
      }`}
    >
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Month-over-Month Comparison</Text>

      <View style={styles.row}>
        <View>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>Income MoM</Text>
          <Text style={[styles.amount, { color: theme.colors.textPrimary }]}>
            ₹{comparison.currentIncome.toLocaleString('en-IN')}
          </Text>
        </View>
        {renderDeltaBadge(comparison.incomeDelta, comparison.incomePercentageChange, false, false)}
      </View>

      <View style={styles.row}>
        <View>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>Expenses MoM</Text>
          <Text style={[styles.amount, { color: theme.colors.textPrimary }]}>
            ₹{comparison.currentExpense.toLocaleString('en-IN')}
          </Text>
        </View>
        {renderDeltaBadge(comparison.expenseDelta, comparison.expensePercentageChange, comparison.isZeroBaseline, true)}
      </View>

      <View style={[styles.row, styles.noBorder]}>
        <View>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>Net Savings MoM</Text>
          <Text style={[styles.amount, { color: theme.colors.textPrimary }]}>
            ₹{comparison.currentNetSavings.toLocaleString('en-IN')}
          </Text>
        </View>
        {renderDeltaBadge(comparison.netSavingsDelta, comparison.netSavingsPercentageChange, false, false)}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  label: {
    fontSize: 12,
    marginBottom: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
