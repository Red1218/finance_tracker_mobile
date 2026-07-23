import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { LoadingSkeleton } from './LoadingSkeleton';
import { RetryButton } from './RetryButton';
import { EmptyState } from './EmptyState';

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
        <View style={styles.overlay}>
          <ActivityIndicator size="small" color="#0000ff" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    minHeight: 100, // Enforce a minimum touch/display area
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  }
});
