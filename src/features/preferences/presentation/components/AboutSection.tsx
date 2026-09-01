import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { AboutViewModel } from '../models/PreferencesViewModel';

interface AboutSectionProps {
  viewModel: AboutViewModel;
}

export function AboutSection({ viewModel }: AboutSectionProps) {
  const { colors, spacing, typography } = useTheme();

  return (
    <View style={[styles.sectionCard, { paddingVertical: spacing.space16 }]}>
      <Text style={[styles.groupLabel, { color: colors.textSecondary, marginBottom: spacing.space16 }]}>
        About
      </Text>

      <View style={styles.row}>
        <Text style={[{ color: colors.textSecondary }, typography.body]}>Application Version</Text>
        <Text style={[{ color: colors.textPrimary, fontWeight: 'bold' }, typography.body]}>
          v{viewModel.version} ({viewModel.buildNumber})
        </Text>
      </View>

      <View style={{ height: spacing.space12 }} />

      <View style={styles.row}>
        <Text style={[{ color: colors.textSecondary }, typography.body]}>GitHub Repository</Text>
        <Text style={[{ color: colors.brandPrimary }, typography.caption]}>
          finance_tracker_mobile
        </Text>
      </View>

      <View style={{ height: spacing.space12 }} />

      <View style={styles.row}>
        <Text style={[{ color: colors.textSecondary }, typography.body]}>License</Text>
        <Text style={[{ color: colors.textPrimary }, typography.body]}>
          {viewModel.license}
        </Text>
      </View>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
