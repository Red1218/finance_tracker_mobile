import React from 'react';
import { View, Text, StyleSheet, Switch, Pressable } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { NotificationsViewModel } from '../models/PreferencesViewModel';

interface NotificationSectionProps {
  viewModel: NotificationsViewModel;
  onUpdateNotifications: (data: {
    budgetAlertsEnabled: boolean;
    dailyReminderEnabled: boolean;
    reminderTime?: string | null;
  }) => void;
  disabled?: boolean;
}

const TIME_OPTIONS = ['08:00', '09:00', '12:00', '18:00', '20:00', '21:00'];

export function NotificationSection({
  viewModel,
  onUpdateNotifications,
  disabled,
}: NotificationSectionProps) {
  const { colors, spacing, typography, radius } = useTheme();

  const handleToggleBudgetAlerts = (value: boolean) => {
    onUpdateNotifications({
      budgetAlertsEnabled: value,
      dailyReminderEnabled: viewModel.dailyReminderEnabled,
      reminderTime: viewModel.reminderTime,
    });
  };

  const handleToggleDailyReminder = (value: boolean) => {
    onUpdateNotifications({
      budgetAlertsEnabled: viewModel.budgetAlertsEnabled,
      dailyReminderEnabled: value,
      reminderTime: value ? (viewModel.reminderTime ?? '20:00') : null,
    });
  };

  const handleTimeSelect = (time: string) => {
    onUpdateNotifications({
      budgetAlertsEnabled: viewModel.budgetAlertsEnabled,
      dailyReminderEnabled: true,
      reminderTime: time,
    });
  };

  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.surfacePrimary, borderRadius: radius.medium, padding: spacing.space16, marginBottom: spacing.space16 }]}>
      <Text style={[{ color: colors.textPrimary, marginBottom: spacing.space16 }, typography.title]}>
        Notifications
      </Text>

      {/* Budget Alerts Toggle */}
      <View style={styles.row}>
        <View style={styles.textContainer}>
          <Text style={[{ color: colors.textPrimary }, typography.body]}>Budget Alerts</Text>
          <Text style={[{ color: colors.textSecondary }, typography.caption]}>
            Receive notifications when spending reaches budget thresholds
          </Text>
        </View>
        <Switch
          value={viewModel.budgetAlertsEnabled}
          onValueChange={handleToggleBudgetAlerts}
          disabled={disabled}
        />
      </View>

      <View style={{ height: spacing.space16 }} />

      {/* Daily Reminder Toggle */}
      <View style={styles.row}>
        <View style={styles.textContainer}>
          <Text style={[{ color: colors.textPrimary }, typography.body]}>Daily Reminder</Text>
          <Text style={[{ color: colors.textSecondary }, typography.caption]}>
            Receive a daily reminder to log your transactions
          </Text>
        </View>
        <Switch
          value={viewModel.dailyReminderEnabled}
          onValueChange={handleToggleDailyReminder}
          disabled={disabled}
        />
      </View>

      {/* Reminder Time Picker when Daily Reminder is enabled */}
      {viewModel.dailyReminderEnabled && (
        <View style={{ marginTop: spacing.space16 }}>
          <Text style={[{ color: colors.textSecondary, marginBottom: spacing.space8 }, typography.label]}>
            Reminder Time
          </Text>
          <View style={styles.chipRow}>
            {TIME_OPTIONS.map((time) => {
              const isSelected = viewModel.reminderTime === time;
              return (
                <Pressable
                  key={time}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? colors.brandPrimary : colors.backgroundPrimary,
                      borderRadius: radius.small,
                      paddingHorizontal: spacing.space12,
                      paddingVertical: spacing.space8,
                    },
                  ]}
                  onPress={() => handleTimeSelect(time)}
                  disabled={disabled}
                >
                  <Text style={[typography.caption, { color: isSelected ? '#fff' : colors.textPrimary }]}>
                    {time}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
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
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 4,
  },
});
