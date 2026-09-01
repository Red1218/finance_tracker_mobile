import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import type { SegmentedControlProps } from './SegmentedControl.types';

export function SegmentedControl({
  options,
  selectedId,
  onChange,
  disabled = false,
  style,
  accessibilityLabel,
}: SegmentedControlProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: colors.surfaceSecondary }, disabled && styles.disabled, style]}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
    >
      {options.map((option) => {
        const isActive = option.id === selectedId;
        return (
          <Pressable
            key={option.id}
            onPress={() => !disabled && onChange(option.id)}
            style={[styles.segment, isActive && { backgroundColor: colors.surfaceElevated }]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={option.accessibilityLabel || option.label}
            disabled={disabled}
          >
            <Text
              style={[
                styles.segmentText,
                {
                  color: isActive ? colors.textPrimary : colors.textSecondary,
                  fontWeight: isActive ? '700' : '500',
                },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    height: 48,
  },
  segment: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    minHeight: 40,
  },
  segmentText: {
    fontSize: 13,
  },
  disabled: {
    opacity: 0.5,
  },
});
