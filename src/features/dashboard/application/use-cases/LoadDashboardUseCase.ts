import { LoadDashboardCommand } from '../commands/LoadDashboardCommand';
import { DashboardViewModel } from '../view-models/DashboardViewModel';
import { DashboardReadRepository } from '../ports/DashboardReadRepository';
import { CommandValidator } from '../validation/CommandValidator';
import { Dashboard } from '../../domain/entities/Dashboard';
import { ReportingPeriod } from '../../domain/value-objects/ReportingPeriod';
import { FinancialSummaryService } from '../../domain/services/FinancialSummaryService';
import { BudgetHealthService } from '../../domain/services/BudgetHealthService';
import { CategoryBreakdownService } from '../../domain/services/CategoryBreakdownService';
import { RecentActivityService } from '../../domain/services/RecentActivityService';
import { KPICardMapper } from '../mappers/KPICardMapper';
import { BudgetHealthMapper } from '../mappers/BudgetHealthMapper';
import { CategoryBreakdownMapper } from '../mappers/CategoryBreakdownMapper';
import { RecentActivityMapper } from '../mappers/RecentActivityMapper';
import { DashboardViewModelMapper } from '../mappers/DashboardViewModelMapper';
import { Logger } from '../ports/Logger';

export class LoadDashboardUseCase {
  constructor(
    private readonly repository: DashboardReadRepository,
    private readonly logger: Logger,
    private readonly financialSummaryService: FinancialSummaryService,
    private readonly budgetHealthService: BudgetHealthService,
    private readonly categoryBreakdownService: CategoryBreakdownService,
    private readonly recentActivityService: RecentActivityService
  ) {}

  async execute(command: LoadDashboardCommand): Promise<DashboardViewModel> {
    try {
      CommandValidator.validateLoadDashboard(command);
      this.logger.info('Executing LoadDashboardCommand', { correlationId: command.correlationId });

      // Fetch coarse-grained snapshot
      const snapshot = await this.repository.getDashboardData(command.userId, command.reportingPeriodId);

      // Reconstruct core domain objects needed for orchestration
      const periodType = (command.reportingPeriodId || snapshot.activeReportingPeriodId || 'CurrentMonth') as any;
      const period = new ReportingPeriod(periodType, snapshot.startDate, snapshot.endDate);
      const dashboard = new Dashboard(command.userId, period);

      // We run all section domain services concurrently
      const [kpiResult, budgetResult, categoryResult, activityResult] = await Promise.allSettled([
        Promise.resolve(this.financialSummaryService.calculate([...snapshot.transactions], period, 'INR')),
        Promise.resolve(this.budgetHealthService.calculateStatus([...snapshot.budgets], [...snapshot.transactions], period)),
        Promise.resolve(this.categoryBreakdownService.calculateBreakdown([...snapshot.categories], [...snapshot.transactions], period, 'INR')),
        Promise.resolve(this.recentActivityService.getRecentActivity([...snapshot.transactions], 10))
      ]);

      // Map each result to its ViewModel, handling partial failures
      const kpiSection = kpiResult.status === 'fulfilled' 
        ? KPICardMapper.mapToViewModel(kpiResult.value)
        : KPICardMapper.mapError(kpiResult.reason, 'retry-kpi');

      const categoriesMap = snapshot.categories.reduce((acc, cat) => {
        acc[cat.id] = cat.name;
        return acc;
      }, {} as Record<string, string>);

      const budgetSection = budgetResult.status === 'fulfilled'
        ? BudgetHealthMapper.mapToViewModel(budgetResult.value, categoriesMap)
        : BudgetHealthMapper.mapError(budgetResult.reason, 'retry-budget');

      const categorySection = categoryResult.status === 'fulfilled'
        ? CategoryBreakdownMapper.mapToViewModel(categoryResult.value, snapshot.categories.reduce((acc, cat) => {
            acc[cat.id] = cat.name;
            return acc;
          }, {} as Record<string, string>))
        : CategoryBreakdownMapper.mapError(categoryResult.reason, 'retry-category');

      const activitySection = activityResult.status === 'fulfilled'
        ? RecentActivityMapper.mapToViewModel(activityResult.value)
        : RecentActivityMapper.mapError(activityResult.reason, 'retry-activity');

      // Assemble final view model
      return DashboardViewModelMapper.mapToViewModel(dashboard, kpiSection, budgetSection, categorySection, activitySection);

    } catch (error: any) {
      this.logger.error('LoadDashboardCommand failed', error, { correlationId: command.correlationId });
      return DashboardViewModelMapper.mapTotalError(error);
    }
  }
}
