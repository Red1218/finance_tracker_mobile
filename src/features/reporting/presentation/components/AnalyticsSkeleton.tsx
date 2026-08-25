import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../../../../shared/theme';

interface Props {
  readonly variant?: 'hero' | 'card' | 'chart' | 'insight';
}

export const AnalyticsSkeleton: React.FC<Props> = ({ variant = 'card' }) => {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  const getHeight = () => {
    switch (variant) {
      case 'hero':
        return 160;
      case 'chart':
        return 220;
      case 'insight':
        return 120;
      case 'card':
      default:
        return 140;
    }
  };

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          height: getHeight(),
          backgroundColor: theme.colors.surfaceElevated,
          opacity,
        },
      ]}
      accessibilityLabel="Loading content"
      accessibilityLiveRegion="polite"
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    width: '100%',
    borderRadius: 14,
    marginBottom: 16,
  },
});
