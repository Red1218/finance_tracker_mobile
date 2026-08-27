import { Theme as ReactNavigationTheme } from '@react-navigation/native';
import { ColorTokens } from './colors';

export type ThemeMode = 'LIGHT' | 'DARK' | 'SYSTEM';
export type ColorSchemeName = 'light' | 'dark';

/**
 * Pure function mapping preference theme mode and system color scheme to effective color scheme.
 */
export function resolveEffectiveColorScheme(
  mode: ThemeMode | null | undefined,
  systemColorScheme: ColorSchemeName | null | undefined
): ColorSchemeName {
  if (mode === 'LIGHT') return 'light';
  if (mode === 'DARK') return 'dark';
  return systemColorScheme === 'dark' ? 'dark' : 'light';
}

/**
 * Derives a React Navigation Theme directly from Finance Tracker ColorTokens.
 * Ensures navigation chrome (header, tab bar, cards, text) matches application styling.
 */
export function createNavigationTheme(
  colorScheme: ColorSchemeName,
  tokens: ColorTokens
): ReactNavigationTheme {
  return {
    dark: colorScheme === 'dark',
    colors: {
      primary: tokens.brandPrimary,
      background: tokens.backgroundPrimary,
      card: tokens.surfacePrimary,
      text: tokens.textPrimary,
      border: tokens.border,
      notification: tokens.brandSecondary,
    },
    fonts: {
      regular: { fontFamily: 'System', fontWeight: '400' },
      medium: { fontFamily: 'System', fontWeight: '500' },
      bold: { fontFamily: 'System', fontWeight: '700' },
      heavy: { fontFamily: 'System', fontWeight: '800' },
    },
  };
}
