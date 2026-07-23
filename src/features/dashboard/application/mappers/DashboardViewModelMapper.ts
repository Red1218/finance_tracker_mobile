import { Dashboard } from '../../domain/entities/Dashboard';
import { DashboardViewModel } from '../view-models/DashboardViewModel';
import { KPICardViewModel } from '../view-models/KPICardViewModel';
import { BudgetHealthViewModel } from '../view-models/BudgetHealthViewModel';
import { CategoryBreakdownViewModel } from '../view-models/CategoryBreakdownViewModel';
import { RecentActivityViewModel } from '../view-models/RecentActivityViewModel';
import { LoadStatus } from '../view-models/BaseViewModel';

export class DashboardViewModelMapper {
  static mapToViewModel(
    dashboard: Dashboard,
    kpiSection: KPICardViewModel,
    budgetHealthSection: BudgetHealthViewModel,
    categoryBreakdownSection: CategoryBreakdownViewModel,
    recentActivitySection: RecentActivityViewModel
  ): DashboardViewModel {
    
    // Determine overall status
    let overallStatus: LoadStatus = 'Loaded';
    if (
      kpiSection.status === 'Error' ||
      budgetHealthSection.status === 'Error' ||
      categoryBreakdownSection.status === 'Error' ||
      recentActivitySection.status === 'Error'
    ) {
      // For now, if any section errors, we could mark overall as loaded but individual sections have errors.
      // If all error out, it's an error. Let's say if it's a total failure:
      const allErrors = [kpiSection, budgetHealthSection, categoryBreakdownSection, recentActivitySection].every(s => s.status === 'Error');
      overallStatus = allErrors ? 'Error' : 'Loaded';
    }

    return {
      activeReportingPeriodId: dashboard.activePeriod.type,
      activeReportingPeriodLabel: `Period: ${dashboard.activePeriod.startDate.toISOString()} to ${dashboard.activePeriod.endDate.toISOString()}`,
      overallStatus,
      error: overallStatus === 'Error' ? 'Failed to load dashboard' : null,
      kpiSection,
      budgetHealthSection,
      categoryBreakdownSection,
      recentActivitySection,
      lastUpdated: new Date()
    };
  }

  static mapTotalError(error: unknown): DashboardViewModel {
    const message = error instanceof Error ? error.message : String(error ?? "Unknown error");

    return {
      activeReportingPeriodId: 'Unknown',
      activeReportingPeriodLabel: 'Unknown Period',
      overallStatus: 'Error',
      error: message,
      kpiSection: this.createEmptyErrorSection('KPI') as KPICardViewModel,
      budgetHealthSection: this.createEmptyErrorSection('BudgetHealth') as BudgetHealthViewModel,
      categoryBreakdownSection: this.createEmptyErrorSection('CategoryBreakdown') as CategoryBreakdownViewModel,
      recentActivitySection: this.createEmptyErrorSection('RecentActivity') as RecentActivityViewModel,
      lastUpdated: new Date()
    };
  }

  private static createEmptyErrorSection(type: any): any {
    return {
      sectionType: type,
      status: 'Error',
      isLoading: false,
      isEmpty: false,
      error: 'Global failure',
      retryToken: 'global',
      lastUpdated: new Date(),
      content: null
    };
  }
}
