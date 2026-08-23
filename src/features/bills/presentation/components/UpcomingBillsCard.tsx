import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { Card } from '../../../../shared/components/Card';
import { UpcomingBillItemViewModel, BillUrgencyLevel } from '../view-models/UpcomingBillsViewModel';

export interface UpcomingBillsCardProps {
  readonly bill: UpcomingBillItemViewModel;
  readonly onMarkPaidPress?: (billId: string) => void;
  readonly onBillPress?: (billId: string) => void;
  readonly isLoading?: boolean;
}

export function UpcomingBillsCard({
  bill,
  onMarkPaidPress,
  onBillPress,
  isLoading = false,
}: UpcomingBillsCardProps) {
  const { colors, typography } = useTheme();

  if (isLoading) {
    return (
      <Card variant="elevated" style={styles.cardContainer}>
        <View style={styles.skeletonRow}>
          <View style={[styles.skeletonText, { backgroundColor: colors.surfaceElevated }]} />
          <View style={[styles.skeletonBadge, { backgroundColor: colors.surfaceElevated }]} />
        </View>
      </Card>
    );
  }

  const getUrgencyColor = (urgency: BillUrgencyLevel): string => {
    switch (urgency) {
      case 'critical':
        return colors.error;
      case 'high':
        return colors.warning;
      case 'medium':
        return colors.brandPrimary;
      case 'low':
      default:
        return colors.textSecondary;
    }
  };

  const badgeColor = getUrgencyColor(bill.urgency);
  const isOverdue = bill.status === 'Overdue';

  const accessibilityText = `${bill.billName}, ${bill.formattedAmount}, ${bill.dueDateLabel}, Status: ${bill.status}`;

  return (
    <TouchableOpacity
      activeOpacity={onBillPress ? 0.7 : 1}
      onPress={() => onBillPress?.(bill.billId)}
      disabled={!onBillPress}
      accessibilityRole="summary"
      accessibilityLabel={`Upcoming bill: ${bill.billName}`}
      accessibilityHint={accessibilityText}
    >
      <Card variant="elevated" style={[styles.cardContainer, { backgroundColor: colors.surfacePrimary, borderColor: colors.borderSubtle }]}>
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <Text style={[styles.billName, { color: colors.textPrimary, fontSize: typography.title.fontSize }]} numberOfLines={1}>
              {bill.billName}
            </Text>
            {bill.categoryName ? (
              <Text style={[styles.categoryName, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]} numberOfLines={1}>
                {bill.categoryName}
              </Text>
            ) : null}
          </View>

          <View style={[styles.badge, { backgroundColor: badgeColor + '20', borderColor: badgeColor }]}>
            <View style={[styles.badgeDot, { backgroundColor: badgeColor }]} />
            <Text style={[styles.badgeText, { color: badgeColor, fontSize: typography.caption.fontSize }]}>
              {bill.dueDateLabel}
            </Text>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <Text style={[styles.amount, { color: isOverdue ? colors.error : colors.textPrimary, fontSize: typography.heading.fontSize }]}>
            {bill.formattedAmount}
          </Text>

          {onMarkPaidPress ? (
            <TouchableOpacity
              style={[styles.payButton, { backgroundColor: colors.brandPrimary }]}
              onPress={() => onMarkPaidPress(bill.billId)}
              accessibilityRole="button"
              accessibilityLabel={`Mark ${bill.billName} as paid`}
            >
              <Text style={[styles.payButtonText, { color: colors.textPrimary, fontSize: typography.caption.fontSize }]}>
                Mark Paid
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  billName: {
    fontWeight: '700',
  },
  categoryName: {
    fontWeight: '400',
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  badgeText: {
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    fontWeight: '700',
  },
  payButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  payButtonText: {
    fontWeight: '600',
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 60,
  },
  skeletonText: {
    width: '50%',
    height: 20,
    borderRadius: 4,
  },
  skeletonBadge: {
    width: '30%',
    height: 20,
    borderRadius: 4,
  },
});
