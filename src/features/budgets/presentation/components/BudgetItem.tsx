import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { BudgetItemModel } from '../models';

interface BudgetItemProps {
  budget: BudgetItemModel;
  onPress: (budget: BudgetItemModel) => void;
  onDeletePress: (budget: BudgetItemModel) => void;
}

export function BudgetItem({ budget, onPress, onDeletePress }: BudgetItemProps) {
  const { colors, spacing, typography, radius } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          padding: spacing.space16,
          backgroundColor: colors.surfacePrimary,
          borderRadius: radius.medium,
          marginBottom: spacing.space8,
        },
      ]}
      onPress={() => onPress(budget)}
      accessibilityRole="button"
    >
      <View style={styles.content}>
        <View style={styles.mainInfo}>
          <Text style={[typography.body, { color: colors.textPrimary, fontWeight: 'bold' }]} numberOfLines={1}>
            {budget.period}
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.space4 }]} numberOfLines={1}>
            Status: {budget.status}
          </Text>
        </View>
        
        <View style={styles.amountContainer}>
          <Text style={[typography.body, { color: colors.textPrimary, fontWeight: 'bold' }]}>
            {budget.formattedAmount}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={[styles.deleteButton, { padding: spacing.space8, backgroundColor: colors.error + '20', borderRadius: radius.small, marginTop: spacing.space12 }]}
        onPress={(e) => {
          e.stopPropagation();
          onDeletePress(budget);
        }}
        accessibilityRole="button"
      >
        <Text style={[typography.label, { color: colors.error, textAlign: 'center' }]}>Delete</Text>
      </TouchableOpacity>
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
  deleteButton: {
    alignSelf: 'flex-start',
  }
});
