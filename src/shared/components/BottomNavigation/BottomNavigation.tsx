import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { Icon } from '../Icon';
import type { BottomNavigationProps } from './BottomNavigation.types';

export function BottomNavigation({
  destinations,
  activeDestinationId,
  onDestinationSelect,
  style,
}: BottomNavigationProps) {
  const { colors, spacing, typography } = useTheme();

  const containerStyle: ViewStyle = {
    backgroundColor: colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingVertical: spacing.space8,
    paddingHorizontal: spacing.space8,
  };

  return (
    <View style={[styles.container, containerStyle, style]} accessible={true} accessibilityRole="tablist">
      {destinations.map((dest) => {
        const isActive = dest.id === activeDestinationId;
        const tintColor = isActive ? colors.brandPrimary : colors.textSecondary;

        return (
          <TouchableOpacity
            key={dest.id}
            onPress={() => onDestinationSelect(dest.id)}
            disabled={dest.disabled}
            style={styles.tabItem}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive, disabled: !!dest.disabled }}
            accessibilityLabel={dest.label}
          >
            <View style={styles.iconContainer}>
              <Icon name={dest.iconName} size={24} color={tintColor} />
              {dest.badgeCount && dest.badgeCount > 0 ? (
                <View style={[styles.badge, { backgroundColor: colors.error }]}>
                  <Text style={styles.badgeText}>{dest.badgeCount > 99 ? '99+' : dest.badgeCount}</Text>
                </View>
              ) : null}
            </View>
            <Text
              style={[
                styles.label,
                {
                  color: tintColor,
                  fontSize: typography.caption.fontSize,
                  fontWeight: isActive ? '600' : '400',
                },
              ]}
              numberOfLines={1}
            >
              {dest.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    minHeight: 56,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingVertical: 4,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 2,
  },
  label: {
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
});
