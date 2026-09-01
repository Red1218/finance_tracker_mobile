import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import type { CardProps, CardVariant } from './Card.types';

export function Card({ variant = 'default', style, children, ...props }: CardProps) {
  const { colors, radius, spacing } = useTheme();

  const variantStyles: Record<CardVariant, ViewStyle> = {
    default: {
      backgroundColor: colors.surfacePrimary,
      borderWidth: 1,
      borderColor: colors.border,
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
    },
  };

  const containerStyle: ViewStyle = {
    borderRadius: radius.medium,
    padding: spacing.space16,
    ...variantStyles[variant],
  };

  return (
    <View style={[containerStyle, style]} {...props}>
      {children}
    </View>
  );
}
