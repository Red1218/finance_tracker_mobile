import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme, withAlpha } from '../../theme';
import type { StatusIndicatorProps, StatusType } from './StatusIndicator.types';

export function StatusIndicator({
  status,
  label,
  variant = 'badge',
  style,
  textStyle,
  accessibilityLabel,
}: StatusIndicatorProps) {
  const { colors, radius, spacing, typography } = useTheme();

  const statusColors: Record<StatusType, { color: string; background: string }> = {
    success: {
      color: colors.success,
      background: withAlpha(colors.success, 0.15),
    },
    warning: {
      color: colors.warning,
      background: withAlpha(colors.warning, 0.15),
    },
    error: {
      color: colors.error,
      background: withAlpha(colors.error, 0.15),
    },
    info: {
      color: colors.brandPrimary,
      background: withAlpha(colors.brandPrimary, 0.15),
    },
  };

  const currentStatus = statusColors[status] || statusColors.info;

  if (variant === 'dot') {
    return (
      <View
        style={[styles.dot, { backgroundColor: currentStatus.color }, style]}
        accessible={true}
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel || `Status: ${status}`}
      />
    );
  }

  if (variant === 'text') {
    return (
      <Text
        style={[styles.textOnly, { color: currentStatus.color, fontSize: typography.caption.fontSize }, textStyle]}
        accessible={true}
        accessibilityLabel={accessibilityLabel || label || `Status: ${status}`}
      >
        {label}
      </Text>
    );
  }

  if (variant === 'subtle') {
    return (
      <View style={[styles.subtleContainer, style]} accessible={true} accessibilityLabel={accessibilityLabel || label || `Status: ${status}`}>
        <View style={[styles.dot, { backgroundColor: currentStatus.color }]} />
        {label ? (
          <Text style={[styles.subtleText, { color: colors.textSecondary, fontSize: typography.caption.fontSize }, textStyle]}>
            {label}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.badgeContainer,
        {
          backgroundColor: currentStatus.background,
          borderColor: currentStatus.color,
          borderRadius: radius.pill,
          paddingHorizontal: spacing.space8,
          paddingVertical: spacing.space4,
        },
        style,
      ]}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel || label || `Status: ${status}`}
    >
      <View style={[styles.dotSmall, { backgroundColor: currentStatus.color }]} />
      {label ? (
        <Text style={[styles.badgeText, { color: currentStatus.color, fontSize: typography.caption.fontSize }, textStyle]}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  subtleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subtleText: {
    fontWeight: '500',
  },
  textOnly: {
    fontWeight: '700',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  badgeText: {
    fontWeight: '600',
  },
});
