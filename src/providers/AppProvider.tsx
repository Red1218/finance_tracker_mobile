import type { ComponentType, ReactNode } from 'react';
import { ReactQueryProvider } from './ReactQueryProvider';
import { ThemeProvider } from '../shared/theme';

/**
 * Ordered list of providers wrapping the application.
 * Providers are composed outside-in (first item wraps the second item, etc).
 * This makes it easy to insert new providers (e.g., ThemeProvider) without refactoring.
 */
const providers: readonly ComponentType<{ children: ReactNode }>[] = Object.freeze([
  ThemeProvider,
  ReactQueryProvider,
]);

export type AppProviderProps = Readonly<{
  children: ReactNode;
}>;

export function AppProvider({ children }: AppProviderProps) {
  return providers.reduceRight(
    (acc, Provider) => <Provider>{acc}</Provider>,
    <>{children}</>
  );
}
