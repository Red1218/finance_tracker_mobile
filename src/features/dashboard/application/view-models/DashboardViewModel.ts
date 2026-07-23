import { KPICardViewModel } from './KPICardViewModel';
import { BudgetHealthViewModel } from './BudgetHealthViewModel';
import { CategoryBreakdownViewModel } from './CategoryBreakdownViewModel';
import { RecentActivityViewModel } from './RecentActivityViewModel';
import { LoadStatus } from './BaseViewModel';
export { SectionViewModel } from './SectionViewModel';


export interface DashboardViewModel {
  readonly activeReportingPeriodId: string;
  readonly activeReportingPeriodLabel: string;
  readonly overallStatus: LoadStatus;
  readonly error: string | null;
  readonly kpiSection: KPICardViewModel;
  readonly budgetHealthSection: BudgetHealthViewModel;
  readonly categoryBreakdownSection: CategoryBreakdownViewModel;
  readonly recentActivitySection: RecentActivityViewModel;
  readonly lastUpdated: Date;
}
