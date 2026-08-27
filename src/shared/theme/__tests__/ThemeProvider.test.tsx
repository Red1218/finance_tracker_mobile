import React from 'react';
import { describe, it, expect } from 'vitest';
import { ThemeProvider, useTheme } from '../ThemeProvider';
import { resolveEffectiveColorScheme, createNavigationTheme } from '../themeResolution';
import { getTheme } from '../theme';

describe('ThemeProvider & useTheme', () => {
  it('should instantiate ThemeProvider element and expose useTheme contract', () => {
    const element = React.createElement(ThemeProvider, { initialMode: 'SYSTEM', children: null });
    expect(React.isValidElement(element)).toBe(true);
    expect(useTheme).toBeTypeOf('function');
  });

  it('should resolve effective color schemes accurately', () => {
    expect(resolveEffectiveColorScheme('LIGHT', 'dark')).toBe('light');
    expect(resolveEffectiveColorScheme('DARK', 'light')).toBe('dark');
    expect(resolveEffectiveColorScheme('SYSTEM', 'dark')).toBe('dark');
    expect(resolveEffectiveColorScheme('SYSTEM', 'light')).toBe('light');
  });

  it('should generate theme tokens matching active mode', () => {
    const lightTheme = getTheme('light');
    const darkTheme = getTheme('dark');

    expect(lightTheme.colors.backgroundPrimary).toBe('#F8FAFC');
    expect(darkTheme.colors.backgroundPrimary).toBe('#0F172A');
  });

  it('should generate valid React Navigation themes derived from tokens', () => {
    const darkTheme = getTheme('dark');
    const navTheme = createNavigationTheme('dark', darkTheme.colors);

    expect(navTheme.dark).toBe(true);
    expect(navTheme.colors.background).toBe('#0F172A');
    expect(navTheme.colors.primary).toBe('#2563EB');
    expect(navTheme.fonts).toBeDefined();
  });
});
