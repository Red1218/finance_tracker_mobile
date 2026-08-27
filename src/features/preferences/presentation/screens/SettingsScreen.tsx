import React from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { PreferencesModule } from '../../composition/PreferencesModule';
import { usePreferences } from '../hooks/usePreferences';
import { useUpdatePreference } from '../hooks/useUpdatePreference';
import { useNotificationPermission } from '../hooks/useNotificationPermission';
import { AppearanceSection } from '../components/AppearanceSection';
import { FinanceSection } from '../components/FinanceSection';
import { DefaultsSection } from '../components/DefaultsSection';
import { NotificationPreferencesSection } from '../components/NotificationPreferencesSection';
import { BackupRestoreSection } from '../../../backup/presentation/components/BackupRestoreSection';
import { SyncStatusSection } from '../../../sync/presentation/components/SyncStatusSection';
import { AboutSection } from '../components/AboutSection';
import { SyncModule, syncModule as defaultSyncModule } from '../../../sync/composition/SyncModule';
import { useSync } from '../../../sync/presentation/hooks/useSync';

interface SettingsScreenProps {
  module?: PreferencesModule;
  syncModule?: SyncModule;
}

const defaultModule = new PreferencesModule();

export function SettingsScreen({
  module = defaultModule,
  syncModule = defaultSyncModule,
}: SettingsScreenProps) {
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

  // Real Clean Architecture Sync hook
  const { viewModel: syncViewModel, isSyncing, error: syncError, triggerSync } = useSync(
    syncModule.syncController
  );

  // Real Clean Architecture Notification Permission hook (consuming controller/application boundary)
  const { permissionState, requestPermission, openSystemSettings } = useNotificationPermission(module.controller);

  const handleBackupNotice = (actionType: 'export' | 'restore') => {
    Alert.alert(
      'Backup & Restore Deferred',
      `Platform encryption and file providers are ready, but automated database ${actionType} orchestration is deferred for an upcoming phase.`,
      [{ text: 'OK' }]
    );
  };

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

      {/* 4. Notification Preferences Section (Real Application & Infrastructure Flow) */}
      <NotificationPreferencesSection
        viewModel={{
          billRemindersEnabled: viewModel.notifications.dailyReminderEnabled,
          billReminderLeadTimeDays: 3,
          budgetAlertsEnabled: viewModel.notifications.budgetAlertsEnabled,
          dailyDigestEnabled: viewModel.notifications.dailyReminderEnabled,
          dailyDigestTime: viewModel.notifications.reminderTime ?? '20:00',
          permissionState,
        }}
        onToggleBillReminders={(enabled) =>
          updateNotificationSettings({
            budgetAlertsEnabled: viewModel.notifications.budgetAlertsEnabled,
            dailyReminderEnabled: enabled,
            reminderTime: viewModel.notifications.reminderTime ?? '20:00',
          })
        }
        onChangeLeadTimeDays={() => {}}
        onToggleBudgetAlerts={(enabled) =>
          updateNotificationSettings({
            budgetAlertsEnabled: enabled,
            dailyReminderEnabled: viewModel.notifications.dailyReminderEnabled,
            reminderTime: viewModel.notifications.reminderTime,
          })
        }
        onToggleDailyDigest={(enabled) =>
          updateNotificationSettings({
            budgetAlertsEnabled: viewModel.notifications.budgetAlertsEnabled,
            dailyReminderEnabled: enabled,
            reminderTime: viewModel.notifications.reminderTime ?? '20:00',
          })
        }
        onChangeDigestTime={(time) =>
          updateNotificationSettings({
            budgetAlertsEnabled: viewModel.notifications.budgetAlertsEnabled,
            dailyReminderEnabled: true,
            reminderTime: time,
          })
        }
        onRequestPermission={requestPermission}
        onOpenSystemSettings={openSystemSettings}
      />

      {/* 5. Data & Backup Section (Explicit Deferred Boundary) */}
      <BackupRestoreSection
        onExportPress={() => handleBackupNotice('export')}
        onRestorePress={() => handleBackupNotice('restore')}
        isExporting={false}
        isRestoring={false}
      />

      {/* 6. Network & Synchronization Section (Real Application & Controller Flow) */}
      <SyncStatusSection
        viewModel={syncViewModel}
        isSyncing={isSyncing}
        error={syncError}
        onManualSyncPress={triggerSync}
      />

      {/* About Section */}
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
