import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../../shared/theme';

interface BudgetProgressBarProps {
  progressPercentage: number;
  isOverBudget: boolean;
}

export function BudgetProgressBar({ progressPercentage, isOverBudget }: BudgetProgressBarProps) {
  const { colors, radius } = useTheme();
  
  const barColor = isOverBudget ? colors.error : colors.brandPrimary;

  return (
    <View style={styles.container}>
      <View style={[styles.backgroundBar, { backgroundColor: colors.surfaceSecondary, borderRadius: radius.small }]}>
        <View 
          style={[
            styles.fillBar, 
            { 
              backgroundColor: barColor, 
              width: `${progressPercentage}%`,
              borderRadius: radius.small
            }
          ]} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
  },
  backgroundBar: {
    height: 8,
    width: '100%',
    overflow: 'hidden',
  },
  fillBar: {
    height: '100%',
  }
});
