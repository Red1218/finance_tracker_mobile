import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { LoadingSkeleton } from './LoadingSkeleton';
import { RetryButton } from './RetryButton';
import { EmptyState } from './EmptyState';
import { useTheme } from '../../../../../shared/theme';

type LoadStatus = 'Loading' | 'Loaded' | 'Empty' | 'Error' | 'Refreshing';

interface SectionStateContainerProps {
  status: LoadStatus;
  errorMessage?: string;
  emptyMessage?: string;
  onRetry: () => void;
  children: React.ReactNode;
  /** Height to use for the skeleton if no explicit skeleton is provided */
  skeletonHeight?: number;
}

export function SectionStateContainer({
  status,
  errorMessage,
  emptyMessage,
  onRetry,
  children,
  skeletonHeight = 150
}: SectionStateContainerProps) {
  const { colors } = useTheme();

  if (status === 'Loading') {
    return (
      <View style={styles.container}>
        <LoadingSkeleton height={skeletonHeight} />
      </View>
    );
  }

  if (status === 'Error') {
    return (
      <View style={styles.container}>
        <RetryButton message={errorMessage} onRetry={onRetry} />
      </View>
    );
  }

  if (status === 'Empty') {
    return (
      <View style={styles.container}>
        <EmptyState message={emptyMessage || 'No data available'} />
      </View>
    );
  }

  // Handle 'Loaded' and 'Refreshing'
  return (
    <View style={styles.container}>
      {children}
      {status === 'Refreshing' && (
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <ActivityIndicator size="small" color={colors.brandPrimary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    minHeight: 40,
    marginBottom: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  }
});
