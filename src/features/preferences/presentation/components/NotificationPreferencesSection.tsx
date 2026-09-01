import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { Icon } from '../../../../shared/components/Icon';
import { PermissionStatus } from '../../application/ports/INotificationPermissionPort';

export interface NotificationPreferencesSectionProps {
  readonly viewModel: {
    readonly billRemindersEnabled: boolean;
    readonly billReminderLeadTimeDays: 1 | 3 | 7;
    readonly budgetAlertsEnabled: boolean;
    readonly dailyDigestEnabled: boolean;
    readonly dailyDigestTime: string;
    readonly permissionState: PermissionStatus;
  };
  readonly onToggleBillReminders: (enabled: boolean) => void;
  readonly onChangeLeadTimeDays: (days: 1 | 3 | 7) => void;
  readonly onToggleBudgetAlerts: (enabled: boolean) => void;
  readonly onToggleDailyDigest: (enabled: boolean) => void;
  readonly onChangeDigestTime: (time: string) => void;
  readonly onRequestPermission: () => void;
  readonly onOpenSystemSettings: () => void;
}

export function NotificationPreferencesSection({
  viewModel,
  onToggleBillReminders,
  onChangeLeadTimeDays,
  onToggleBudgetAlerts,
  onToggleDailyDigest,
  onRequestPermission,
  onOpenSystemSettings,
}: NotificationPreferencesSectionProps) {
  const { colors, spacing, typography } = useTheme();

  return (
    <View style={[styles.cardContainer, { paddingVertical: spacing.space16, borderBottomWidth: 1, borderBottomColor: colors.divider }]}>
      <Text
        style={[styles.groupLabel, { color: colors.textSecondary, marginBottom: spacing.space16 }]}
        accessibilityRole="header"
      >
        Notifications & Alerts
      </Text>

      {viewModel.permissionState === 'DENIED' && (
        <View style={[styles.warningCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.warning }]}>
          <Icon name="AlertTriangle" size="sm" color={colors.warning} />
          <Text style={[styles.warningText, { color: colors.textPrimary, fontSize: typography.caption.fontSize }]}>
            Notifications are disabled in system settings.
          </Text>
          <TouchableOpacity onPress={onOpenSystemSettings} accessibilityRole="button">
            <Text style={[styles.linkText, { color: colors.brandPrimary, fontSize: typography.caption.fontSize }]}>
              Open Settings
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {viewModel.permissionState === 'NOT_REQUESTED' && (
        <TouchableOpacity
          style={[styles.permissionButton, { backgroundColor: colors.brandPrimary }]}
          onPress={onRequestPermission}
          accessibilityRole="button"
        >
          <Text style={[styles.permissionButtonText, { color: colors.textPrimary, fontSize: typography.body.fontSize }]}>
            Enable Notifications
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.row}>
        <View style={styles.labelContainer}>
          <Text style={[styles.rowLabel, { color: colors.textPrimary, fontSize: typography.body.fontSize }]}>
            Bill Due Reminders
          </Text>
          <Text style={[styles.rowSubLabel, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
            Receive notifications before bill due dates
          </Text>
        </View>
        <Switch
          value={viewModel.billRemindersEnabled}
          onValueChange={onToggleBillReminders}
          trackColor={{ false: colors.borderSubtle, true: colors.brandPrimary }}
          accessibilityRole="switch"
        />
      </View>

      {viewModel.billRemindersEnabled && (
        <View style={styles.leadTimeRow}>
          <Text style={[styles.leadTimeLabel, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
            Reminder Lead Time:
          </Text>
          <View style={styles.pillContainer} accessibilityRole="radiogroup">
            {([1, 3, 7] as const).map((days) => (
              <TouchableOpacity
                key={days}
                style={[
                  styles.pill,
                  { borderColor: colors.borderSubtle },
                  viewModel.billReminderLeadTimeDays === days && { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
                ]}
                onPress={() => onChangeLeadTimeDays(days)}
                accessibilityRole="radio"
                accessibilityState={{ selected: viewModel.billReminderLeadTimeDays === days }}
              >
                <Text
                  style={[
                    styles.pillText,
                    { color: viewModel.billReminderLeadTimeDays === days ? colors.textPrimary : colors.textSecondary, fontSize: typography.caption.fontSize },
                  ]}
                >
                  {days}d before
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

      <View style={styles.row}>
        <View style={styles.labelContainer}>
          <Text style={[styles.rowLabel, { color: colors.textPrimary, fontSize: typography.body.fontSize }]}>
            Budget Threshold Alerts
          </Text>
          <Text style={[styles.rowSubLabel, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
            Alert when spending reaches 80% and 100%
          </Text>
        </View>
        <Switch
          value={viewModel.budgetAlertsEnabled}
          onValueChange={onToggleBudgetAlerts}
          trackColor={{ false: colors.borderSubtle, true: colors.brandPrimary }}
          accessibilityRole="switch"
        />
      </View>

      <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

      <View style={styles.row}>
        <View style={styles.labelContainer}>
          <Text style={[styles.rowLabel, { color: colors.textPrimary, fontSize: typography.body.fontSize }]}>
            Daily Digest
          </Text>
          <Text style={[styles.rowSubLabel, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
            Today's spending summary + bills due in 48h
          </Text>
        </View>
        <Switch
          value={viewModel.dailyDigestEnabled}
          onValueChange={onToggleDailyDigest}
          trackColor={{ false: colors.borderSubtle, true: colors.brandPrimary }}
          accessibilityRole="switch"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {},
  groupLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  warningText: {
    flex: 1,
  },
  linkText: {
    fontWeight: '600',
  },
  permissionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  permissionButtonText: {
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  labelContainer: {
    flex: 1,
    marginRight: 12,
  },
  rowLabel: {
    fontWeight: '600',
  },
  rowSubLabel: {
    marginTop: 2,
  },
  leadTimeRow: {
    marginTop: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leadTimeLabel: {
    fontWeight: '500',
  },
  pillContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
  },
  pillText: {
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
});
