import { LoadDashboardUseCase } from '../use-cases/LoadDashboardUseCase';
import { ChangeReportingPeriodUseCase } from '../use-cases/ChangeReportingPeriodUseCase';
import { RefreshSectionUseCase } from '../use-cases/RefreshSectionUseCase';
import { ExecuteQuickActionUseCase } from '../use-cases/ExecuteQuickActionUseCase';

import { LoadDashboardCommand } from '../commands/LoadDashboardCommand';
import { ChangeReportingPeriodCommand } from '../commands/ChangeReportingPeriodCommand';
import { RefreshSectionCommand } from '../commands/RefreshSectionCommand';
import { ExecuteQuickActionCommand } from '../commands/ExecuteQuickActionCommand';

import { DashboardViewModel, SectionViewModel } from '../view-models/DashboardViewModel';

export class DashboardFacade {
  constructor(
    private readonly loadDashboardUseCase: LoadDashboardUseCase,
    private readonly changeReportingPeriodUseCase: ChangeReportingPeriodUseCase,
    private readonly refreshSectionUseCase: RefreshSectionUseCase,
    private readonly executeQuickActionUseCase: ExecuteQuickActionUseCase
  ) {}

  async loadDashboard(command: LoadDashboardCommand): Promise<DashboardViewModel> {
    return this.loadDashboardUseCase.execute(command);
  }

  async changeReportingPeriod(command: ChangeReportingPeriodCommand): Promise<DashboardViewModel> {
    return this.changeReportingPeriodUseCase.execute(command);
  }

  async refreshSection(command: RefreshSectionCommand): Promise<SectionViewModel<any>> {
    return this.refreshSectionUseCase.execute(command);
  }

  async executeQuickAction(command: ExecuteQuickActionCommand): Promise<void> {
    return this.executeQuickActionUseCase.execute(command);
  }
}
