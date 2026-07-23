import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { DashboardScreenState } from '../models/DashboardScreenState';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { DashboardHeader } from '../components/layout/DashboardHeader';
import { ReportingPeriodSelector } from '../components/layout/ReportingPeriodSelector';
import { KPICardsSection } from '../components/sections/KPICardsSection';
import { BudgetHealthSection } from '../components/sections/BudgetHealthSection';
import { CategoryBreakdownSection } from '../components/sections/CategoryBreakdownSection';
import { RecentActivitySection } from '../components/sections/RecentActivitySection';
import { QuickActionsSection } from '../components/sections/QuickActionsSection';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

interface DashboardViewProps {
  state: DashboardScreenState;
  onRefresh: () => void;
  onRefreshSection: (sectionId: string) => void;
  onChangePeriod: (periodId: string) => void;
  onExecuteQuickAction: (actionId: string, payload: unknown) => void;
  onTogglePeriodSelector: () => void;
}

export function DashboardView({
  state,
  onRefresh,
  onRefreshSection,
  onChangePeriod,
  onExecuteQuickAction,
  onTogglePeriodSelector
}: DashboardViewProps) {
  const { viewModel, isRefreshing, isPeriodSelectorOpen } = state;

  // Initial load skeleton
  if (!viewModel) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSkeleton height={150} />
        <LoadingSkeleton height={150} />
        <LoadingSkeleton height={150} />
      </View>
    );
  }

  return (
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
      <View>
        <KPICardsSection 
          viewModel={viewModel.kpiSection} 
          onRetry={() => onRefreshSection('KPICards')} 
        />
      </View>

      <View style={styles.zonalSpacing}>
        <QuickActionsSection 
          onAction={(actionId) => onExecuteQuickAction(actionId, {})} 
        />
      </View>

      <View style={styles.zonalSpacing}>
        <BudgetHealthSection 
          viewModel={viewModel.budgetHealthSection} 
          onRetry={() => onRefreshSection('BudgetHealth')} 
        />
      </View>

      <View style={styles.zonalSpacing}>
        <CategoryBreakdownSection 
          viewModel={viewModel.categoryBreakdownSection} 
          onRetry={() => onRefreshSection('CategoryBreakdown')} 
        />
      </View>

      <View style={styles.zonalSpacing}>
        <RecentActivitySection 
          viewModel={viewModel.recentActivitySection} 
          onRetry={() => onRefreshSection('RecentActivity')} 
        />
      </View>

    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    padding: 16,
    gap: 16,
    backgroundColor: '#FAFAFA'
  },
  zonalSpacing: {
    marginTop: 8,
  }
});
