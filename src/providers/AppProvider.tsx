import React, { ReactNode } from 'react';
import { ReactQueryProvider } from './ReactQueryProvider';
import { AppThemeProvider } from './AppThemeProvider';
import { AuthSessionProvider } from './AuthSessionProvider';

export type AppProviderProps = Readonly<{
  children: ReactNode;
  onThemeInitialized?: () => void;
}>;

export function AppProvider({ children, onThemeInitialized }: AppProviderProps) {
  return (
    <AuthSessionProvider>
      <AppThemeProvider onInitialized={onThemeInitialized}>
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
      </AppThemeProvider>
    </AuthSessionProvider>
  );
}
