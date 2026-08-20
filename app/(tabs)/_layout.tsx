import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { useAppAuth as useAuth } from '@/src/features/auth/presentation/hooks/useAppAuth';
import { usePaymentListener } from '@/hooks/usePaymentListener';
import { BottomNavigation, NavigationDestination } from '@/src/shared/components';

const PRIMARY_DESTINATIONS: NavigationDestination[] = [
  { id: 'home', label: 'Home', iconName: 'Home' },
  { id: 'transactions', label: 'Transactions', iconName: 'Receipt' },
  { id: 'budgets', label: 'Budgets', iconName: 'Target' },
  { id: 'analytics', label: 'Analytics', iconName: 'BarChart2' },
  { id: 'more', label: 'More', iconName: 'Menu' },
];

const ROUTE_TO_DESTINATION: Record<string, string> = {
  index: 'home',
  spends: 'transactions',
  budgets: 'budgets',
  insights: 'analytics',
  more: 'more',
  accounts: 'more',
  categories: 'more',
  finances: 'more',
  settings: 'more',
};

const DESTINATION_TO_ROUTE: Record<string, string> = {
  home: 'index',
  transactions: 'spends',
  budgets: 'budgets',
  analytics: 'insights',
  more: 'more',
};

export default function TabLayout() {
  const { user, loading } = useAuth();
  usePaymentListener();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Redirect href="/auth" />;
  }

  return (
    <Tabs
      tabBar={(props) => {
        const currentRouteName = props.state.routes[props.state.index]?.name || 'index';
        const activeDestinationId = ROUTE_TO_DESTINATION[currentRouteName] || 'home';

        return (
          <BottomNavigation
            destinations={PRIMARY_DESTINATIONS}
            activeDestinationId={activeDestinationId}
            onDestinationSelect={(destinationId) => {
              const targetRoute = DESTINATION_TO_ROUTE[destinationId];
              if (targetRoute) {
                props.navigation.navigate(targetRoute);
              }
            }}
          />
        );
      }}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="spends" options={{ title: 'Transactions' }} />
      <Tabs.Screen name="budgets" options={{ title: 'Budgets' }} />
      <Tabs.Screen name="insights" options={{ title: 'Analytics' }} />
      <Tabs.Screen name="more" options={{ title: 'More' }} />
      <Tabs.Screen name="accounts" options={{ title: 'Accounts' }} />
      <Tabs.Screen name="categories" options={{ title: 'Categories' }} />
      <Tabs.Screen name="finances" options={{ title: 'Finances' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
