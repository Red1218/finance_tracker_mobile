import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../../shared/theme';

export function DefaultAccountBadge() {
  const { colors, typography, radius } = useTheme();

  return (
    <View style={[styles.badge, { backgroundColor: colors.brandPrimary, borderRadius: radius.small }]}>
      <Text style={[typography.caption, { color: '#ffffff', fontWeight: 'bold' }]}>Default</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
