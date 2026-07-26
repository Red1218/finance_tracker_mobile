import { SupabaseClient } from '@supabase/supabase-js';
import { ISyncTransportProvider, TransportPushResult } from '../../../features/sync/application';
import { SyncOperation } from '../../../features/sync/domain';
import { supabase } from '../../../database';

export class SupabaseSyncTransportProvider implements ISyncTransportProvider {
  constructor(private readonly client: SupabaseClient = supabase) {
    Object.freeze(this);
  }

  private resolveTableName(entityType: string): string {
    switch (entityType) {
      case 'ACCOUNT':
        return 'accounts';
      case 'TRANSACTION':
        return 'transactions';
      case 'CATEGORY':
        return 'categories';
      case 'BUDGET':
        return 'budgets';
      case 'PREFERENCE':
        return 'preferences';
      default:
        throw new Error(`Unsupported sync entity type: ${entityType}`);
    }
  }

  public async pushOperation(operation: SyncOperation): Promise<TransportPushResult> {
    try {
      const table = this.resolveTableName(operation.target.entityType);
      const payload = operation.payloadSnapshot;

      if (operation.operationType === 'CREATE' || operation.operationType === 'UPDATE') {
        const { error } = await this.client
          .from(table)
          .upsert({ ...payload, id: operation.target.entityId });

        if (error) {
          const isConflict = error.code === '409' || error.code === '23505';
          return { success: false, conflict: isConflict, error: error.message };
        }
      } else if (operation.operationType === 'DELETE') {
        const { error } = await this.client
          .from(table)
          .delete()
          .eq('id', operation.target.entityId);

        if (error) {
          return { success: false, error: error.message };
        }
      } else if (operation.operationType === 'VOID') {
        const { error } = await this.client
          .from(table)
          .update({ voided_at: new Date().toISOString() })
          .eq('id', operation.target.entityId);

        if (error) {
          return { success: false, error: error.message };
        }
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Transport push failed' };
    }
  }
}
