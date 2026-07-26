import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { Theme } from '../../domain';
import { AppearanceViewModel } from '../models/PreferencesViewModel';

interface AppearanceSectionProps {
  viewModel: AppearanceViewModel;
  onThemeChange: (theme: Theme) => void;
  disabled?: boolean;
}

export function AppearanceSection({ viewModel, onThemeChange, disabled }: AppearanceSectionProps) {
  const { colors, spacing, typography, radius } = useTheme();

  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.surfacePrimary, borderRadius: radius.medium, padding: spacing.space16, marginBottom: spacing.space16 }]}>
      <Text style={[{ color: colors.textPrimary, marginBottom: spacing.space12 }, typography.title]}>
        Appearance
      </Text>

      <Text style={[{ color: colors.textSecondary, marginBottom: spacing.space8 }, typography.label]}>
        Theme
      </Text>

      <View style={[styles.segmentedContainer, { backgroundColor: colors.backgroundPrimary, borderRadius: radius.small }]}>
        {[
          { key: Theme.System, label: 'System' },
          { key: Theme.Light, label: 'Light' },
          { key: Theme.Dark, label: 'Dark' },
        ].map((option) => {
          const isSelected = viewModel.theme === option.key;
          return (
            <Pressable
              key={option.key}
              style={[
                styles.segmentButton,
                isSelected && { backgroundColor: colors.surfacePrimary, borderRadius: radius.small },
              ]}
              onPress={() => onThemeChange(option.key)}
              disabled={disabled}
            >
              <Text style={[typography.label, { color: isSelected ? colors.textPrimary : colors.textSecondary }]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: {},
  segmentedContainer: {
    flexDirection: 'row',
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
