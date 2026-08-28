import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { CircularProgress } from '../../../../shared/components/CircularProgress';
import { useTheme } from '../../../../shared/theme';

export interface BudgetCircularProgressProps {
  percentageUsed: number;
  status?: string;
  size?: number;
  strokeWidth?: number;
}

export function BudgetCircularProgress({
  percentageUsed,
  status,
  size = 120,
  strokeWidth = 10,
}: BudgetCircularProgressProps) {
  const { colors, typography } = useTheme();

  let strokeColor = colors.brandPrimary;
  if (status === 'OVER_BUDGET' || status === 'Limit Reached' || percentageUsed >= 100) {
    strokeColor = colors.error;
  } else if (status === 'NEAR_LIMIT' || status === 'Near Limit' || percentageUsed >= 75) {
    strokeColor = colors.warning;
  }

  return (
    <CircularProgress
      percentage={percentageUsed}
      size={size}
      strokeWidth={strokeWidth}
      progressColor={strokeColor}
      trackColor={colors.surfaceSecondary || colors.borderSubtle}
      accessibilityLabel={`Budget utilization: ${Math.round(percentageUsed)}%`}
    >
      <Text
        style={[
          styles.percentageText,
          { color: colors.textPrimary, fontSize: typography.numericLarge.fontSize, fontVariant: ['tabular-nums'] },
        ]}
      >
        {percentageUsed.toFixed(0)}%
      </Text>
      <Text style={[styles.utilizedText, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
        UTILIZED
      </Text>
    </CircularProgress>
  );
}

const styles = StyleSheet.create({
  percentageText: {
    fontWeight: '700',
  },
  utilizedText: {
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 2,
  },
});
