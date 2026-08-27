import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { Theme as ReactNavigationTheme } from '@react-navigation/native';
import { getTheme, Theme } from './theme';
import {
  ThemeMode,
  ColorSchemeName,
  resolveEffectiveColorScheme,
  createNavigationTheme,
} from './themeResolution';

export type ThemeContextValue = Theme & {
  navigationTheme: ReactNavigationTheme;
  themeMode: ThemeMode;
  effectiveColorScheme: ColorSchemeName;
  setThemeMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export type ThemeProviderProps = Readonly<{
  children: ReactNode;
  initialMode?: ThemeMode;
}>;

export function ThemeProvider({ children, initialMode = 'SYSTEM' }: ThemeProviderProps) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(initialMode);
  const systemColorScheme = useRNColorScheme() as ColorSchemeName | null;

  useEffect(() => {
    if (initialMode && initialMode !== themeMode) {
      setThemeModeState(initialMode);
    }
  }, [initialMode]);

  const effectiveColorScheme = useMemo(() => {
    return resolveEffectiveColorScheme(themeMode, systemColorScheme);
  }, [themeMode, systemColorScheme]);

  const activeTheme = useMemo(() => {
    return getTheme(effectiveColorScheme);
  }, [effectiveColorScheme]);

  const navigationTheme = useMemo(() => {
    return createNavigationTheme(effectiveColorScheme, activeTheme.colors);
  }, [effectiveColorScheme, activeTheme.colors]);

  const contextValue: ThemeContextValue = useMemo(() => {
    return {
      ...activeTheme,
      navigationTheme,
      themeMode,
      effectiveColorScheme,
      setThemeMode: setThemeModeState,
    };
  }, [activeTheme, navigationTheme, themeMode, effectiveColorScheme]);

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider.');
  }
  return context;
}
