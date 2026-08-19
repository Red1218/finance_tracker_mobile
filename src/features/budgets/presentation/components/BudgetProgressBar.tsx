import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/src/shared/theme';

export interface BudgetProgressBarProps {
  percentage: number;
  status: 'OnTrack' | 'AtRisk' | 'Overbudget' | 'ON_TRACK' | 'NEAR_LIMIT' | 'OVER_BUDGET' | string;
}

export function BudgetProgressBar({ percentage, status }: BudgetProgressBarProps) {
  const { colors, radius } = useTheme();
  const cappedPercentage = Math.min(Math.max(percentage, 0), 100);

  let fillColor: string = colors.success;
  if (status === 'AtRisk' || status === 'NEAR_LIMIT') fillColor = colors.warning;
  if (status === 'Overbudget' || status === 'OVER_BUDGET') fillColor = colors.error;


  return (
    <View style={[styles.track, { backgroundColor: colors.surfaceSecondary, borderRadius: radius.pill }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${cappedPercentage}%`,
            backgroundColor: fillColor,
            borderRadius: radius.pill,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    height: 8,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
