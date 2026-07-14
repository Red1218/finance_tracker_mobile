import type { ReactNode } from 'react';
import { AppState, Platform } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';

import { AuthProvider } from '@/src/features/identity/hooks/AuthProvider';
import { AuthService } from '@/src/features/identity/services/AuthService';

type AppProviderProps = Readonly<{
  children: ReactNode;
}>;

const queryClient = new QueryClient();

export function AppProvider({ children }: AppProviderProps) {
  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    AuthService.startAutoRefresh();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        AuthService.startAutoRefresh();
        return;
      }

      AuthService.stopAutoRefresh();
    });

    return () => {
      subscription.remove();
      AuthService.stopAutoRefresh();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
