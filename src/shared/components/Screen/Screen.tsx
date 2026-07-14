import React from 'react';
import { SafeAreaView, ScrollView, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import type { ScreenProps } from './Screen.types';

export function Screen({ scrollable = false, style, children, ...props }: ScreenProps) {
  const { colors, spacing } = useTheme();

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  };

  const contentStyle: ViewStyle = {
    flex: scrollable ? undefined : 1,
    padding: spacing.space16,
  };

  // Determine the wrapper component
  const Wrapper = scrollable ? ScrollView : View;

  // Compute props specifically for the selected wrapper
  const wrapperProps = scrollable
    ? {
        contentContainerStyle: [contentStyle, style],
        keyboardShouldPersistTaps: 'handled' as const,
        ...props,
      }
    : {
        style: [contentStyle, style],
        ...props,
      };

  return (
    <SafeAreaView style={containerStyle}>
      <Wrapper {...wrapperProps}>
        {children}
      </Wrapper>
    </SafeAreaView>
  );
}
