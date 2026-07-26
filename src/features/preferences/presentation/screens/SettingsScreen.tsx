import React from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { PreferencesModule } from '../../composition/PreferencesModule';
import { usePreferences } from '../hooks/usePreferences';
import { useUpdatePreference } from '../hooks/useUpdatePreference';
import { AppearanceSection } from '../components/AppearanceSection';
import { FinanceSection } from '../components/FinanceSection';
import { DefaultsSection } from '../components/DefaultsSection';
import { NotificationSection } from '../components/NotificationSection';
import { AboutSection } from '../components/AboutSection';

interface SettingsScreenProps {
  module?: PreferencesModule;
}

const defaultModule = new PreferencesModule();

export function SettingsScreen({ module = defaultModule }: SettingsScreenProps) {
  const { colors, spacing, typography } = useTheme();

  const { viewModel, categories, isLoading, error, refresh } = usePreferences(
    module.controller
  );

  const {
    isUpdating,
    updateError,
    updateTheme,
    updateWeekStart,
    updateDecimalPrecision,
    updateDefaultExpenseCategory,
    updateDefaultIncomeCategory,
    updateNotificationSettings,
  } = useUpdatePreference(
    module.controller,
    refresh
  );

  if (isLoading && !viewModel) {
    return (
      <View style={[styles.centeredContainer, { backgroundColor: colors.backgroundPrimary }]}>
        <ActivityIndicator size="large" color={colors.brandPrimary} />
      </View>
    );
  }

  if (error || !viewModel) {
    return (
      <View style={[styles.centeredContainer, { backgroundColor: colors.backgroundPrimary }]}>
        <Text style={[{ color: colors.error, marginBottom: spacing.space16 }, typography.body]}>
          {error ?? 'Failed to load preferences.'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}
      contentContainerStyle={{ padding: spacing.space16 }}
    >
      <Text style={[{ color: colors.textPrimary, marginBottom: spacing.space20 }, typography.heading]}>
        Settings
      </Text>

      {updateError && (
        <View style={[styles.errorCard, { backgroundColor: colors.surfaceSecondary, marginBottom: spacing.space16 }]}>
          <Text style={[{ color: colors.error }, typography.caption]}>{updateError}</Text>
        </View>
      )}

      {/* 1. Appearance Section */}
      <AppearanceSection
        viewModel={viewModel.appearance}
        onThemeChange={updateTheme}
        disabled={isUpdating}
      />

      {/* 2. Finance Section */}
      <FinanceSection
        viewModel={viewModel.finance}
        onWeekStartChange={updateWeekStart}
        onDecimalPrecisionChange={updateDecimalPrecision}
        disabled={isUpdating}
      />

      {/* 3. Defaults Section */}
      <DefaultsSection
        viewModel={viewModel.defaults}
        categories={categories}
        onSelectDefaultExpenseCategory={updateDefaultExpenseCategory}
        onSelectDefaultIncomeCategory={updateDefaultIncomeCategory}
        disabled={isUpdating}
      />

      {/* 4. Notifications Section */}
      <NotificationSection
        viewModel={viewModel.notifications}
        onUpdateNotifications={updateNotificationSettings}
        disabled={isUpdating}
      />

      {/* 5. About Section */}
      <AboutSection viewModel={viewModel.about} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorCard: {
    padding: 12,
    borderRadius: 8,
  },
});
