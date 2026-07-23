import { ExecuteQuickActionCommand } from '../commands/ExecuteQuickActionCommand';
import { CommandValidator } from '../validation/CommandValidator';
import { QuickActionGateway } from '../ports/QuickActionGateway';
import { Logger } from '../ports/Logger';

export class ExecuteQuickActionUseCase {
  constructor(
    private readonly gateway: QuickActionGateway,
    private readonly logger: Logger
  ) {}

  async execute(command: ExecuteQuickActionCommand): Promise<void> {
    CommandValidator.validateExecuteQuickAction(command);
    this.logger.info(`Executing QuickAction: ${command.actionType}`, { correlationId: command.correlationId });

    try {
      // Delegate to the correct bounded context via Gateway port
      await this.gateway.executeAction(command.actionType, command.payload);
      
      // On success, the external context should publish a domain event (e.g. TransactionAdded)
      // The Domain Event Handler Service will pick that up and trigger a refresh.
      // This use case purely delegates.
    } catch (error: any) {
      this.logger.error(`QuickAction failed: ${command.actionType}`, error, { correlationId: command.correlationId });
      throw new Error(`Failed to execute quick action: ${error.message}`);
    }
  }
}
