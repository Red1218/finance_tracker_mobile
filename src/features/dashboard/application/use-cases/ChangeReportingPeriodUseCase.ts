import { ChangeReportingPeriodCommand } from '../commands/ChangeReportingPeriodCommand';
import { DashboardViewModel } from '../view-models/DashboardViewModel';
import { CommandValidator } from '../validation/CommandValidator';
import { LoadDashboardUseCase } from './LoadDashboardUseCase';
import { EventDispatcher } from '../ports/EventDispatcher';
import { ReportingPeriodChangedEvent } from '../../domain/events/ReportingPeriodChangedEvent';
import { Logger } from '../ports/Logger';
import { ReportingPeriod } from '../../domain/value-objects/ReportingPeriod';

export class ChangeReportingPeriodUseCase {
  constructor(
    private readonly loadDashboardUseCase: LoadDashboardUseCase,
    private readonly eventDispatcher: EventDispatcher,
    private readonly logger: Logger
  ) {}

  async execute(command: ChangeReportingPeriodCommand): Promise<DashboardViewModel> {
    CommandValidator.validateChangeReportingPeriod(command);
    this.logger.info('Executing ChangeReportingPeriodCommand', { correlationId: command.correlationId });

    // Map command's periodType to the domain PeriodType and build a ReportingPeriod
    const periodTypeMap: Record<string, import('../../domain/value-objects/ReportingPeriod').PeriodType> = {
      'CURRENT_MONTH': 'CurrentMonth',
      'LAST_MONTH': 'LastMonth',
      'CUSTOM': 'CustomRange',
    };
    const domainPeriodType = periodTypeMap[command.periodType] ?? 'CurrentMonth';
    const now = new Date();
    const newPeriod = new ReportingPeriod(
      domainPeriodType,
      command.customStartDate ?? now,
      command.customEndDate ?? now
    );
    const event = new ReportingPeriodChangedEvent(command.userId, newPeriod);
    await this.eventDispatcher.dispatch(event);

    // We orchestrate the reload of the dashboard using the LoadDashboardUseCase
    // We would map the periodType to an ID or structure that LoadDashboardUseCase understands.
    // For simplicity, we pass periodType as the reportingPeriodId
    return this.loadDashboardUseCase.execute({
      correlationId: command.correlationId,
      userId: command.userId,
      reportingPeriodId: command.periodType
    });
  }
}
