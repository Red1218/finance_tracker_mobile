import { CurrencyCode } from './CurrencyCode';
import { WeekStart } from './WeekStart';
import { DecimalPrecision } from './DecimalPrecision';

export interface FinanceSettingsProps {
  currencyCode: CurrencyCode;
  weekStart: WeekStart;
  decimalPrecision: DecimalPrecision;
}

export class FinanceSettings {
  public readonly currencyCode: CurrencyCode;
  public readonly weekStart: WeekStart;
  public readonly decimalPrecision: DecimalPrecision;

  constructor(props: FinanceSettingsProps) {
    this.currencyCode = props.currencyCode;
    this.weekStart = props.weekStart;
    this.decimalPrecision = props.decimalPrecision;
    Object.freeze(this);
  }

  public static createDefault(): FinanceSettings {
    return new FinanceSettings({
      currencyCode: new CurrencyCode('INR'),
      weekStart: WeekStart.Monday,
      decimalPrecision: DecimalPrecision.Two,
    });
  }
}
