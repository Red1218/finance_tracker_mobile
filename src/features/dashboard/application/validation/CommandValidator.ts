import { LoadDashboardCommand } from '../commands/LoadDashboardCommand';
import { ChangeReportingPeriodCommand } from '../commands/ChangeReportingPeriodCommand';
import { RefreshSectionCommand } from '../commands/RefreshSectionCommand';
import { ExecuteQuickActionCommand } from '../commands/ExecuteQuickActionCommand';

export class CommandValidator {
  static validateLoadDashboard(command: LoadDashboardCommand): void {
    if (!command.correlationId) throw new Error('Missing correlationId');
    if (!command.userId) throw new Error('Missing userId');
  }

  static validateChangeReportingPeriod(command: ChangeReportingPeriodCommand): void {
    if (!command.correlationId) throw new Error('Missing correlationId');
    if (!command.userId) throw new Error('Missing userId');
    if (!command.periodType) throw new Error('Missing periodType');
    
    if (command.periodType === 'CUSTOM') {
      if (!command.customStartDate || !command.customEndDate) {
        throw new Error('CUSTOM period requires customStartDate and customEndDate');
      }
      if (command.customStartDate > command.customEndDate) {
        throw new Error('customStartDate cannot be after customEndDate');
      }
    }
  }

  static validateRefreshSection(command: RefreshSectionCommand): void {
    if (!command.correlationId) throw new Error('Missing correlationId');
    if (!command.userId) throw new Error('Missing userId');
    if (!command.sectionType) throw new Error('Missing sectionType');
  }

  static validateExecuteQuickAction(command: ExecuteQuickActionCommand): void {
    if (!command.correlationId) throw new Error('Missing correlationId');
    if (!command.userId) throw new Error('Missing userId');
    if (!command.actionType) throw new Error('Missing actionType');
    if (command.payload === undefined) throw new Error('Missing payload');
  }
}
