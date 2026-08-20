import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { Card } from '../../../../shared/components/Card';
import { useReporting } from '../hooks/useReporting';
import { reportingModule } from '../../composition/ReportingModule';
import { ReportingPeriodSelector } from '../components/ReportingPeriodSelector';
import { MonthlyTrendCard } from '../components/MonthlyTrendCard';
import { CategoryBreakdownCard } from '../components/CategoryBreakdownCard';

export const ReportingScreen: React.FC = () => {
  const theme = useTheme();
  const { selectedPeriod, viewModel, isLoading, error, changePeriod, refresh } = useReporting(
    reportingModule.reportingController
  );

  const categoryBreakdownResponse = {
    items: viewModel.categoryBreakdown.map((c) => ({
      categoryId: c.categoryId,
      categoryName: c.categoryName,
      amount: parseFloat(c.formattedAmount.replace(/[^0-9.]/g, '')) || 0,
      percentage: c.percentage,
      transactionCount: 0,
    })),
  };

  const monthlyTrendResponse = {
    comparison: undefined,
    items: viewModel.monthlyTrend.map((t) => ({
      period: t.periodLabel,
      income: parseFloat(t.formattedIncome.replace(/[^0-9.]/g, '')) || 0,
      expenses: parseFloat(t.formattedExpense.replace(/[^0-9.]/g, '')) || 0,
      netCashFlow: parseFloat(t.formattedNet.replace(/[^0-9.]/g, '')) || 0,
    })),
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.backgroundPrimary }]}>
      {/* Header & Period Selector */}
      <View style={[styles.header, { backgroundColor: theme.colors.surfaceElevated, borderBottomColor: theme.colors.borderSubtle }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Reports & Analytics</Text>
          <TouchableOpacity
            onPress={refresh}
            style={[styles.refreshButton, { backgroundColor: theme.colors.surfacePrimary, borderColor: theme.colors.borderSubtle }]}
            accessibilityLabel="Refresh report data"
          >
            <Text style={[styles.refreshText, { color: theme.colors.textSecondary }]}>Refresh</Text>
          </TouchableOpacity>
        </View>

        <ReportingPeriodSelector
          selected={selectedPeriod}
          onSelect={changePeriod}
          disabled={isLoading}
        />
      </View>

      {/* Main Content ScrollView */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {error ? (
          <View style={[styles.errorBanner, { backgroundColor: theme.colors.surfacePrimary, borderColor: theme.colors.error }]}>
            <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
          </View>
        ) : null}

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.brandPrimary} />
          </View>
        ) : (
          <>
            {/* Financial Summary Performance Card */}
            {viewModel.financialSummary && (
              <Card variant="elevated" style={styles.summaryCard}>
                <Text style={[styles.sectionHeading, { color: theme.colors.textMuted }]}>
                  Financial Performance Summary
                </Text>

                <View style={[styles.savingsBox, { backgroundColor: theme.colors.surfacePrimary, borderColor: theme.colors.borderSubtle }]}>
                  <View style={styles.savingsHeader}>
                    <Text style={[styles.savingsLabel, { color: theme.colors.textMuted }]}>Net Savings</Text>
                    <View style={[styles.savingsBadge, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.borderSubtle }]}>
                      <Text style={[styles.badgeText, { color: viewModel.financialSummary.isPositiveSavings ? theme.colors.success : theme.colors.error }]}>
                        {viewModel.financialSummary.savingsRatePercentage}% Savings Rate
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.netSavingsAmount,
                      { color: viewModel.financialSummary.isPositiveSavings ? theme.colors.success : theme.colors.error },
                    ]}
                  >
                    {viewModel.financialSummary.formattedNetSavings}
                  </Text>
                </View>

                <View style={styles.tilesRow}>
                  <View style={[styles.metricTile, { backgroundColor: theme.colors.surfacePrimary, borderColor: theme.colors.borderSubtle }]}>
                    <Text style={[styles.tileLabel, { color: theme.colors.textMuted }]}>Total Income</Text>
                    <Text style={[styles.tileAmount, { color: theme.colors.success }]}>
                      {viewModel.financialSummary.formattedIncome}
                    </Text>
                  </View>

                  <View style={[styles.metricTile, { backgroundColor: theme.colors.surfacePrimary, borderColor: theme.colors.borderSubtle }]}>
                    <Text style={[styles.tileLabel, { color: theme.colors.textMuted }]}>Total Expenses</Text>
                    <Text style={[styles.tileAmount, { color: theme.colors.error }]}>
                      {viewModel.financialSummary.formattedExpense}
                    </Text>
                  </View>
                </View>
              </Card>
            )}

            {/* Category Breakdown Card */}
            <CategoryBreakdownCard data={categoryBreakdownResponse} />

            {/* Monthly Trend Card */}
            <MonthlyTrendCard data={monthlyTrendResponse} />
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  refreshText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
  },
  errorBanner: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  summaryCard: {
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  savingsBox: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  savingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  savingsLabel: {
    fontSize: 13,
  },
  savingsBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  netSavingsAmount: {
    fontSize: 28,
    fontWeight: '800',
  },
  tilesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricTile: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  tileLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  tileAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
});
