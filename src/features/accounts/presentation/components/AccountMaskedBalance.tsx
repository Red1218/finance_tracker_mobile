import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/src/shared/theme';
import { Icon } from '@/src/shared/components';

export interface AccountMaskedBalanceProps {
  formattedBalance: string;
  initialIsMasked?: boolean;
}

export function AccountMaskedBalance({ formattedBalance, initialIsMasked = false }: AccountMaskedBalanceProps) {
  const [isMasked, setIsMasked] = useState(initialIsMasked);
  const { colors, typography } = useTheme();

  const displayValue = isMasked ? '••••••••' : formattedBalance;

  return (
    <View style={styles.container}>
      <Text style={[styles.balanceText, { color: colors.textPrimary, fontSize: typography.numericLarge.fontSize, fontVariant: ['tabular-nums'] }]}>
        {displayValue}
      </Text>
      <TouchableOpacity
        onPress={() => setIsMasked((prev) => !prev)}
        style={styles.toggleBtn}
        accessibilityRole="button"
        accessibilityLabel={isMasked ? 'Show balance' : 'Hide balance'}
      >
        <Icon name={isMasked ? 'Eye' : 'EyeOff'} size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceText: {
    fontWeight: '700',
  },
  toggleBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
