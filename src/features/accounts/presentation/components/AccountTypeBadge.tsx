import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { AccountTypeKind } from '../../domain';

interface AccountTypeBadgeProps {
  type: AccountTypeKind;
  label: string;
}

export function AccountTypeBadge({ type, label }: AccountTypeBadgeProps) {
  const { colors, typography, radius } = useTheme();

  let bg: string = colors.surfaceSecondary;
  let text: string = colors.textSecondary;

  if (type === AccountTypeKind.Cash) {
    bg = '#e6f4ea';
    text = '#137333';
  } else if (type === AccountTypeKind.Bank) {
    bg = '#e8f0fe';
    text = '#1a73e8';
  } else if (type === AccountTypeKind.CreditCard) {
    bg = '#fce8e6';
    text = '#c5221f';
  } else if (type === AccountTypeKind.Wallet) {
    bg = '#feefc3';
    text = '#b06000';
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg, borderRadius: radius.small }]}>
      <Text style={[typography.caption, { color: text, fontWeight: '600' }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
