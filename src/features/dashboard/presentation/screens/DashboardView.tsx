import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { DashboardScreenState } from '../models/DashboardScreenState';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { DashboardHeader } from '../components/layout/DashboardHeader';
import { ReportingPeriodSelector } from '../components/layout/ReportingPeriodSelector';
import { KPICardsSection } from '../components/sections/KPICardsSection';
import { BudgetHealthSection } from '../components/sections/BudgetHealthSection';
import { CategoryBreakdownSection } from '../components/sections/CategoryBreakdownSection';
import { RecentActivitySection } from '../components/sections/RecentActivitySection';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { FAB } from '../../../../shared/components/FAB';

interface DashboardViewProps {
  state: DashboardScreenState;
  onRefresh: () => void;
  onRefreshSection: (sectionId: string) => void;
  onChangePeriod: (periodId: string) => void;
  onExecuteQuickAction: (actionId: string, payload: unknown) => void;
  onTogglePeriodSelector: () => void;
  upcomingBillsSection?: React.ReactNode;
  onNavigateToSpends?: () => void;
}

export function DashboardView({
  state,
  onRefresh,
  onRefreshSection,
  onChangePeriod,
  onExecuteQuickAction,
  onTogglePeriodSelector,
  upcomingBillsSection,
  onNavigateToSpends,
}: DashboardViewProps) {
  const { colors } = useTheme();
  const { viewModel, isRefreshing, isPeriodSelectorOpen } = state;

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
            title="Dashboard"
            selector={
              <ReportingPeriodSelector
                currentPeriodId={viewModel.activeReportingPeriodId}
                isOpen={isPeriodSelectorOpen}
                onToggle={onTogglePeriodSelector}
                onSelect={onChangePeriod}
              />
            }
          />
        }
      >
        {/* 1. Hero Financial Card */}
        <View style={styles.sectionContainer}>
          <KPICardsSection
            viewModel={viewModel.kpiSection}
            onRetry={() => onRefreshSection('KPICards')}
          />
        </View>

        {/* 2. Compact Budget Health Card */}
        <View style={styles.zonalSpacing}>
          <BudgetHealthSection
            viewModel={viewModel.budgetHealthSection}
            onRetry={() => onRefreshSection('BudgetHealth')}
          />
        </View>

        {/* 3. Upcoming Bills (Preserved Cross-Context Contract Slot) */}
        {upcomingBillsSection ? (
          <View style={styles.zonalSpacing}>
            {upcomingBillsSection}
          </View>
        ) : null}

        {/* 4. Top Spending Categories (Horizontal Bars) */}
        <View style={styles.zonalSpacing}>
          <CategoryBreakdownSection
            viewModel={viewModel.categoryBreakdownSection}
            onRetry={() => onRefreshSection('CategoryBreakdown')}
          />
        </View>

        {/* 5. Recent Activity (3 Items + See All) */}
        <View style={styles.zonalSpacing}>
          <RecentActivitySection
            viewModel={viewModel.recentActivitySection}
            onRetry={() => onRefreshSection('RecentActivity')}
            onSeeAll={onNavigateToSpends}
          />
        </View>

        {/* Bottom Spacing to ensure FAB does not obscure content */}
        <View style={styles.bottomSpacer} />
      </DashboardLayout>

      {/* Floating Action Button (FAB) */}
      <FAB
        iconName="Plus"
        onPress={() => onExecuteQuickAction('ADD_TRANSACTION', {})}
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
  sectionContainer: {
    marginTop: 4,
  },
  zonalSpacing: {
    marginTop: 14,
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
