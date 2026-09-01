import React, { useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../theme';
import type { ButtonProps, ButtonVariant } from './Button.types';

export function Button({ variant = 'primary', loading, disabled, title, style, onFocus, onBlur, ...props }: ButtonProps) {
  const { colors, spacing, radius, typography } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const variantStyles: Record<ButtonVariant, { backgroundColor: string; textColor: string }> = {
    primary: {
      backgroundColor: colors.brandPrimary,
      textColor: '#FFFFFF',
    },
    secondary: {
      backgroundColor: colors.surfaceElevated,
      textColor: colors.textPrimary,
    },
    destructive: {
      backgroundColor: colors.error,
      textColor: '#FFFFFF',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.primary;

  const backgroundColor = disabled ? colors.disabled : currentVariant.backgroundColor;
  const textColor = disabled ? colors.textMuted : currentVariant.textColor;

  const containerStyle: ViewStyle = {
    backgroundColor,
    borderRadius: radius.medium,
    paddingVertical: spacing.space12,
    paddingHorizontal: spacing.space24,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...(isFocused
      ? {
          outlineWidth: 2,
          outlineColor: colors.focus,
          outlineStyle: 'solid',
          outlineOffset: 2,
        }
      : null),
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
      onFocus={(e) => {
        setIsFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setIsFocused(false);
        onBlur?.(e);
      }}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
