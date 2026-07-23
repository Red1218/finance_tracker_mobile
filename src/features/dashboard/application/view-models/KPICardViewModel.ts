import { SectionViewModel } from './SectionViewModel';
import { TrendIndicatorViewModel } from './TrendIndicatorViewModel';

export interface KPIData {
  readonly totalBalance: string;
  readonly periodIncome: string;
  readonly periodExpenses: string;
  readonly netForPeriod: string;
  readonly incomeTrend: TrendIndicatorViewModel;
  readonly expenseTrend: TrendIndicatorViewModel;
}

export interface KPICardViewModel extends SectionViewModel<KPIData> {
  readonly sectionType: 'KPI';
}
