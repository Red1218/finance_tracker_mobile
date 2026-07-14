import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../theme';
import type { ButtonProps, ButtonVariant } from './Button.types';

export function Button({ variant = 'primary', loading, disabled, title, style, ...props }: ButtonProps) {
  const { colors, spacing, radius, typography } = useTheme();

  const variantStyles: Record<ButtonVariant, { backgroundColor: string; textColor: string }> = {
    primary: {
      backgroundColor: colors.brandPrimary,
      textColor: colors.backgroundPrimary,
    },
    secondary: {
      backgroundColor: colors.surfaceSecondary,
      textColor: colors.textPrimary,
    },
    destructive: {
      backgroundColor: colors.error,
      textColor: colors.backgroundPrimary,
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.primary;

  const backgroundColor = disabled ? colors.disabled : currentVariant.backgroundColor;
  const textColor = disabled ? colors.textSecondary : currentVariant.textColor;

  const containerStyle: ViewStyle = {
    backgroundColor,
    borderRadius: radius.medium,
    paddingVertical: spacing.space12,
    paddingHorizontal: spacing.space24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  };

  const textStyle: TextStyle = {
    color: textColor,
    fontSize: typography.body.fontSize,
    fontWeight: typography.title.fontWeight,
    lineHeight: typography.body.lineHeight,
  };

  return (
    <TouchableOpacity
      style={[containerStyle, style]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{
        disabled: !!disabled,
        busy: !!loading,
      }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
