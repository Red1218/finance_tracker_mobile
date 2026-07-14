import type { ReactNode } from 'react';
import { AppProvider } from '../../providers';
import { ErrorBoundary } from './ErrorBoundary';

export type BootstrapProps = Readonly<{
  children: ReactNode;
}>;

export function Bootstrap({ children }: BootstrapProps) {
  return (
    <ErrorBoundary>
      <AppProvider>
        {children}
      </AppProvider>
    </ErrorBoundary>
  );
}
