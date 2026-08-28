import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../../../../../shared/theme';
import { Icon } from '../../../../../shared/components/Icon';

export interface DashboardHeaderProps {
  title?: string;
  selector?: React.ReactNode;
  userAvatarUrl?: string;
  userEmail?: string;
  onAvatarPress?: () => void;
  onNotificationsPress?: () => void;
}

export function DashboardHeader({
  title = 'Home',
  selector,
  userAvatarUrl,
  userEmail,
  onAvatarPress,
  onNotificationsPress,
}: DashboardHeaderProps) {
  const { colors, typography } = useTheme();

  const userInitial = userEmail && userEmail.trim().length > 0
    ? userEmail.trim()[0].toUpperCase()
    : null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surfacePrimary,
          borderBottomColor: colors.borderSubtle,
        },
      ]}
      accessible={true}
      accessibilityRole="header"
    >
      {/* Left Slot: User Avatar / Initial / Fallback Icon */}
      <TouchableOpacity
        onPress={onAvatarPress}
        disabled={!onAvatarPress}
        style={styles.avatarButton}
        accessibilityRole="button"
        accessibilityLabel="User profile avatar"
      >
        {userAvatarUrl ? (
          <Image
            source={{ uri: userAvatarUrl }}
            style={[styles.avatarImage, { borderColor: colors.borderSubtle }]}
          />
        ) : userInitial ? (
          <View style={[styles.avatarBadge, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
            <Text style={[styles.initialText, { color: colors.brandPrimary }]}>
              {userInitial}
            </Text>
          </View>
        ) : (
          <View style={[styles.avatarBadge, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
            <Icon name="User" size={18} color={colors.brandPrimary} />
          </View>
        )}
      </TouchableOpacity>

      {/* Center Slot: Main Title */}
      <View style={styles.titleContainer}>
        <Text
          style={[
            styles.title,
            {
              color: colors.brandPrimary,
              fontSize: typography.title.fontSize,
            },
          ]}
          accessibilityRole="header"
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>

      {/* Right Slot: Period Selector & Notification Bell */}
      <View style={styles.rightActionsContainer}>
        {selector ? <View style={styles.selectorWrapper}>{selector}</View> : null}

        <TouchableOpacity
          onPress={onNotificationsPress}
          disabled={!onNotificationsPress}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
        >
          <Icon name="Bell" size={20} color={colors.brandPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    minHeight: 56,
  },
  avatarButton: {
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
  },
  avatarBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialText: {
    fontSize: 14,
    fontWeight: '700',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  title: {
    fontWeight: '700',
  },
  rightActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectorWrapper: {
    marginRight: 4,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
