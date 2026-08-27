import type { ReactNode } from 'react';
import { AppProvider } from '../providers';
import { ErrorBoundary } from './ErrorBoundary';

export type BootstrapProps = Readonly<{
  children: ReactNode;
  onThemeInitialized?: () => void;
}>;

export function Bootstrap({ children, onThemeInitialized }: BootstrapProps) {
  return (
    <ErrorBoundary>
      <AppProvider onThemeInitialized={onThemeInitialized}>
        {children}
      </AppProvider>
    </ErrorBoundary>
  );
}
