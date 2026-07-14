import React from 'react';
import { View, ActivityIndicator, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

export interface LoadingProps {
  size?: 'small' | 'large';
}

export function Loading({ size = 'large' }: LoadingProps) {
  const { colors } = useTheme();

  const containerStyle: ViewStyle = {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  };

  return (
    <View style={containerStyle}>
      <ActivityIndicator size={size} color={colors.brandPrimary} />
    </View>
  );
}
