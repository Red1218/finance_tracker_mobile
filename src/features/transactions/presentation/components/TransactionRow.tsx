import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/src/shared/theme';
import { Icon } from '@/src/shared/components';
import { TransactionViewModel } from '../models/TransactionViewModel';

export interface TransactionRowProps {
  transaction: TransactionViewModel;
  onPress?: (transaction: TransactionViewModel) => void;
}

export function TransactionRow({ transaction, onPress }: TransactionRowProps) {
  const { colors, typography } = useTheme();

  const isPositive = transaction.type === 'INCOME' || transaction.type === 'TRANSFER_IN';
  const isTransfer = transaction.type === 'TRANSFER_OUT' || transaction.type === 'TRANSFER_IN';

  let iconName: 'ArrowDownLeft' | 'ArrowUpRight' | 'ArrowRightLeft' = isPositive
    ? 'ArrowDownLeft'
    : 'ArrowUpRight';
  if (isTransfer) {
    iconName = 'ArrowRightLeft';
  }

  let amountColor = isPositive ? colors.success : colors.textPrimary;
  if (transaction.isVoided) {
    amountColor = colors.textMuted;
  }

  let iconColor = isPositive ? colors.success : colors.error;
  if (isTransfer) {
    iconColor = colors.brandPrimary;
  }
  if (transaction.isVoided) {
    iconColor = colors.textMuted;
  }

  return (
    <TouchableOpacity
      style={[styles.container, { borderBottomColor: colors.divider }]}
      onPress={() => onPress?.(transaction)}
      disabled={!onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${transaction.description || 'Transaction'}, ${transaction.formattedAmount}`}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.surfaceElevatedBadge }]}>
        <Icon name={iconName} size={20} color={iconColor} />
      </View>

      <View style={styles.detailsContainer}>
        <Text style={[styles.description, { color: colors.textPrimary, fontSize: typography.body.fontSize }]} numberOfLines={1}>
          {transaction.description || 'Transaction'}
        </Text>
        <Text style={[styles.typeLabel, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
          {transaction.typeLabel} • {transaction.formattedDate}
        </Text>
      </View>

      <View style={styles.amountContainer}>
        <Text
          style={[
            styles.amount,
            {
              color: amountColor,
              fontSize: typography.numeric.fontSize,
              fontVariant: ['tabular-nums'],
              textDecorationLine: transaction.isVoided ? 'line-through' : 'none',
            },
          ]}
        >
          {transaction.formattedAmount}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    minHeight: 56,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailsContainer: {
    flex: 1,
    marginRight: 8,
  },
  description: {
    fontWeight: '600',
    marginBottom: 2,
  },
  typeLabel: {},
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontWeight: '600',
  },
});
