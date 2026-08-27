import React, { useState, useEffect, ReactNode } from 'react';
import { ThemeProvider, ThemeMode } from '../shared/theme';
import { authModule as defaultAuthModule, AuthModule } from '../features/auth/composition/AuthModule';
import { PreferencesModule } from '../features/preferences/composition/PreferencesModule';

export type AppThemeProviderProps = Readonly<{
  children: ReactNode;
  authModule?: AuthModule;
  preferencesModule?: PreferencesModule;
  onInitialized?: () => void;
}>;

const defaultPreferencesModule = new PreferencesModule();

export function AppThemeProvider({
  children,
  authModule = defaultAuthModule,
  preferencesModule = defaultPreferencesModule,
  onInitialized,
}: AppThemeProviderProps) {
  const [initialMode, setInitialMode] = useState<ThemeMode>('SYSTEM');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapTheme() {
      try {
        const session = await authModule.getSessionUseCase.execute();
        if (session && session.isAuthenticated && session.userId) {
          const preferencesDto = await preferencesModule.initializePreferencesUseCase.execute(session.userId);
          if (isMounted && preferencesDto && preferencesDto.theme) {
            const loadedMode = preferencesDto.theme as ThemeMode;
            if (['LIGHT', 'DARK', 'SYSTEM'].includes(loadedMode)) {
              setInitialMode(loadedMode);
            }
          }
        }
      } catch {
        // Fallback to SYSTEM on any error
      } finally {
        if (isMounted) {
          setIsInitialized(true);
          onInitialized?.();
        }
      }
    }

    bootstrapTheme();

    return () => {
      isMounted = false;
    };
  }, [authModule, preferencesModule, onInitialized]);

  if (!isInitialized) {
    return null;
  }

  return (
    <ThemeProvider initialMode={initialMode}>
      {children}
    </ThemeProvider>
  );
}
