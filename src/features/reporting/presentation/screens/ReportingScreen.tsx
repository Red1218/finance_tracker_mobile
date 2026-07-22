import React, { useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import {
  GetDashboardSummaryUseCase,
  GetCategoryBreakdownUseCase,
  GetMonthlyTrendUseCase,
  GetBudgetPerformanceUseCase,
  GetLargestTransactionsUseCase,
} from '../../application';
import { useReportingPeriod } from '../hooks/useReportingPeriod';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import { useCategoryBreakdown } from '../hooks/useCategoryBreakdown';
import { useMonthlyTrend } from '../hooks/useMonthlyTrend';
import { useBudgetPerformance } from '../hooks/useBudgetPerformance';
import { useLargestTransactions } from '../hooks/useLargestTransactions';
import { ReportingPeriodSelector } from '../components/ReportingPeriodSelector';
import { DashboardSummaryCard } from '../components/DashboardSummaryCard';
import { CategoryBreakdownCard } from '../components/CategoryBreakdownCard';
import { MonthlyTrendCard } from '../components/MonthlyTrendCard';
import { BudgetPerformanceCard } from '../components/BudgetPerformanceCard';
import { LargestTransactionsCard } from '../components/LargestTransactionsCard';

interface Props {
  readonly getDashboardSummaryUseCase: GetDashboardSummaryUseCase;
  readonly getCategoryBreakdownUseCase: GetCategoryBreakdownUseCase;
  readonly getMonthlyTrendUseCase: GetMonthlyTrendUseCase;
  readonly getBudgetPerformanceUseCase: GetBudgetPerformanceUseCase;
  readonly getLargestTransactionsUseCase: GetLargestTransactionsUseCase;
}

/**
 * ReportingScreen
 *
 * - Owns page-level UI state (period selection via useReportingPeriod).
 * - Delegates async data state to individual presentation hooks.
 * - Passes immutable data down as props to stateless child components.
 * - Handles: Initial Loading, Pull-to-Refresh, Empty, Error, Loaded states.
 */
export const ReportingScreen: React.FC<Props> = ({
  getDashboardSummaryUseCase,
  getCategoryBreakdownUseCase,
  getMonthlyTrendUseCase,
  getBudgetPerformanceUseCase,
  getLargestTransactionsUseCase,
}) => {
  const { reportingPeriod, customStartDate, customEndDate, setReportingPeriod } = useReportingPeriod();

  const dashboardQuery = useDashboardSummary(getDashboardSummaryUseCase, reportingPeriod, customStartDate, customEndDate);
  const categoryQuery = useCategoryBreakdown(getCategoryBreakdownUseCase, reportingPeriod, customStartDate, customEndDate);
  const trendQuery = useMonthlyTrend(getMonthlyTrendUseCase, reportingPeriod, customStartDate, customEndDate);
  const budgetQuery = useBudgetPerformance(getBudgetPerformanceUseCase, reportingPeriod, customStartDate, customEndDate);
  const transactionQuery = useLargestTransactions(getLargestTransactionsUseCase, reportingPeriod, customStartDate, customEndDate);

  const isLoading =
    dashboardQuery.isLoading ||
    categoryQuery.isLoading ||
    trendQuery.isLoading ||
    budgetQuery.isLoading ||
    transactionQuery.isLoading;

  const isError =
    dashboardQuery.isError ||
    categoryQuery.isError ||
    trendQuery.isError ||
    budgetQuery.isError ||
    transactionQuery.isError;

  const isRefreshing =
    dashboardQuery.isFetching ||
    categoryQuery.isFetching ||
    trendQuery.isFetching ||
    budgetQuery.isFetching ||
    transactionQuery.isFetching;

  const handleRefresh = useCallback(() => {
    dashboardQuery.refetch();
    categoryQuery.refetch();
    trendQuery.refetch();
    budgetQuery.refetch();
    transactionQuery.refetch();
  }, [dashboardQuery, categoryQuery, trendQuery, budgetQuery, transactionQuery]);

  // ── Initial Loading State ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="mt-3 text-sm text-gray-400">Loading reports…</Text>
      </View>
    );
  }

  // ── Error State ────────────────────────────────────────────────────────
  if (isError) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-8">
        <Text className="text-base font-semibold text-red-600 text-center mb-2">
          Unable to load reports
        </Text>
        <Text className="text-sm text-gray-400 text-center mb-6">
          Pull down to retry or tap the button below.
        </Text>
        <View
          className="bg-blue-600 px-6 py-3 rounded-full"
          onTouchEnd={handleRefresh}
        >
          <Text className="text-white font-semibold">Retry</Text>
        </View>
      </View>
    );
  }

  // ── Empty State ────────────────────────────────────────────────────────
  const isEmpty =
    dashboardQuery.data?.transactionCount === 0 &&
    (categoryQuery.data?.items.length ?? 0) === 0;

  if (isEmpty) {
    return (
      <View className="flex-1 bg-gray-50">
        <ReportingPeriodSelector selected={reportingPeriod} onSelect={setReportingPeriod} />
        <View className="flex-1 justify-center items-center px-8">
          <Text className="text-base font-semibold text-gray-500 text-center">
            No financial data for this period.
          </Text>
        </View>
      </View>
    );
  }

  // ── Loaded State ───────────────────────────────────────────────────────
  return (
    <View className="flex-1 bg-gray-50">
      <ReportingPeriodSelector selected={reportingPeriod} onSelect={setReportingPeriod} />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {dashboardQuery.data && <DashboardSummaryCard data={dashboardQuery.data} />}
        {categoryQuery.data && <CategoryBreakdownCard data={categoryQuery.data} />}
        {trendQuery.data && <MonthlyTrendCard data={trendQuery.data} />}
        {budgetQuery.data && <BudgetPerformanceCard data={budgetQuery.data} />}
        {transactionQuery.data && <LargestTransactionsCard data={transactionQuery.data} />}
      </ScrollView>
    </View>
  );
};
