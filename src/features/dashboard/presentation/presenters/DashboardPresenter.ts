import { DashboardFacade } from '../../application/facade/DashboardFacade';
import { DashboardScreenState, initialDashboardScreenState } from '../models/DashboardScreenState';
import { LoadDashboardCommand } from '../../application/commands/LoadDashboardCommand';
import { ChangeReportingPeriodCommand } from '../../application/commands/ChangeReportingPeriodCommand';
import { RefreshSectionCommand } from '../../application/commands/RefreshSectionCommand';
import { ExecuteQuickActionCommand } from '../../application/commands/ExecuteQuickActionCommand';
import { generateUUID } from '../../../../core/utils/uuid';
import { DashboardViewModelMapper } from '../../application/mappers/DashboardViewModelMapper';

export class DashboardPresenter {
  private state: DashboardScreenState = { ...initialDashboardScreenState };

  constructor(
    private readonly facade: DashboardFacade,
    private readonly onStateChange: (state: DashboardScreenState) => void
  ) {}

  private updateState(partialState: Partial<DashboardScreenState>) {
    this.state = { ...this.state, ...partialState };
    this.onStateChange(this.state);
  }

  async loadDashboard(userId: string) {
    this.updateState({ isRefreshing: true });
    
    // We start with the 'CurrentMonth' as default, but a real app might restore from preferences.
    const command: LoadDashboardCommand = {
      correlationId: generateUUID(),
      userId,
      reportingPeriodId: 'CurrentMonth'
    };

    try {
      const viewModel = await this.facade.loadDashboard(command);
      
      this.updateState({
        viewModel,
        isRefreshing: false,
        lastRefresh: Date.now()
      });
    } catch (error) {
      this.updateState({
        viewModel: DashboardViewModelMapper.mapTotalError(error),
        isRefreshing: false,
        lastRefresh: Date.now()
      });
    }
  }

  async refreshDashboard(userId: string, currentPeriodId: string) {
    this.updateState({ isRefreshing: true });
    
    const command: LoadDashboardCommand = {
      correlationId: generateUUID(),
      userId,
      reportingPeriodId: currentPeriodId
    };

    const viewModel = await this.facade.loadDashboard(command);
    
    this.updateState({
      viewModel,
      isRefreshing: false,
      lastRefresh: Date.now()
    });
  }

  async changePeriod(userId: string, periodType: string, startDate?: Date, endDate?: Date) {
    // Optimistically close dropdown and set sections to loading by wiping the view model temporarily
    // Or we just show refreshing state. The architecture says "set section states to Loading".
    // We'll use the whole screen refreshing for simplicity unless granular control is needed.
    this.updateState({ isPeriodSelectorOpen: false, isRefreshing: true });
    
    const command = {
      correlationId: generateUUID(),
      userId,
      periodType: periodType as any,
      customStartDate: startDate,
      customEndDate: endDate
    };

    const viewModel = await this.facade.changeReportingPeriod(command);
    
    this.updateState({
      viewModel,
      isRefreshing: false,
      lastRefresh: Date.now()
    });
  }

  async refreshSection(userId: string, section: string, periodId: string) {
    // The command requires correlationId, userId, section, reportingPeriodId
    const command: RefreshSectionCommand = {
      correlationId: generateUUID(),
      userId,
      sectionType: section === 'KPICards' ? 'KPI' : section as any
    };

    // Before we call the facade, we could optimistically set the section to 'Refreshing'
    // in local state. But SectionViewModel from app layer doesn't have 'Refreshing', only Loading.
    // So we'll mutate the current viewModel locally to indicate refresh, then update when done.
    if (this.state.viewModel) {
      const cloned = { ...this.state.viewModel };
      if (section === 'KPICards' && cloned.kpiSection) cloned.kpiSection = { ...cloned.kpiSection, status: 'Loading' };
      if (section === 'BudgetHealth' && cloned.budgetHealthSection) cloned.budgetHealthSection = { ...cloned.budgetHealthSection, status: 'Loading' };
      if (section === 'CategoryBreakdown' && cloned.categoryBreakdownSection) cloned.categoryBreakdownSection = { ...cloned.categoryBreakdownSection, status: 'Loading' };
      if (section === 'RecentActivity' && cloned.recentActivitySection) cloned.recentActivitySection = { ...cloned.recentActivitySection, status: 'Loading' };
      
      this.updateState({ viewModel: cloned });
    }

    const updatedSection = await this.facade.refreshSection(command);

    if (this.state.viewModel) {
      const cloned = { ...this.state.viewModel };
      if (section === 'KPICards') cloned.kpiSection = updatedSection as any;
      if (section === 'BudgetHealth') cloned.budgetHealthSection = updatedSection as any;
      if (section === 'CategoryBreakdown') cloned.categoryBreakdownSection = updatedSection as any;
      if (section === 'RecentActivity') cloned.recentActivitySection = updatedSection as any;

      this.updateState({ viewModel: cloned });
    }
  }

  async executeQuickAction(userId: string, actionType: string, payload: unknown) {
    const command: ExecuteQuickActionCommand = {
      correlationId: generateUUID(),
      userId,
      actionType: actionType as any,
      payload
    };

    this.updateState({ activeModal: null }); // close modal on execute
    await this.facade.executeQuickAction(command);
    
    // Quick actions typically mutate external state, so we should refresh the dashboard.
    if (this.state.viewModel) {
      // Assuming 'CurrentMonth' as a fallback since activeReportingPeriodId isn't on viewModel
      await this.refreshDashboard(userId, 'CurrentMonth');
    }
  }

  togglePeriodSelector() {
    this.updateState({ isPeriodSelectorOpen: !this.state.isPeriodSelectorOpen });
  }

  openModal(modalId: string) {
    this.updateState({ activeModal: modalId });
  }

  closeModal() {
    this.updateState({ activeModal: null });
  }

  selectSection(sectionId: string) {
    this.updateState({ selectedSection: sectionId });
  }
}
