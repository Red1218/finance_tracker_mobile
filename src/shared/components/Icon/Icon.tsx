import React from 'react';
import * as LucideIcons from 'lucide-react-native';
import { useTheme } from '../../theme';
import type { IconProps, IconSize } from './Icon.types';

const sizeMap: Record<'sm' | 'md' | 'lg', number> = {
  sm: 16,
  md: 24,
  lg: 32,
};

export function Icon({ name, size = 'md', color, style, accessibilityLabel }: IconProps) {
  const { colors } = useTheme();

  const numericSize = typeof size === 'number' ? size : sizeMap[size] || 24;
  const iconColor = color || colors.textPrimary;

  const lucideMap = LucideIcons as unknown as Record<
    string,
    React.ComponentType<{ size?: number; color?: string; style?: unknown; accessible?: boolean; accessibilityLabel?: string }>
  >;

  const IconComponent = lucideMap[name] || LucideIcons.HelpCircle;

  return (
    <IconComponent
      size={numericSize}
      color={iconColor}
      style={style}
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
    />
  );
}
