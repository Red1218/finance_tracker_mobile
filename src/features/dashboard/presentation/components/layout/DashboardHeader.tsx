import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../../../shared/theme';

interface DashboardHeaderProps {
  title: string;
  selector: React.ReactNode;
}

export function DashboardHeader({ title, selector }: DashboardHeaderProps) {
  const { colors, typography } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.backgroundPrimary,
          borderBottomColor: colors.borderSubtle,
        },
      ]}
      accessible={true}
      accessibilityRole="header"
    >
      <Text
        style={[
          styles.title,
          {
            color: colors.textPrimary,
            fontSize: typography.heading.fontSize,
          },
        ]}
        accessibilityRole="header"
      >
        {title}
      </Text>
      <View style={styles.selectorContainer}>{selector}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontWeight: '700',
  },
  selectorContainer: {
    minWidth: 120,
  },
});
