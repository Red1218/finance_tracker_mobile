import { describe, it, expect } from 'vitest';
import { resolveEffectiveColorScheme, createNavigationTheme } from '../themeResolution';
import { lightColors, darkColors } from '../colors';

describe('themeResolution', () => {
  describe('resolveEffectiveColorScheme', () => {
    it('should return light when mode is LIGHT regardless of OS dark setting', () => {
      expect(resolveEffectiveColorScheme('LIGHT', 'dark')).toBe('light');
    });

    it('should return dark when mode is DARK regardless of OS light setting', () => {
      expect(resolveEffectiveColorScheme('DARK', 'light')).toBe('dark');
    });

    it('should return dark when mode is SYSTEM and OS scheme is dark', () => {
      expect(resolveEffectiveColorScheme('SYSTEM', 'dark')).toBe('dark');
    });

    it('should return light when mode is SYSTEM and OS scheme is light', () => {
      expect(resolveEffectiveColorScheme('SYSTEM', 'light')).toBe('light');
    });

    it('should fallback to light when mode is SYSTEM and OS scheme is null or undefined', () => {
      expect(resolveEffectiveColorScheme('SYSTEM', null)).toBe('light');
      expect(resolveEffectiveColorScheme('SYSTEM', undefined)).toBe('light');
      expect(resolveEffectiveColorScheme(null, undefined)).toBe('light');
    });
  });

  describe('createNavigationTheme', () => {
    it('should derive React Navigation theme directly from Finance Tracker darkColors', () => {
      const navTheme = createNavigationTheme('dark', darkColors);
      expect(navTheme.dark).toBe(true);
      expect(navTheme.colors.background).toBe(darkColors.backgroundPrimary);
      expect(navTheme.colors.card).toBe(darkColors.surfacePrimary);
      expect(navTheme.colors.text).toBe(darkColors.textPrimary);
      expect(navTheme.colors.primary).toBe(darkColors.brandPrimary);
      expect(navTheme.colors.border).toBe(darkColors.border);
    });

    it('should derive React Navigation theme directly from Finance Tracker lightColors', () => {
      const navTheme = createNavigationTheme('light', lightColors);
      expect(navTheme.dark).toBe(false);
      expect(navTheme.colors.background).toBe(lightColors.backgroundPrimary);
      expect(navTheme.colors.card).toBe(lightColors.surfacePrimary);
      expect(navTheme.colors.text).toBe(lightColors.textPrimary);
      expect(navTheme.colors.primary).toBe(lightColors.brandPrimary);
      expect(navTheme.colors.border).toBe(lightColors.border);
    });
  });
});
