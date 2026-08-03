import { PreferencesId } from '../value-objects/PreferencesId';
import { AppearanceSettings } from '../value-objects/AppearanceSettings';
import { FinanceSettings } from '../value-objects/FinanceSettings';
import { DefaultSettings } from '../value-objects/DefaultSettings';
import { NotificationSettings } from '../value-objects/NotificationSettings';
import { Theme } from '../value-objects/Theme';
import { CurrencyCode } from '../value-objects/CurrencyCode';
import { WeekStart } from '../value-objects/WeekStart';
import { DecimalPrecision } from '../value-objects/DecimalPrecision';

export interface PreferencesProps {
  id: PreferencesId;
  userId: string | null;
  appearance: AppearanceSettings;
  finance: FinanceSettings;
  defaults: DefaultSettings;
  notifications: NotificationSettings;
}

export class Preferences {
  public readonly id: PreferencesId;
  public readonly userId: string | null;
  public readonly appearance: AppearanceSettings;
  public readonly finance: FinanceSettings;
  public readonly defaults: DefaultSettings;
  public readonly notifications: NotificationSettings;

  constructor(props: PreferencesProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.appearance = props.appearance;
    this.finance = props.finance;
    this.defaults = props.defaults;
    this.notifications = props.notifications;

    Object.freeze(this);
  }

  public static createDefault(id?: PreferencesId, userId?: string | null): Preferences {
    return new Preferences({
      id: id ?? new PreferencesId('default-preferences'),
      userId: userId ?? null,
      appearance: AppearanceSettings.createDefault(),
      finance: FinanceSettings.createDefault(),
      defaults: DefaultSettings.createDefault(),
      notifications: NotificationSettings.createDefault(),
    });
  }

  public updateTheme(theme: Theme): Preferences {
    return this.updateAppearance(new AppearanceSettings({ theme }));
  }

  public updateCurrency(currencyCode: CurrencyCode): Preferences {
    return this.updateFinance(
      new FinanceSettings({
        currencyCode,
        weekStart: this.finance.weekStart,
        decimalPrecision: this.finance.decimalPrecision,
      })
    );
  }

  public updateWeekStart(weekStart: WeekStart): Preferences {
    return this.updateFinance(
      new FinanceSettings({
        currencyCode: this.finance.currencyCode,
        weekStart,
        decimalPrecision: this.finance.decimalPrecision,
      })
    );
  }

  public updateDecimalPrecision(decimalPrecision: DecimalPrecision): Preferences {
    return this.updateFinance(
      new FinanceSettings({
        currencyCode: this.finance.currencyCode,
        weekStart: this.finance.weekStart,
        decimalPrecision,
      })
    );
  }

  public updateAppearance(appearance: AppearanceSettings): Preferences {
    return new Preferences({
      id: this.id,
      userId: this.userId,
      appearance,
      finance: this.finance,
      defaults: this.defaults,
      notifications: this.notifications,
    });
  }

  public updateFinance(finance: FinanceSettings): Preferences {
    return new Preferences({
      id: this.id,
      userId: this.userId,
      appearance: this.appearance,
      finance,
      defaults: this.defaults,
      notifications: this.notifications,
    });
  }

  public updateDefaults(defaults: DefaultSettings): Preferences {
    return new Preferences({
      id: this.id,
      userId: this.userId,
      appearance: this.appearance,
      finance: this.finance,
      defaults,
      notifications: this.notifications,
    });
  }

  public updateNotifications(notifications: NotificationSettings): Preferences {
    return new Preferences({
      id: this.id,
      userId: this.userId,
      appearance: this.appearance,
      finance: this.finance,
      defaults: this.defaults,
      notifications,
    });
  }
}
