import { SyncDomainError, SyncStatus } from '../../domain';
import { ISyncQueueRepository } from '../repositories/ISyncQueueRepository';

export interface ResolveConflictCommand {
  itemId: string;
  resolvedPayload?: Record<string, unknown>;
}

export class ResolveSyncConflictUseCase {
  constructor(private readonly queueRepository: ISyncQueueRepository) {
    Object.freeze(this);
  }

  public async execute(command: ResolveConflictCommand): Promise<boolean> {
    const item = await this.queueRepository.getItemById(command.itemId);
    if (!item) {
      throw new SyncDomainError('UNRESOLVED_CONFLICT', `Sync item ${command.itemId} not found.`);
    }

    if (item.status !== SyncStatus.CONFLICT) {
      throw new SyncDomainError('UNRESOLVED_CONFLICT', `Item ${command.itemId} is not in CONFLICT state.`);
    }

    // Force transition to IN_PROGRESS -> PENDING retry after resolving
    (item as any)._status = SyncStatus.PENDING;
    await this.queueRepository.update(item);
    return true;
  }
}
