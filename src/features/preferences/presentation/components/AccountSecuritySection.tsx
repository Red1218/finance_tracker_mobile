import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { Button } from '../../../../shared/components/Button/Button';

export interface AccountSecuritySectionProps {
  userEmail: string | null;
  onSignOut: () => void;
  disabled?: boolean;
}

export function AccountSecuritySection({
  userEmail,
  onSignOut,
  disabled,
}: AccountSecuritySectionProps) {
  const { colors, spacing, typography } = useTheme();

  return (
    <View
      style={[
        styles.sectionCard,
        {
          paddingVertical: spacing.space16,
          borderBottomWidth: 1,
          borderBottomColor: colors.divider,
        },
      ]}
    >
      <Text style={[styles.groupLabel, { color: colors.textSecondary, marginBottom: spacing.space12 }]}>
        Account & Security
      </Text>

      <Text style={[{ color: colors.textSecondary, marginBottom: spacing.space4 }, typography.caption]}>
        Signed in as
      </Text>

      <Text
        style={[{ color: colors.textPrimary, marginBottom: spacing.space16 }, typography.body]}
        accessibilityLabel={`Signed in email ${userEmail ?? 'Not available'}`}
      >
        {userEmail ?? 'Not available'}
      </Text>

      <Button
        variant="destructive"
        title="Sign Out"
        onPress={onSignOut}
        disabled={disabled}
        accessibilityLabel="Sign Out button"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: {},
  groupLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
