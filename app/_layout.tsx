import "../global.css";
import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, useCallback } from 'react';
import 'react-native-reanimated';

import { useTheme } from '@/src/shared/theme';
import { Bootstrap } from '@/src/bootstrap';
import { NavigationContainer } from '@/src/navigation';
import { OfflineStatusBanner } from '@/src/features/sync/presentation/components/OfflineStatusBanner';
import { NetInfoNetworkStatusProvider } from '@/src/platform/persistence/sync/NetInfoNetworkStatusProvider';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading and theme restoration are complete.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [isThemeInitialized, setIsThemeInitialized] = useState(false);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  const handleThemeInitialized = useCallback(() => {
    setIsThemeInitialized(true);
  }, []);

  useEffect(() => {
    if (fontsLoaded && isThemeInitialized) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, isThemeInitialized]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Bootstrap onThemeInitialized={handleThemeInitialized}>
      <NavigationContainer>
        <RootLayoutNav />
      </NavigationContainer>
    </Bootstrap>
  );
}

function RootLayoutNav() {
  const { navigationTheme } = useTheme();
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const provider = new NetInfoNetworkStatusProvider();
    provider.isOnline().then((online) => setIsOffline(!online));
    const unsubscribe = provider.subscribe((online) => setIsOffline(!online));
    return unsubscribe;
  }, []);

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <OfflineStatusBanner isVisible={isOffline} />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </NavigationThemeProvider>
  );
}
