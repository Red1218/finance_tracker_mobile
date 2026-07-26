import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { AboutViewModel } from '../models/PreferencesViewModel';

interface AboutSectionProps {
  viewModel: AboutViewModel;
}

export function AboutSection({ viewModel }: AboutSectionProps) {
  const { colors, spacing, typography, radius } = useTheme();

  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.surfacePrimary, borderRadius: radius.medium, padding: spacing.space16, marginBottom: spacing.space16 }]}>
      <Text style={[{ color: colors.textPrimary, marginBottom: spacing.space16 }, typography.title]}>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
