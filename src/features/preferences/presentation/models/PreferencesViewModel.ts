import { Theme, WeekStart, DecimalPrecision } from '../../domain';

export interface AppearanceViewModel {
  theme: Theme;
}

export interface FinanceViewModel {
  currencyCode: string;
  weekStart: WeekStart;
  decimalPrecision: DecimalPrecision;
}

export interface DefaultsViewModel {
  defaultExpenseCategoryId: string | null;
  defaultIncomeCategoryId: string | null;
  defaultExpenseCategoryName?: string;
  defaultIncomeCategoryName?: string;
}

export interface NotificationsViewModel {
  budgetAlertsEnabled: boolean;
  dailyReminderEnabled: boolean;
  reminderTime: string | null;
}

export interface AboutViewModel {
  version: string;
  buildNumber: string;
  repositoryUrl: string;
  license: string;
}

export interface PreferencesViewModel {
  appearance: AppearanceViewModel;
  finance: FinanceViewModel;
  defaults: DefaultsViewModel;
  notifications: NotificationsViewModel;
  about: AboutViewModel;
}
