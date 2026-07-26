import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { AccountViewModelMapper } from '../mappers/AccountViewModelMapper';

interface BalanceCardProps {
  totalBalance: number;
  currencyCode?: string;
  activeAccountsCount: number;
}

export function BalanceCard({ totalBalance, currencyCode = 'INR', activeAccountsCount }: BalanceCardProps) {
  const { colors, spacing, typography, radius } = useTheme();

  const formattedTotal = AccountViewModelMapper.formatCurrency(totalBalance, currencyCode);

  return (
    <View style={[styles.card, { backgroundColor: colors.surfacePrimary, borderRadius: radius.medium, padding: spacing.space20, marginBottom: spacing.space16 }]}>
      <Text style={[{ color: colors.textSecondary, marginBottom: spacing.space8 }, typography.label]}>
        Total Net Worth ({activeAccountsCount} {activeAccountsCount === 1 ? 'account' : 'accounts'})
      </Text>
      <Text style={[{ color: colors.textPrimary, fontWeight: 'bold' }, typography.display]}>
        {formattedTotal}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
});
