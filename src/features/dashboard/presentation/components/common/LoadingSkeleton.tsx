import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../../../../shared/theme';

interface LoadingSkeletonProps {
  height?: number;
}

export function LoadingSkeleton({ height = 100 }: LoadingSkeletonProps) {
  const { colors } = useTheme();
  const animatedValue = new Animated.Value(0);

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[styles.skeleton, { height, opacity, backgroundColor: colors.surfaceElevated }]}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading content"
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    borderRadius: 8,
    width: '100%',
  }
});
