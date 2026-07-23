import { describe, it, expect } from 'vitest';
import { DashboardViewModelMapper } from '../../mappers/DashboardViewModelMapper';
import { Dashboard } from '../../../domain/entities/Dashboard';
import { ReportingPeriod } from '../../../domain/value-objects/ReportingPeriod';
import { KPICardViewModel } from '../../view-models/KPICardViewModel';
import { BudgetHealthViewModel } from '../../view-models/BudgetHealthViewModel';
import { CategoryBreakdownViewModel } from '../../view-models/CategoryBreakdownViewModel';
import { RecentActivityViewModel } from '../../view-models/RecentActivityViewModel';

describe('DashboardViewModelMapper', () => {
  it('should map successful dashboard to view model', () => {
    const period = new ReportingPeriod('CurrentMonth', new Date(), new Date());
    const dashboard = new Dashboard('user1', period);
    
    const kpi: KPICardViewModel = { sectionType: 'KPI', status: 'Loaded', isLoading: false, isEmpty: false, error: null, retryToken: null, lastUpdated: new Date(), content: null as any };
    const budget: BudgetHealthViewModel = { sectionType: 'BudgetHealth', status: 'Loaded', isLoading: false, isEmpty: false, error: null, retryToken: null, lastUpdated: new Date(), content: null as any };
    const category: CategoryBreakdownViewModel = { sectionType: 'CategoryBreakdown', status: 'Loaded', isLoading: false, isEmpty: false, error: null, retryToken: null, lastUpdated: new Date(), content: null as any };
    const activity: RecentActivityViewModel = { sectionType: 'RecentActivity', status: 'Loaded', isLoading: false, isEmpty: false, error: null, retryToken: null, lastUpdated: new Date(), content: null as any };

    const vm = DashboardViewModelMapper.mapToViewModel(dashboard, kpi, budget, category, activity);

    expect(vm.overallStatus).toBe('Loaded');
    expect(vm.activeReportingPeriodLabel).toContain('Period:');
    expect(vm.kpiSection).toBe(kpi);
  });

  it('should map to Error if all sections fail', () => {
    const period = new ReportingPeriod('CurrentMonth', new Date(), new Date());
    const dashboard = new Dashboard('user1', period);
    
    const kpi: KPICardViewModel = { sectionType: 'KPI', status: 'Error', isLoading: false, isEmpty: false, error: 'e', retryToken: null, lastUpdated: new Date(), content: null as any };
    const budget: BudgetHealthViewModel = { sectionType: 'BudgetHealth', status: 'Error', isLoading: false, isEmpty: false, error: 'e', retryToken: null, lastUpdated: new Date(), content: null as any };
    const category: CategoryBreakdownViewModel = { sectionType: 'CategoryBreakdown', status: 'Error', isLoading: false, isEmpty: false, error: 'e', retryToken: null, lastUpdated: new Date(), content: null as any };
    const activity: RecentActivityViewModel = { sectionType: 'RecentActivity', status: 'Error', isLoading: false, isEmpty: false, error: 'e', retryToken: null, lastUpdated: new Date(), content: null as any };

    const vm = DashboardViewModelMapper.mapToViewModel(dashboard, kpi, budget, category, activity);

    expect(vm.overallStatus).toBe('Error');
    expect(vm.error).toBe('Failed to load dashboard');
  });

  it('should map total error', () => {
    const error = new Error('Global repo error');
    const vm = DashboardViewModelMapper.mapTotalError(error);

    expect(vm.overallStatus).toBe('Error');
    expect(vm.error).toBe('Global repo error');
    expect(vm.kpiSection.status).toBe('Error');
    expect(vm.budgetHealthSection.status).toBe('Error');
    expect(vm.categoryBreakdownSection.status).toBe('Error');
    expect(vm.recentActivitySection.status).toBe('Error');
  });
});
