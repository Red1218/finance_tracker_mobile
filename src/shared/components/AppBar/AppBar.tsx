import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { Icon } from '../Icon';
import type { AppBarProps } from './AppBar.types';

const LEADING_ACTION_ID = '__leading__';

export function AppBar({ title, subtitle, leadingAction, trailingActions = [], style }: AppBarProps) {
  const { colors, spacing, typography } = useTheme();
  const [focusedActionId, setFocusedActionId] = useState<string | null>(null);

  const focusRingStyle = (id: string): ViewStyle | null =>
    focusedActionId === id
      ? { outlineWidth: 2, outlineColor: colors.focus, outlineStyle: 'solid', outlineOffset: 2 }
      : null;

  const containerStyle: ViewStyle = {
    backgroundColor: colors.surfacePrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.space16,
    paddingVertical: spacing.space12,
  };

  return (
    <View style={[styles.container, containerStyle, style]} accessible={true} accessibilityRole="header">
      <View style={styles.leftContainer}>
        {leadingAction ? (
          <TouchableOpacity
            onPress={leadingAction.onPress}
            disabled={leadingAction.disabled}
            style={[styles.actionButton, focusRingStyle(LEADING_ACTION_ID)]}
            accessibilityRole="button"
            accessibilityLabel={leadingAction.label}
            onFocus={() => setFocusedActionId(LEADING_ACTION_ID)}
            onBlur={() => setFocusedActionId((current) => (current === LEADING_ACTION_ID ? null : current))}
          >
            <Icon name={leadingAction.iconName} size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : null}

        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.textPrimary, fontSize: typography.title.fontSize }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      {trailingActions.length > 0 ? (
        <View style={styles.rightContainer}>
          {trailingActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              onPress={action.onPress}
              disabled={action.disabled}
              style={[styles.actionButton, focusRingStyle(action.id)]}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              onFocus={() => setFocusedActionId(action.id)}
              onBlur={() => setFocusedActionId((current) => (current === action.id ? null : current))}
            >
              <Icon name={action.iconName} size={24} color={colors.textPrimary} />
              {action.badgeCount && action.badgeCount > 0 ? (
                <View style={[styles.badge, { backgroundColor: colors.error }]}>
                  <Text style={styles.badgeText}>{action.badgeCount > 99 ? '99+' : action.badgeCount}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 2,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
