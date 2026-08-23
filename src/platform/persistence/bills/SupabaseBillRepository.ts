import { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from '../BaseRepository';
import { RepositoryResult, Result } from '../RepositoryResult';
import { RepositoryError } from '../RepositoryError';
import { IBillRepository } from '../../../features/bills/application/ports/IBillRepository';
import { Bill, BillId, BillPayment } from '../../../features/bills/domain';
import { BillMapper } from './BillMapper';
import { BillRow } from '../../../features/bills/contracts/BillRow';
import { supabase } from '../../../database';

export class SupabaseBillRepository extends BaseRepository implements IBillRepository {
  private static readonly TABLE = 'bills';
  private static readonly COLUMNS =
    'id,user_id,category_id,name,amount,currency_code,recurrence_kind,anchor_day_of_month,next_due_date,created_at,updated_at,archived_at';

  constructor(client: SupabaseClient = supabase) {
    super(client);
    Object.freeze(this);
  }

  public async findById(id: BillId): Promise<RepositoryResult<Bill | null, RepositoryError>> {
    try {
      const { data, error } = await this.client
        .from(SupabaseBillRepository.TABLE)
        .select(SupabaseBillRepository.COLUMNS)
        .eq('id', id.value)
        .maybeSingle();

      if (error) {
        return this.handleError(error, { operation: 'findById', id: id.value });
      }

      if (!data) {
        return Result.success(null);
      }

      return Result.success(BillMapper.toDomain(data as BillRow));
    } catch (e) {
      return this.handleError(e, { operation: 'findById', id: id.value });
    }
  }

  public async findUpcoming(
    userId: string,
    windowDays: number,
    asOf: Date
  ): Promise<RepositoryResult<Bill[], RepositoryError>> {
    try {
      const windowEnd = new Date(asOf.getTime() + windowDays * 86400000);

      const { data, error } = await this.client
        .from(SupabaseBillRepository.TABLE)
        .select(SupabaseBillRepository.COLUMNS)
        .eq('user_id', userId)
        .is('archived_at', null)
        .lte('next_due_date', windowEnd.toISOString())
        .order('next_due_date', { ascending: true });

      if (error) {
        return this.handleError(error, { operation: 'findUpcoming', userId, windowDays, asOf: asOf.toISOString() });
      }

      const bills = (data as BillRow[] || []).map((row) => BillMapper.toDomain(row));
      return Result.success(bills);
    } catch (e) {
      return this.handleError(e, { operation: 'findUpcoming', userId, windowDays, asOf: asOf.toISOString() });
    }
  }

  public async save(bill: Bill): Promise<RepositoryResult<void, RepositoryError>> {
    try {
      const row = BillMapper.toPersistence(bill);
      const { error } = await this.client
        .from(SupabaseBillRepository.TABLE)
        .upsert(row);

      if (error) {
        return this.handleError(error, { operation: 'save', id: bill.id.value });
      }

      return Result.success(undefined);
    } catch (e) {
      return this.handleError(e, { operation: 'save', id: bill.id.value });
    }
  }

  public async savePaymentAndBill(
    payment: BillPayment,
    updatedBill: Bill
  ): Promise<RepositoryResult<void, RepositoryError>> {
    try {
      const { error } = await this.client.rpc('save_bill_payment_atomic', {
        p_payment_id: payment.id.value,
        p_bill_id: payment.billId.value,
        p_user_id: payment.userId,
        p_occurrence_key: payment.occurrenceKey,
        p_paid_at: payment.paidAt.toISOString(),
        p_payment_amount: payment.amount.amount,
        p_payment_currency: payment.amount.currencyCode.value,
        p_linked_transaction_id: payment.linkedTransactionId,
        p_bill_next_due_date: updatedBill.nextDueDate.value.toISOString(),
        p_bill_updated_at: updatedBill.updatedAt.toISOString(),
        p_bill_archived_at: updatedBill.archivedAt ? updatedBill.archivedAt.toISOString() : null,
      });

      if (error) {
        return this.handleError(error, {
          operation: 'savePaymentAndBill',
          paymentId: payment.id.value,
          billId: updatedBill.id.value,
        });
      }

      return Result.success(undefined);
    } catch (e) {
      return this.handleError(e, {
        operation: 'savePaymentAndBill',
        paymentId: payment.id.value,
        billId: updatedBill.id.value,
      });
    }
  }
}
