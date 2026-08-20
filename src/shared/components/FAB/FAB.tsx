import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { Icon } from '../Icon';
import type { FABProps } from './FAB.types';

export function FAB({
  iconName,
  label,
  onPress,
  variant = 'standard',
  visible = true,
  disabled = false,
  style,
  accessibilityLabel,
}: FABProps) {
  const { colors, radius, shadows, spacing, typography } = useTheme();

  if (!visible) return null;

  const isExtended = variant === 'extended';
  const isMini = variant === 'mini';

  const iconSize = isMini ? 18 : 24;

  const containerStyle: ViewStyle = {
    backgroundColor: disabled ? colors.disabled : colors.brandPrimary,
    borderRadius: radius.pill,
    paddingHorizontal: isExtended ? spacing.space20 : isMini ? spacing.space12 : spacing.space16,
    paddingVertical: isMini ? spacing.space12 : spacing.space16,
    minWidth: isMini ? 40 : 56,
    minHeight: isMini ? 40 : 56,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.space8,
    ...shadows.large,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[containerStyle, style]}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      accessibilityLabel={accessibilityLabel || label || 'Action'}
    >
      <Icon name={iconName} size={iconSize} color="#FFFFFF" />
      {isExtended && label ? (
        <Text style={[styles.label, { color: '#FFFFFF', fontSize: typography.label.fontSize }]}>
          {label}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  label: {
    fontWeight: '600',
  },
});
