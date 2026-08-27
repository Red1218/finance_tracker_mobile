import { darkColors, lightColors, ColorTokens } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';
import { radius } from './radius';
import { shadows } from './shadows';
import { ColorSchemeName } from './themeResolution';

export type Theme = {
  colors: ColorTokens;
  spacing: typeof spacing;
  typography: typeof typography;
  radius: typeof radius;
  shadows: typeof shadows;
  colorScheme: ColorSchemeName;
};

export function getTheme(colorScheme: ColorSchemeName = 'dark'): Theme {
  return {
    colors: colorScheme === 'dark' ? darkColors : lightColors,
    spacing,
    typography,
    radius,
    shadows,
    colorScheme,
  };
}

export const theme = getTheme('dark');
