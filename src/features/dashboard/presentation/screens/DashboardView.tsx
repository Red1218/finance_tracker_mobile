import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { DashboardScreenState } from '../models/DashboardScreenState';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { DashboardHeader } from '../components/layout/DashboardHeader';
import { ReportingPeriodSelector } from '../components/layout/ReportingPeriodSelector';
import { BudgetHealthSection } from '../components/sections/BudgetHealthSection';
import { RecentActivitySection } from '../components/sections/RecentActivitySection';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { FAB } from '../../../../shared/components/FAB';

import { useRouter } from 'expo-router';

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
  onTogglePeriodSelector,
  upcomingBillsSection,
  userAvatarUrl,
  userEmail,
  onAvatarPress,
  onNotificationsPress,
  onNavigateToSpends,
  onNavigateToBudgets,
  onNavigateToCreateTransaction,
}: DashboardViewProps) {
  const { colors } = useTheme();
  const { viewModel, isRefreshing, isPeriodSelectorOpen } = state;

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
        {/* 1. Monthly Budget Card / Budget Health */}
        <View style={styles.sectionContainer}>
          <BudgetHealthSection
            viewModel={viewModel.budgetHealthSection}
            onRetry={() => onRefreshSection('BudgetHealth')}
            onNavigateToBudgets={onNavigateToBudgets}
          />
        </View>

        {/* 2. Upcoming Bills (Preserved Cross-Context Contract Slot) */}
        {upcomingBillsSection ? (
          <View style={styles.zonalSpacing}>
            {upcomingBillsSection}
          </View>
        ) : null}

        {/* 3. Recent Activity (3 Items + View All) */}
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
