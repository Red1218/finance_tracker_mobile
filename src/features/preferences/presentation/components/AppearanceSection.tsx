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
    <View style={[styles.sectionCard, { paddingVertical: spacing.space16, borderBottomWidth: 1, borderBottomColor: colors.divider }]}>
      <Text style={[styles.groupLabel, { color: colors.textSecondary, marginBottom: spacing.space12 }]}>
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
  groupLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
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
