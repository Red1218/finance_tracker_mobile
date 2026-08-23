import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SectionStateContainer } from '../../../dashboard/presentation/components/common/SectionStateContainer';
import { UpcomingBillsSectionState, UpcomingBillItemViewModel } from '../view-models/UpcomingBillsViewModel';
import { UpcomingBillsCard } from './UpcomingBillsCard';
import { useTheme } from '../../../../shared/theme';
import { EmptyState } from '../../../dashboard/presentation/components/common/EmptyState';

export interface UpcomingBillsSectionProps {
  readonly state: UpcomingBillsSectionState;
  readonly onRetry: () => void;
  readonly onMarkPaidPress?: (billId: string) => void;
  readonly onBillPress?: (billId: string) => void;
}

export function UpcomingBillsSection({
  state,
  onRetry,
  onMarkPaidPress,
  onBillPress,
}: UpcomingBillsSectionProps) {
  const { colors, typography } = useTheme();

  const containerStatus =
    state.status === 'LOADING' || state.status === 'IDLE'
      ? 'Loading'
      : state.status === 'ERROR'
        ? 'Error'
        : state.bills.length === 0
          ? 'Empty'
          : 'Loaded';

  return (
    <SectionStateContainer
      status={containerStatus}
      errorMessage={state.errorMessage || undefined}
      emptyMessage="No upcoming bills due soon."
      onRetry={onRetry}
      skeletonHeight={140}
    >
      <View style={styles.container}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.heading.fontSize }]} accessibilityRole="header">
            Upcoming Bills
          </Text>
          {state.bills.length > 0 ? (
            <Text style={[styles.billCount, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
              {state.bills.length} upcoming
            </Text>
          ) : null}
        </View>

        {state.bills.length === 0 ? (
          <EmptyState message="No upcoming bills due soon." />
        ) : (
          state.bills.map((bill: UpcomingBillItemViewModel) => (
            <UpcomingBillsCard
              key={bill.billId}
              bill={bill}
              onMarkPaidPress={onMarkPaidPress}
              onBillPress={onBillPress}
            />
          ))
        )}
      </View>
    </SectionStateContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontWeight: '700',
  },
  billCount: {
    fontWeight: '500',
  },
});
