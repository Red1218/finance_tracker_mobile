import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { SegmentedControl } from '../../../../shared/components/SegmentedControl';
import { DashboardScreenState } from '../models/DashboardScreenState';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { DashboardHeader } from '../components/layout/DashboardHeader';
import { BudgetHealthSection } from '../components/sections/BudgetHealthSection';
import { IncomeExpenseSection } from '../components/sections/IncomeExpenseSection';
import { CategoryBreakdownSection } from '../components/sections/CategoryBreakdownSection';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { FAB } from '../../../../shared/components/FAB';

import { useRouter } from 'expo-router';

const PERIOD_OPTIONS = [
  { id: 'CurrentMonth', label: 'This Month' },
  { id: 'PreviousMonth', label: 'Last Month' },
  { id: 'YearToDate', label: 'YTD' },
];

interface DashboardViewProps {
  state: DashboardScreenState;
  onRefresh: () => void;
  onRefreshSection: (sectionId: string) => void;
  onChangePeriod: (periodId: string) => void;
  onExecuteQuickAction: (actionId: string, payload: unknown) => void;
  onTogglePeriodSelector: () => void;
  upcomingBillsSection?: React.ReactNode;
  userAvatarUrl?: string;
  userEmail?: string;
  onAvatarPress?: () => void;
  onNotificationsPress?: () => void;
  onNavigateToSpends?: () => void;
  onNavigateToBudgets?: () => void;
  onNavigateToCreateTransaction?: () => void;
}

export function DashboardView({
  state,
  onRefresh,
  onRefreshSection,
  onChangePeriod,
  onExecuteQuickAction,
  upcomingBillsSection,
  userAvatarUrl,
  userEmail,
  onAvatarPress,
  onNotificationsPress,
  onNavigateToBudgets,
  onNavigateToCreateTransaction,
}: DashboardViewProps) {
  const { colors } = useTheme();
  const { viewModel, isRefreshing } = state;

  let router: ReturnType<typeof useRouter> | null = null;
  try {
    router = useRouter();
  } catch {
    router = null;
  }

  const handleFabPress = () => {
    if (onNavigateToCreateTransaction) {
      onNavigateToCreateTransaction();
    } else if (router) {
      router.push({ pathname: '/spends', params: { openModal: 'true' } });
    } else {
      onExecuteQuickAction('ADD_TRANSACTION', {});
    }
  };

  // Initial load skeleton
  if (!viewModel) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.backgroundPrimary }]}>
        <LoadingSkeleton height={150} />
        <LoadingSkeleton height={150} />
        <LoadingSkeleton height={150} />
      </View>
    );
  }

  return (
    <View style={styles.outerWrapper}>
      <DashboardLayout
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
        header={
          <DashboardHeader
            title="Home"
            userAvatarUrl={userAvatarUrl}
            userEmail={userEmail}
            onAvatarPress={onAvatarPress}
            onNotificationsPress={onNotificationsPress}
          />
        }
      >
        {/* 1. Budget ring hero, full-bleed on its own accent field */}
        <BudgetHealthSection
          viewModel={viewModel.budgetHealthSection}
          onRetry={() => onRefreshSection('BudgetHealth')}
          onNavigateToBudgets={onNavigateToBudgets}
        />

        {/* 2. Period rail -> income/expense pair -> category breakdown */}
        <View style={styles.gutter}>
          <SegmentedControl
            options={PERIOD_OPTIONS}
            selectedId={viewModel.activeReportingPeriodId}
            onChange={onChangePeriod}
            accessibilityLabel="Reporting period"
          />

          <IncomeExpenseSection
            viewModel={viewModel.kpiSection}
            onRetry={() => onRefreshSection('KPI')}
          />

          {upcomingBillsSection ? upcomingBillsSection : null}

          <CategoryBreakdownSection
            viewModel={viewModel.categoryBreakdownSection}
            onRetry={() => onRefreshSection('CategoryBreakdown')}
          />
        </View>

        {/* Bottom Spacing to ensure FAB does not obscure content */}
        <View style={styles.bottomSpacer} />
      </DashboardLayout>

      {/* Floating Action Button (FAB) */}
      <FAB
        iconName="Plus"
        onPress={handleFabPress}
        accessibilityLabel="Add transaction"
        style={styles.fab}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  gutter: {
    gap: 16,
  },
  bottomSpacer: {
    height: 72,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
});
