import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import type { CardProps } from './Card.types';

export function Card({ style, children, ...props }: CardProps) {
  const { colors, radius, shadows, spacing } = useTheme();

  const containerStyle: ViewStyle = {
    backgroundColor: colors.surfacePrimary,
    borderRadius: radius.large,
    padding: spacing.space16,
    ...shadows.small,
  };

  return (
    <View style={[containerStyle, style]} {...props}>
      {children}
    </View>
  );
}
