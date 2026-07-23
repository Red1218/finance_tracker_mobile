import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface DashboardLayoutProps {
  isRefreshing: boolean;
  onRefresh: () => void;
  header: React.ReactNode;
  children: React.ReactNode;
}

export function DashboardLayout({ isRefreshing, onRefresh, header, children }: DashboardLayoutProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {header}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="#333333"
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
    backgroundColor: '#FAFAFA',
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
  }
});
