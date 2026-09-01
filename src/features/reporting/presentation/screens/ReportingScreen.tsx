import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { useReporting } from '../hooks/useReporting';
import { reportingModule } from '../../composition/ReportingModule';
import { ReportingPeriodSelector } from '../components/ReportingPeriodSelector';
import { MonthlyTrendCard } from '../components/MonthlyTrendCard';
import { AnalyticsSegmentedControl, AnalyticsSegment } from '../components/AnalyticsSegmentedControl';
import { MonthOverMonthCard } from '../components/MonthOverMonthCard';
import { CashFlowForecastCard } from '../components/CashFlowForecastCard';
import { ExportModal } from '../components/ExportModal';
import { AnalyticsSkeleton } from '../components/AnalyticsSkeleton';
import { MonthOverMonthComparison, ExportReportRequest, ReportingPeriod } from '../../domain';

const PERIOD_LABELS: Record<ReportingPeriod, string> = {
  [ReportingPeriod.TODAY]: 'Today',
  [ReportingPeriod.WEEK]: 'This Week',
  [ReportingPeriod.MONTH]: 'This Month',
  [ReportingPeriod.QUARTER]: 'This Quarter',
  [ReportingPeriod.YEAR]: 'This Year',
  [ReportingPeriod.CUSTOM]: 'Custom Range',
};

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

  const periodLabel = PERIOD_LABELS[selectedPeriod] ?? String(selectedPeriod);

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.backgroundPrimary }]}>
      {/* Top Bar Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Analytics</Text>

          <TouchableOpacity
            onPress={() => setExportModalVisible(true)}
            style={styles.exportButton}
            accessibilityLabel="Export Report"
          >
            <Text style={[styles.exportText, { color: theme.colors.brandPrimary }]}>Export</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Segmented Switcher */}
        <AnalyticsSegmentedControl
          activeSegment={activeSegment}
          onSegmentChange={setActiveSegment}
          disabled={isLoading}
        />
      </View>

      {/* Main Content ScrollView */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor={theme.colors.brandPrimary}
            colors={[theme.colors.brandPrimary]}
          />
        }
      >
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
            {/* Period Selector */}
            <ReportingPeriodSelector
              selected={selectedPeriod}
              onSelect={changePeriod}
              disabled={isLoading}
            />

            {/* Net savings hero - type on the ground, not a box inside a box */}
            {viewModel.financialSummary && (
              <View style={styles.summarySection}>
                <Text style={[styles.sectionHeading, { color: theme.colors.textMuted }]}>
                  NET SAVINGS · {periodLabel.toUpperCase()}
                </Text>

                <View style={styles.heroRow}>
                  <Text
                    style={[
                      styles.netSavingsAmount,
                      { color: viewModel.financialSummary.isPositiveSavings ? theme.colors.success : theme.colors.error },
                    ]}
                  >
                    {viewModel.financialSummary.formattedNetSavings}
                  </Text>
                  <Text style={[styles.rateCaption, { color: theme.colors.textSecondary }]}>
                    {viewModel.financialSummary.savingsRatePercentage}% rate
                  </Text>
                </View>

                <View style={styles.metricsRow}>
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricLabel, { color: theme.colors.textMuted }]}>Income</Text>
                    <Text style={[styles.metricValue, { color: theme.colors.textPrimary }]}>
                      {viewModel.financialSummary.formattedIncome}
                    </Text>
                  </View>

                  <View style={styles.metricItem}>
                    <Text style={[styles.metricLabel, { color: theme.colors.textMuted }]}>Expenses</Text>
                    <Text style={[styles.metricValue, { color: theme.colors.textPrimary }]}>
                      {viewModel.financialSummary.formattedExpense}
                    </Text>
                  </View>

                  <MonthOverMonthCard comparison={momComparison} />
                </View>

                <View style={[styles.divider, { backgroundColor: theme.colors.borderSubtle }]} />
              </View>
            )}

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
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '400',
    letterSpacing: -0.5,
  },
  exportButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  exportText: {
    fontSize: 15,
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
  summarySection: {
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 16,
  },
  netSavingsAmount: {
    fontSize: 40,
    fontWeight: '400',
    fontVariant: ['tabular-nums'],
  },
  rateCaption: {
    fontSize: 14,
    fontWeight: '500',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: 1,
    width: '100%',
  },
});
