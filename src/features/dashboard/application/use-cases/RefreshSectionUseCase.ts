import { RefreshSectionCommand } from '../commands/RefreshSectionCommand';
import { SectionViewModel } from '../view-models/SectionViewModel';
import { CommandValidator } from '../validation/CommandValidator';
import { DashboardReadRepository } from '../ports/DashboardReadRepository';
import { FinancialSummaryService } from '../../domain/services/FinancialSummaryService';
import { BudgetHealthService } from '../../domain/services/BudgetHealthService';
import { CategoryBreakdownService } from '../../domain/services/CategoryBreakdownService';
import { RecentActivityService } from '../../domain/services/RecentActivityService';
import { KPICardMapper } from '../mappers/KPICardMapper';
import { BudgetHealthMapper } from '../mappers/BudgetHealthMapper';
import { CategoryBreakdownMapper } from '../mappers/CategoryBreakdownMapper';
import { RecentActivityMapper } from '../mappers/RecentActivityMapper';
import { Logger } from '../ports/Logger';
import { ReportingPeriod, PeriodType } from '../../domain/value-objects/ReportingPeriod';

export class RefreshSectionUseCase {
  constructor(
    private readonly repository: DashboardReadRepository,
    private readonly financialSummaryService: FinancialSummaryService,
    private readonly budgetHealthService: BudgetHealthService,
    private readonly categoryBreakdownService: CategoryBreakdownService,
    private readonly recentActivityService: RecentActivityService,
    private readonly logger: Logger
  ) {}

  async execute(command: RefreshSectionCommand): Promise<SectionViewModel<any>> {
    CommandValidator.validateRefreshSection(command);
    this.logger.info(`Executing RefreshSectionCommand for ${command.sectionType}`, { correlationId: command.correlationId });

    try {
      // Fetch full snapshot since we only have a coarse-grained repo
      const snapshot = await this.repository.getDashboardData(command.userId);

      switch (command.sectionType) {
        case 'KPI': {
          const period = new ReportingPeriod(snapshot.activeReportingPeriodId as PeriodType, snapshot.startDate, snapshot.endDate);
          const summary = this.financialSummaryService.calculate([...snapshot.transactions], period, 'USD');
          return KPICardMapper.mapToViewModel(summary);
        }
        case 'BudgetHealth': {
          const period = new ReportingPeriod(snapshot.activeReportingPeriodId as PeriodType, snapshot.startDate, snapshot.endDate);
          const budgetHealth = this.budgetHealthService.calculateStatus([...snapshot.budgets], [...snapshot.transactions], period);
          return BudgetHealthMapper.mapToViewModel(budgetHealth);
        }
        case 'CategoryBreakdown': {
          const period = new ReportingPeriod(snapshot.activeReportingPeriodId as PeriodType, snapshot.startDate, snapshot.endDate);
          const categoryBreakdown = this.categoryBreakdownService.calculateBreakdown([...snapshot.categories], [...snapshot.transactions], period, 'USD');
          return CategoryBreakdownMapper.mapToViewModel(categoryBreakdown, snapshot.categories.reduce((acc, cat) => {
            acc[cat.id] = cat.name;
            return acc;
          }, {} as Record<string, string>));
        }
        case 'RecentActivity': {
          const recentActivity = this.recentActivityService.getRecentActivity([...snapshot.transactions], 10);
          return RecentActivityMapper.mapToViewModel(recentActivity);
        }
        default:
          throw new Error('Unknown section type');
      }
    } catch (error: any) {
      this.logger.error(`Failed to refresh section ${command.sectionType}`, error, { correlationId: command.correlationId });
      
      // Map error for specific section
      switch (command.sectionType) {
        case 'KPI': return KPICardMapper.mapError(error, 'retry-kpi');
        case 'BudgetHealth': return BudgetHealthMapper.mapError(error, 'retry-budget');
        case 'CategoryBreakdown': return CategoryBreakdownMapper.mapError(error, 'retry-category');
        case 'RecentActivity': return RecentActivityMapper.mapError(error, 'retry-activity');
        default: throw error;
      }
    }
  }
}
