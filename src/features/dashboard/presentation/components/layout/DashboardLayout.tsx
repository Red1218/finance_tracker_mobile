import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../../../shared/theme';

interface DashboardLayoutProps {
  isRefreshing: boolean;
  onRefresh: () => void;
  header: React.ReactNode;
  children: React.ReactNode;
}

export function DashboardLayout({ isRefreshing, onRefresh, header, children }: DashboardLayoutProps) {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.backgroundPrimary }]}>
      <View style={styles.container}>
        {header}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.brandPrimary}
              colors={[colors.brandPrimary]}
            />
          }
        >
          {children}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
});
