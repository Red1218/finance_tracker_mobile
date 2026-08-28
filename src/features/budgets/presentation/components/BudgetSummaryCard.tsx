import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../../../shared/components';
import { useTheme } from '../../../../shared/theme';

import { BudgetCircularProgress } from './BudgetCircularProgress';
import { BudgetStatusBadge } from './BudgetStatusBadge';

export interface BudgetSummaryCardProps {
  totalBudgeted: number;
  totalSpent: number;
  totalRemaining: number;
  currencyCode?: string;
  overallHealthStatus?: string;
  periodKind?: string;
}

export function BudgetSummaryCard({
  totalBudgeted,
  totalSpent,
  totalRemaining,
  currencyCode = 'INR',
  overallHealthStatus = 'ON_TRACK',
  periodKind,
}: BudgetSummaryCardProps) {
  const { colors, typography } = useTheme();

  const percentageUsed = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  let periodTitle = 'Monthly Budget';
  if (periodKind === 'WEEKLY') {
    periodTitle = 'Weekly Budget';
  } else if (periodKind === 'YEARLY') {
    periodTitle = 'Yearly Budget';
  } else if (periodKind === 'CUSTOM') {
    periodTitle = 'Budget Summary';
  }

  const currencySymbol = currencyCode === 'INR' || currencyCode === '₹' ? '₹' : `${currencyCode} `;

  return (
    <Card style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.textPrimary, fontSize: typography.title.fontSize }]}>
          {periodTitle}
        </Text>
        <BudgetStatusBadge status={overallHealthStatus} />
      </View>

      <View style={styles.circularContainer}>
        <BudgetCircularProgress
          percentageUsed={percentageUsed}
          status={overallHealthStatus}
          size={128}
          strokeWidth={10}
        />
      </View>

      <View style={styles.promptContainer}>
        {totalRemaining >= 0 ? (
          <Text style={[styles.promptText, { color: colors.textSecondary, fontSize: typography.body.fontSize }]}>
            You have{' '}
            <Text style={{ color: colors.success, fontWeight: '700', fontVariant: ['tabular-nums'] }}>
              {currencySymbol}{totalRemaining.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </Text>{' '}
            left of {currencySymbol}{totalBudgeted.toLocaleString('en-IN', { maximumFractionDigits: 0 })} budgeted
          </Text>
        ) : (
          <Text style={[styles.promptText, { color: colors.textSecondary, fontSize: typography.body.fontSize }]}>
            You are{' '}
            <Text style={{ color: colors.error, fontWeight: '700', fontVariant: ['tabular-nums'] }}>
              {currencySymbol}{Math.abs(totalRemaining).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </Text>{' '}
            over your {currencySymbol}{totalBudgeted.toLocaleString('en-IN', { maximumFractionDigits: 0 })} budget
          </Text>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 16,
    padding: 20,
    borderRadius: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontWeight: '700',
  },
  circularContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  promptContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  promptText: {
    textAlign: 'center',
  },
});
