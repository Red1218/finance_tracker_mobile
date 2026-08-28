import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../theme';

export interface CircularProgressProps {
  /** Visual progress percentage (0 to 100). Clamped automatically. */
  percentage: number;
  /** Width and height in density pixels. Default: 120 */
  size?: number;
  /** Stroke width of the ring in density pixels. Default: 10 */
  strokeWidth?: number;
  /** Resolved color string for progress arc. Default: colors.brandPrimary */
  progressColor?: string;
  /** Resolved color string for track ring. Default: colors.surfaceSecondary || colors.borderSubtle */
  trackColor?: string;
  /** Optional content displayed in center of the ring overlay */
  children?: React.ReactNode;
  /** Accessibility label for screen readers */
  accessibilityLabel?: string;
}

export function CircularProgress({
  percentage,
  size = 120,
  strokeWidth = 10,
  progressColor,
  trackColor,
  children,
  accessibilityLabel,
}: CircularProgressProps) {
  const { colors } = useTheme();

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference;

  const resolvedProgressColor = progressColor || colors.brandPrimary;
  const resolvedTrackColor = trackColor || colors.surfaceSecondary || colors.borderSubtle;

  const label = accessibilityLabel || `Circular progress: ${Math.round(clampedPercentage)}%`;

  return (
    <View
      style={[styles.container, { width: size, height: size }]}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clampedPercentage) }}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={styles.svg}>
        {/* Background track circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={resolvedTrackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress stroke circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={resolvedProgressColor}
          strokeWidth={strokeWidth}
          strokeDasharray={[circumference, circumference]}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children ? <View style={styles.contentOverlay}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  contentOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
