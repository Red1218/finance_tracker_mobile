import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { Icon } from '../../../../shared/components/Icon';

export interface OfflineStatusBannerProps {
  readonly isVisible: boolean;
}

export function OfflineStatusBanner({ isVisible }: OfflineStatusBannerProps) {
  const { colors, typography } = useTheme();

  if (!isVisible) return null;

  return (
    <View style={styles.overlayWrapper} pointerEvents="none">
      <View
        style={[styles.bannerContainer, { backgroundColor: colors.warning }]}
        accessibilityRole="alert"
        accessibilityLiveRegion="assertive"
      >
        <Icon name="WifiOff" size="sm" color={colors.surfacePrimary} />
        <Text style={[styles.bannerText, { color: colors.surfacePrimary, fontSize: typography.caption.fontSize }]}>
          Operating Offline — Changes will sync when connected
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  bannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  bannerText: {
    fontWeight: '600',
  },
});
