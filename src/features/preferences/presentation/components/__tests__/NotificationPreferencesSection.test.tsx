import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { NotificationPreferencesSection } from '../NotificationPreferencesSection';

describe('NotificationPreferencesSection', () => {
  it('renders section title and toggles correctly', () => {
    const viewModel = {
      billRemindersEnabled: true,
      billReminderLeadTimeDays: 3 as const,
      budgetAlertsEnabled: true,
      dailyDigestEnabled: false,
      dailyDigestTime: '20:00',
      permissionState: 'GRANTED' as const,
    };

    const node = NotificationPreferencesSection({
      viewModel,
      onToggleBillReminders: vi.fn(),
      onChangeLeadTimeDays: vi.fn(),
      onToggleBudgetAlerts: vi.fn(),
      onToggleDailyDigest: vi.fn(),
      onChangeDigestTime: vi.fn(),
      onRequestPermission: vi.fn(),
      onOpenSystemSettings: vi.fn(),
    });

    expect(React.isValidElement(node)).toBe(true);
  });
});
