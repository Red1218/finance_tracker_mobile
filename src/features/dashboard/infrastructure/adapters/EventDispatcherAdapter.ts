import { EventDispatcher } from '../../application/ports/EventDispatcher';
import { DashboardRefreshService } from '../../application/services/DashboardRefreshService';
import { Logger } from '../../application/ports/Logger';
import { generateUUID } from '../../../../core/utils/uuid';

export class EventDispatcherAdapter implements EventDispatcher {
  constructor(
    private readonly refreshService: DashboardRefreshService,
    private readonly logger: Logger
  ) {}

  async dispatch(event: any): Promise<void> {
    const eventType = event.constructor.name || event.type;
    const userId = event.userId;
    const correlationId = event.correlationId || generateUUID();

    this.logger.info(`Event dispatched: ${eventType}`, { userId, correlationId });

    // The EventDispatcher in infrastructure knows about the application handler (DashboardRefreshService)
    // and passes the event to it. The EventDispatcher itself is just the transport mechanism.
    
    // Fire and forget, or await depending on requirements.
    // For local in-process, we await it to ensure it completes before returning.
    try {
      await this.refreshService.handleDomainEvent(eventType, userId, correlationId);
    } catch (error: any) {
      this.logger.error(`Failed to handle event ${eventType}`, error, { correlationId });
      // In a real message queue, this might trigger a NACK or Dead Letter Queue
    }
  }
}
