import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { ExpenseItemModel } from '../models';

interface ExpenseItemProps {
  expense: ExpenseItemModel;
  onPress: (expense: ExpenseItemModel) => void;
  onDeletePress: (expense: ExpenseItemModel) => void;
  onRestorePress?: (expense: ExpenseItemModel) => void;
}

export function ExpenseItem({ expense, onPress, onDeletePress, onRestorePress }: ExpenseItemProps) {
  const { colors, spacing, typography, radius } = useTheme();

  const isDeleted = expense.isDeleted;
  const opacity = isDeleted ? 0.6 : 1;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          padding: spacing.space16,
          backgroundColor: colors.surfacePrimary,
          borderRadius: radius.medium,
          marginBottom: spacing.space8,
          opacity,
        },
      ]}
      onPress={() => !isDeleted && onPress(expense)}
      activeOpacity={isDeleted ? 1 : 0.2}
      accessibilityRole="button"
      accessibilityLabel={`Expense for ${expense.formattedAmount}`}
    >
      <View style={styles.content}>
        <View style={styles.mainInfo}>
          <Text style={[typography.body, { color: colors.textPrimary, fontWeight: 'bold' }]} numberOfLines={1}>
            {expense.merchant || 'Unknown Merchant'}
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.space4 }]} numberOfLines={1}>
            {expense.categoryName} • {expense.paymentMethod} {expense.note ? `• ${expense.note}` : ''}
          </Text>
        </View>
        
        <View style={styles.amountContainer}>
          <Text style={[typography.body, { color: colors.textPrimary, fontWeight: 'bold' }]}>
            {expense.formattedAmount}
          </Text>
        </View>
      </View>
      
      {isDeleted ? (
        <TouchableOpacity
          style={[styles.actionButton, { padding: spacing.space8, backgroundColor: colors.success + '20', borderRadius: radius.small, marginTop: spacing.space12 }]}
          onPress={(e) => {
            e.stopPropagation();
            onRestorePress?.(expense);
          }}
          accessibilityRole="button"
          accessibilityLabel="Restore expense"
        >
          <Text style={[typography.label, { color: colors.success, textAlign: 'center' }]}>Restore</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.actionButton, { padding: spacing.space8, backgroundColor: colors.error + '20', borderRadius: radius.small, marginTop: spacing.space12 }]}
          onPress={(e) => {
            e.stopPropagation();
            onDeletePress(expense);
          }}
          accessibilityRole="button"
          accessibilityLabel="Delete expense"
        >
          <Text style={[typography.label, { color: colors.error, textAlign: 'center' }]}>Delete</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mainInfo: {
    flex: 1,
    marginRight: 16,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  actionButton: {
    alignSelf: 'flex-start',
  }
});
