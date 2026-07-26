import { 
  SyncTarget, 
  SyncOperation, 
  SyncQueueItem, 
  SyncEntityType, 
  SyncOperationType, 
  SyncConflictStrategy 
} from '../../domain';
import { ISyncQueueRepository } from '../repositories/ISyncQueueRepository';

export interface EnqueueSyncOperationCommand {
  operationType: SyncOperationType;
  entityType: SyncEntityType;
  entityId: string;
  payloadSnapshot: Record<string, unknown>;
  correlationId?: string;
  maxRetries?: number;
  conflictStrategy?: SyncConflictStrategy;
}

export class EnqueueSyncOperationUseCase {
  constructor(private readonly queueRepository: ISyncQueueRepository) {
    Object.freeze(this);
  }

  public async execute(command: EnqueueSyncOperationCommand): Promise<string> {
    const target = new SyncTarget(command.entityType, command.entityId);
    const operation = new SyncOperation({
      operationType: command.operationType,
      target,
      payloadSnapshot: command.payloadSnapshot,
      correlationId: command.correlationId,
    });

    const itemId = `sync-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const queueItem = new SyncQueueItem({
      id: itemId,
      operation,
      maxRetries: command.maxRetries ?? 3,
      conflictStrategy: command.conflictStrategy ?? SyncConflictStrategy.SERVER_WINS,
    });

    await this.queueRepository.enqueue(queueItem);
    return queueItem.id;
  }
}
