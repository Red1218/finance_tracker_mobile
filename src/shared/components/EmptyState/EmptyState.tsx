import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../theme';
import type { EmptyStateProps } from './EmptyState.types';

export function EmptyState({ title, description, action }: EmptyStateProps) {
  const { colors, spacing, typography } = useTheme();

  const containerStyle: ViewStyle = {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.space32,
  };

  const titleStyle: TextStyle = {
    color: colors.textPrimary,
    fontSize: typography.title.fontSize,
    fontWeight: typography.title.fontWeight,
    marginBottom: spacing.space8,
    textAlign: 'center',
  };

  const descriptionStyle: TextStyle = {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    textAlign: 'center',
    marginBottom: action ? spacing.space24 : 0,
  };

  return (
    <View style={containerStyle}>
      <Text style={titleStyle}>{title}</Text>
      <Text style={descriptionStyle}>{description}</Text>
      {action && <View>{action}</View>}
    </View>
  );
}
