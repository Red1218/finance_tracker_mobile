import { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from '../BaseRepository';
import { RepositoryResult, Result } from '../RepositoryResult';
import { RepositoryError } from '../RepositoryError';
import { IBillPaymentRepository } from '../../../features/bills/application/ports/IBillPaymentRepository';
import { BillId, BillPayment } from '../../../features/bills/domain';
import { BillPaymentMapper } from './BillPaymentMapper';
import { BillPaymentRow } from '../../../features/bills/contracts/BillPaymentRow';
import { supabase } from '../../../database';

export class SupabaseBillPaymentRepository extends BaseRepository implements IBillPaymentRepository {
  private static readonly TABLE = 'bill_payments';
  private static readonly COLUMNS =
    'id,bill_id,user_id,occurrence_key,paid_at,amount,currency_code,linked_transaction_id,created_at';

  constructor(client: SupabaseClient = supabase) {
    super(client);
    Object.freeze(this);
  }

  public async findPaymentByOccurrence(
    billId: BillId,
    occurrenceKey: string
  ): Promise<RepositoryResult<BillPayment | null, RepositoryError>> {
    try {
      const { data, error } = await this.client
        .from(SupabaseBillPaymentRepository.TABLE)
        .select(SupabaseBillPaymentRepository.COLUMNS)
        .eq('bill_id', billId.value)
        .eq('occurrence_key', occurrenceKey)
        .maybeSingle();

      if (error) {
        return this.handleError(error, { operation: 'findPaymentByOccurrence', billId: billId.value, occurrenceKey });
      }

      if (!data) {
        return Result.success(null);
      }

      return Result.success(BillPaymentMapper.toDomain(data as BillPaymentRow));
    } catch (e) {
      return this.handleError(e, { operation: 'findPaymentByOccurrence', billId: billId.value, occurrenceKey });
    }
  }

  public async save(payment: BillPayment): Promise<RepositoryResult<void, RepositoryError>> {
    try {
      const row = BillPaymentMapper.toPersistence(payment);
      const { error } = await this.client
        .from(SupabaseBillPaymentRepository.TABLE)
        .upsert(row);

      if (error) {
        return this.handleError(error, { operation: 'save', id: payment.id.value });
      }

      return Result.success(undefined);
    } catch (e) {
      return this.handleError(e, { operation: 'save', id: payment.id.value });
    }
  }
}
