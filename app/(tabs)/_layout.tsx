import { useAuth } from '@/contexts/AuthContext';
import { Redirect, Tabs } from 'expo-router';
import { Home, Receipt, Tags, Wallet } from 'lucide-react-native';

export default function TabLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // or a loading screen
  }

  if (!user) {
    return <Redirect href="/auth" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0a0a0a',
          borderTopColor: '#292929',
        },
        tabBarActiveTintColor: '#ff3d3d',
        tabBarInactiveTintColor: '#999999',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          tabBarIcon: ({ color }) => <Tags size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="spends"
        options={{
          title: 'Spends',
          tabBarIcon: ({ color }) => <Receipt size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="finances"
        options={{
          title: 'Finances',
          tabBarIcon: ({ color }) => <Wallet size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
