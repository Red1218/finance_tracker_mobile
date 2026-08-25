import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { Card } from '../../../../shared/components/Card';
import { useReporting } from '../hooks/useReporting';
import { reportingModule } from '../../composition/ReportingModule';
import { ReportingPeriodSelector } from '../components/ReportingPeriodSelector';
import { MonthlyTrendCard } from '../components/MonthlyTrendCard';
import { CategoryBreakdownCard } from '../components/CategoryBreakdownCard';
import { AnalyticsSegmentedControl, AnalyticsSegment } from '../components/AnalyticsSegmentedControl';
import { MonthOverMonthCard } from '../components/MonthOverMonthCard';
import { CashFlowForecastCard } from '../components/CashFlowForecastCard';
import { AIInsightCard } from '../components/AIInsightCard';
import { ExportModal } from '../components/ExportModal';
import { AnalyticsSkeleton } from '../components/AnalyticsSkeleton';
import { MonthOverMonthComparison, ExportReportRequest } from '../../domain';
import { CashFlowForecast } from '../../../insights/domain';

export const ReportingScreen: React.FC = () => {
  const theme = useTheme();
  const { selectedPeriod, viewModel, isLoading, error, changePeriod, refresh } = useReporting(
    reportingModule.reportingController
  );

  const [activeSegment, setActiveSegment] = useState<AnalyticsSegment>('reports');
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Mock domain projections for UI integration display
  const momComparison = new MonthOverMonthComparison({
    currentIncome: 10000,
    currentExpense: 6000,
    currentNetSavings: 4000,
    previousIncome: 8000,
    previousExpense: 5000,
    previousNetSavings: 3000,
  });

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

  const handleGenerateExport = async (req: ExportReportRequest) => {
    setIsExporting(true);
    setExportError(null);

    try {
      const res = await reportingModule.exportReportUseCase.execute(req);
      setIsExporting(false);

      if (res.success) {
        setExportModalVisible(false);
      } else {
        setExportError(res.error.message);
      }
    } catch (err) {
      setIsExporting(false);
      setExportError((err as Error).message);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.backgroundPrimary }]}>
      {/* Top Bar Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surfaceElevated, borderBottomColor: theme.colors.borderSubtle }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Analytics & Reporting</Text>

          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => setExportModalVisible(true)}
              style={[styles.actionButton, { backgroundColor: theme.colors.surfacePrimary, borderColor: theme.colors.borderSubtle }]}
              accessibilityLabel="Export Report"
            >
              <Text style={[styles.actionText, { color: theme.colors.brandPrimary }]}>Export</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={refresh}
              style={[styles.actionButton, { backgroundColor: theme.colors.surfacePrimary, borderColor: theme.colors.borderSubtle }]}
              accessibilityLabel="Refresh report data"
            >
              <Text style={[styles.actionText, { color: theme.colors.textSecondary }]}>Refresh</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Segmented Switcher */}
        <AnalyticsSegmentedControl
          activeSegment={activeSegment}
          onSegmentChange={setActiveSegment}
          disabled={isLoading}
        />

        {/* Period Selector */}
        {activeSegment === 'reports' && (
          <ReportingPeriodSelector
            selected={selectedPeriod}
            onSelect={changePeriod}
            disabled={isLoading}
          />
        )}
      </View>

      {/* Main Content ScrollView */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {error ? (
          <View style={[styles.errorBanner, { backgroundColor: theme.colors.surfacePrimary, borderColor: theme.colors.error }]}>
            <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
          </View>
        ) : null}

        {isLoading ? (
          <>
            <AnalyticsSkeleton variant="hero" />
            <AnalyticsSkeleton variant="card" />
            <AnalyticsSkeleton variant="chart" />
          </>
        ) : activeSegment === 'reports' ? (
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

            {/* Month-over-Month Comparison Card */}
            <MonthOverMonthCard comparison={momComparison} />

            {/* Category Breakdown Card */}
            <CategoryBreakdownCard data={categoryBreakdownResponse} />

            {/* Monthly Trend Card */}
            <MonthlyTrendCard data={monthlyTrendResponse} />
          </>
        ) : (
          /* AI Insights & Forecast Segment */
          <>
            <CashFlowForecastCard forecast={null} />
          </>
        )}
      </ScrollView>

      {/* Export Modal */}
      <ExportModal
        visible={exportModalVisible}
        selectedPeriodLabel={selectedPeriod.toString()}
        isGenerating={isExporting}
        error={exportError}
        onClose={() => setExportModalVisible(false)}
        onGenerateExport={handleGenerateExport}
      />
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
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: 'center',
  },
  actionText: {
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
    fontVariant: ['tabular-nums'],
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
    fontVariant: ['tabular-nums'],
  },
});
