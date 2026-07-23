import { ReportingPeriod } from '../value-objects/ReportingPeriod';
import { DashboardSection } from './DashboardSection';
import { FinancialSummary } from '../value-objects/FinancialSummary';
import { BudgetHealthStatus } from '../value-objects/BudgetHealthStatus';
import { CategorySpendSummary } from '../value-objects/CategorySpendSummary';
import { TransactionSnapshot } from '../snapshots/TransactionSnapshot';
import { ReportingPeriodChangedEvent } from '../events/ReportingPeriodChangedEvent';

export class Dashboard {
  private _activePeriod: ReportingPeriod;
  private _events: any[] = [];
  
  public readonly summarySection: DashboardSection<FinancialSummary>;
  public readonly budgetHealthSection: DashboardSection<BudgetHealthStatus[]>;
  public readonly categoryBreakdownSection: DashboardSection<CategorySpendSummary[]>;
  public readonly recentActivitySection: DashboardSection<TransactionSnapshot[]>;

  constructor(
    public readonly id: string,
    initialPeriod: ReportingPeriod
  ) {
    this._activePeriod = initialPeriod;
    this.summarySection = new DashboardSection<FinancialSummary>('summary');
    this.budgetHealthSection = new DashboardSection<BudgetHealthStatus[]>('budget-health');
    this.categoryBreakdownSection = new DashboardSection<CategorySpendSummary[]>('category-breakdown');
    this.recentActivitySection = new DashboardSection<TransactionSnapshot[]>('recent-activity');
  }

  get activePeriod(): ReportingPeriod {
    return this._activePeriod;
  }

  get events(): any[] {
    return [...this._events];
  }

  clearEvents(): void {
    this._events = [];
  }

  changeReportingPeriod(newPeriod: ReportingPeriod): void {
    if (this._activePeriod.equals(newPeriod)) {
      return;
    }
    
    // INV-001: All Dashboard Sections are scoped to the same active ReportingPeriod.
    // Changing the period must trigger a reload of scoped sections.
    this._activePeriod = newPeriod;
    
    this.summarySection.markLoading();
    this.budgetHealthSection.markLoading();
    this.categoryBreakdownSection.markLoading();
    this.recentActivitySection.markLoading();
    
    this._events.push(new ReportingPeriodChangedEvent(this.id, newPeriod));
  }
}
