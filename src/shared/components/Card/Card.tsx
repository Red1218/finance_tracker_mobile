import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import type { CardProps, CardVariant } from './Card.types';

export function Card({ variant = 'default', style, children, ...props }: CardProps) {
  const { colors, radius, shadows, spacing } = useTheme();

  const variantStyles: Record<CardVariant, ViewStyle> = {
    default: {
      backgroundColor: colors.surfacePrimary,
      borderWidth: 1,
      borderColor: colors.border,
      ...shadows.small,
    },
    outlined: {
      backgroundColor: colors.surfacePrimary,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    elevated: {
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
      ...shadows.medium,
    },
  };

  const containerStyle: ViewStyle = {
    borderRadius: radius.large,
    padding: spacing.space16,
    ...variantStyles[variant],
  };

  return (
    <View style={[containerStyle, style]} {...props}>
      {children}
    </View>
  );
}
